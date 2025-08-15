import { Request, Response, NextFunction } from "express";
import { IStorage } from "../storage";
import { PaymentProcessor } from "../services/payment-processor";
import { X402Utils, PaymentRequirements } from "../../client/src/lib/x402";

export interface X402ProxyOptions {
  timeout?: number;
  retries?: number;
  userIdHeader?: string;
}

export function x402ProxyMiddleware(
  storage: IStorage, 
  paymentProcessor: PaymentProcessor,
  options: X402ProxyOptions = {}
) {
  const {
    timeout = 30000,
    retries = 3,
    userIdHeader = "x-user-id"
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only handle proxy requests
      if (!req.path.startsWith("/proxy/")) {
        return next();
      }

      // Extract the API path from the proxy path
      const apiPath = req.path.replace(/^\/proxy/, "");
      
      // Find the endpoint configuration
      const endpoint = await storage.getApiEndpointByPath(apiPath);
      if (!endpoint || !endpoint.isActive) {
        return res.status(404).json({ 
          error: "Endpoint not found or inactive",
          code: "ENDPOINT_NOT_FOUND"
        });
      }

      // Check for payment header
      const paymentHeader = req.headers["x-payment"] as string;
      
      if (!paymentHeader) {
        // No payment provided, return 402 Payment Required
        const paymentRequirements = X402Utils.createPaymentRequirements({
          path: apiPath,
          description: endpoint.description || "API access",
          price: X402Utils.toContractUnits(endpoint.price, 6),
          payTo: endpoint.userId, // In production, this would be the actual wallet address
          network: endpoint.network
        });

        const paymentResponse = X402Utils.createPaymentRequiredResponse([paymentRequirements]);

        return res.status(402).json(paymentResponse);
      }

      // Verify payment
      const paymentRequirements = X402Utils.createPaymentRequirements({
        path: apiPath,
        description: endpoint.description || "API access",
        price: X402Utils.toContractUnits(endpoint.price, 6),
        payTo: endpoint.userId,
        network: endpoint.network
      });

      const verificationResult = await paymentProcessor.verifyPayment(
        paymentHeader,
        paymentRequirements
      );

      if (!verificationResult.isValid) {
        // Payment verification failed, return 402 with error
        const paymentResponse = X402Utils.createPaymentRequiredResponse(
          [paymentRequirements],
          verificationResult.invalidReason || "Payment verification failed"
        );

        return res.status(402).json(paymentResponse);
      }

      // Parse payment to get payer address
      const paymentPayload = X402Utils.parsePaymentHeader(paymentHeader);
      const payerAddress = paymentPayload?.payload?.from || "unknown";

      // Check compliance rules
      const complianceResult = await checkComplianceRules(
        storage,
        endpoint.userId,
        payerAddress,
        req.ip || "unknown"
      );

      if (!complianceResult.allowed) {
        return res.status(403).json({
          error: "Access denied by compliance rules",
          reason: complianceResult.reason,
          code: "COMPLIANCE_VIOLATION"
        });
      }

      // Settle payment
      const settlementResult = await paymentProcessor.settlePayment(
        paymentHeader,
        paymentRequirements
      );

      if (!settlementResult.success) {
        // Settlement failed, return error
        return res.status(500).json({
          error: "Payment settlement failed",
          reason: settlementResult.error,
          code: "SETTLEMENT_FAILED"
        });
      }

      // Record transaction
      const transaction = await storage.createTransaction({
        endpointId: endpoint.id,
        payerAddress,
        amount: endpoint.price,
        currency: endpoint.priceUnit,
        status: "completed",
        txHash: settlementResult.txHash,
        escrowReleaseAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      });

      // Create escrow holding
      await storage.createEscrowHolding({
        userId: endpoint.userId,
        amount: endpoint.price,
        currency: endpoint.priceUnit,
        releaseAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "pending"
      });

      // Forward request to target API
      const targetResponse = await forwardRequest(
        endpoint.targetUrl,
        req,
        timeout,
        retries
      );

      // Set payment response header
      if (settlementResult.txHash) {
        const settlementResponseHeader = X402Utils.createPaymentHeader({
          x402Version: 1,
          scheme: paymentRequirements.scheme,
          network: paymentRequirements.network,
          payload: {
            txHash: settlementResult.txHash,
            status: "settled",
            amount: paymentRequirements.maxAmountRequired
          }
        });
        
        res.setHeader("X-PAYMENT-RESPONSE", settlementResponseHeader);
      }

      // Return the target API response
      res.status(targetResponse.status)
        .set(targetResponse.headers)
        .send(targetResponse.data);

      // Log successful request for analytics
      await logAnalytics(storage, endpoint.id, true);

    } catch (error) {
      console.error("x402 proxy error:", error);
      res.status(500).json({
        error: "Internal proxy error",
        code: "PROXY_ERROR"
      });
    }
  };
}

async function checkComplianceRules(
  storage: IStorage,
  userId: string,
  payerAddress: string,
  clientIp: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const rules = await storage.getComplianceRules(userId);
    
    for (const rule of rules) {
      if (!rule.isActive) continue;

      if (rule.type === "geo_block") {
        // In production, you would use a GeoIP service to get country from IP
        // For now, we'll skip geo-blocking
        continue;
      }

      if (rule.type === "wallet_deny" && rule.rules.addresses) {
        if (rule.rules.addresses.includes(payerAddress)) {
          return {
            allowed: false,
            reason: "Wallet address is on deny list"
          };
        }
      }

      if (rule.type === "wallet_allow" && rule.rules.addresses) {
        if (!rule.rules.addresses.includes(payerAddress)) {
          return {
            allowed: false,
            reason: "Wallet address is not on allow list"
          };
        }
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error("Compliance check error:", error);
    // Fail open - allow access if compliance check fails
    return { allowed: true };
  }
}

async function forwardRequest(
  targetUrl: string,
  req: Request,
  timeout: number,
  retries: number
): Promise<{ status: number; headers: any; data: any }> {
  const maxRetries = retries;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // In production, use a proper HTTP client like axios
      // For now, return a mock response
      const mockResponse = {
        status: 200,
        headers: { "content-type": "application/json" },
        data: {
          message: "Mock API response",
          endpoint: req.path,
          method: req.method,
          timestamp: new Date().toISOString(),
          data: generateMockApiData(req.path)
        }
      };

      return mockResponse;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw new Error(`Request failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

function generateMockApiData(path: string): any {
  if (path.includes("weather")) {
    return {
      temperature: Math.round(Math.random() * 30 + 10),
      humidity: Math.round(Math.random() * 100),
      description: "Partly cloudy",
      location: "San Francisco, CA"
    };
  }

  if (path.includes("ai-chat") || path.includes("chat")) {
    return {
      response: "This is a mock AI response. In production, this would be forwarded to the actual AI service.",
      model: "gpt-3.5-turbo",
      tokens_used: Math.round(Math.random() * 1000 + 100)
    };
  }

  if (path.includes("translate")) {
    return {
      translated_text: "This is a mock translation result.",
      source_language: "en",
      target_language: "es",
      confidence: 0.95
    };
  }

  // Default mock response
  return {
    result: "success",
    data: "Mock API response for " + path
  };
}

async function logAnalytics(
  storage: IStorage,
  endpointId: string,
  isPaid: boolean
): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // In production, you'd batch these analytics updates
    // For now, we'll just log the successful request
    console.log(`Analytics: Endpoint ${endpointId} - Paid request: ${isPaid}`);
  } catch (error) {
    console.error("Failed to log analytics:", error);
  }
}
