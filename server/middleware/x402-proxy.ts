import { Request, Response, NextFunction } from "express";
import { IStorage } from "../storage";
import { FacilitatorAdapter } from "../services/facilitator-adapter";
import { MeteringService, generateRequestId } from "../services/metering";
import { X402Utils, PaymentRequirements } from "../../client/src/lib/x402";
import { v4 as uuidv4 } from 'uuid';

export interface X402ProxyOptions {
  timeout?: number;
  retries?: number;
  facilitatorType?: "coinbase" | "x402rs" | "mock";
  enableHealthCheck?: boolean;
}

export function x402ProxyMiddleware(
  storage: IStorage, 
  facilitator: FacilitatorAdapter,
  meteringService: MeteringService,
  options: X402ProxyOptions = {}
) {
  const {
    timeout = 30000,
    retries = 3,
    enableHealthCheck = true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const requestStart = Date.now();
    let requestId = "";
    
    try {
      // Only handle proxy requests
      if (!req.path.startsWith("/proxy/")) {
        return next();
      }

      // Handle health check
      if (enableHealthCheck && req.path === "/proxy/health") {
        return res.status(200).json({ 
          status: "healthy", 
          timestamp: new Date().toISOString() 
        });
      }

      // Extract the API path from the proxy path
      const apiPath = req.path.replace(/^\/proxy/, "");
      
      // Parse the path to extract org and service info  
      const pathParts = apiPath.split('/').filter(Boolean);
      if (pathParts.length < 3) {
        return res.status(400).json({
          error: {
            code: "INVALID_PATH",
            message: "Path must be in format: /orgId/serviceId/endpointPath",
            requestId: uuidv4()
          }
        });
      }
      
      const [orgId, serviceId, ...endpointPathParts] = pathParts;
      const endpointPath = '/' + endpointPathParts.join('/');
      
      // Find the endpoint and service configuration
      const endpoint = await storage.getEndpointByPath(endpointPath, req.method);
      
      if (!endpoint || !endpoint.isActive) {
        return res.status(404).json({ 
          error: { 
            code: "ENDPOINT_NOT_FOUND",
            message: "Endpoint not found or inactive",
            requestId: uuidv4()
          }
        });
      }

      const service = await storage.getService(endpoint.serviceId);
      if (!service || !service.isActive) {
        return res.status(503).json({ 
          error: { 
            code: "SERVICE_UNAVAILABLE",
            message: "Service is currently unavailable",
            requestId: uuidv4()
          }
        });
      }

      // Get current pricing
      const pricing = await storage.getCurrentPricing(endpoint.id);
      if (!pricing) {
        return res.status(500).json({ 
          error: { 
            code: "PRICING_NOT_CONFIGURED",
            message: "Pricing not configured for this endpoint",
            requestId: uuidv4()
          }
        });
      }

      // Generate request ID for idempotency
      const payerAddress = req.headers["x-payer-address"] as string || "anonymous";
      requestId = generateRequestId(endpoint.id, payerAddress, requestStart);

      // Check free tier eligibility first
      const canUseFreeRequest = await meteringService.checkFreeTier(
        service.orgId, 
        endpoint.id, 
        payerAddress
      );

      const paymentHeader = req.headers["x-payment"] as string;
      
      if (!paymentHeader && !canUseFreeRequest) {
        // No payment and no free tier available - return 402 Payment Required
        const paymentRequirements = X402Utils.createPaymentRequirements({
          path: apiPath,
          description: endpoint.description || "API access",
          price: X402Utils.toContractUnits(pricing.price, 6),
          payTo: service.orgId, // Organization wallet
          network: pricing.network
        });

        // Create signed quote
        const signedQuote = await facilitator.createSignedQuote(paymentRequirements);
        
        // Record unpaid usage
        await meteringService.recordUsage({
          requestId,
          endpointId: endpoint.id,
          orgId: service.orgId,
          payerAddress,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          price: pricing.price,
          currency: pricing.currency,
          network: pricing.network,
          status: "unpaid",
          isFreeRequest: false,
          responseStatus: 402
        });

        const paymentResponse = X402Utils.createPaymentRequiredResponse([paymentRequirements]);
        
        // Add signed quote header
        res.setHeader("X-402-QUOTE", signedQuote);
        
        return res.status(402).json(paymentResponse);
      }

      let isFreeRequest = false;
      let proofId = "";

      if (paymentHeader) {
        // Verify payment
        const paymentRequirements = X402Utils.createPaymentRequirements({
          path: apiPath,
          description: endpoint.description || "API access",
          price: X402Utils.toContractUnits(pricing.price, 6),
          payTo: service.orgId,
          network: pricing.network
        });

        const verificationResult = await facilitator.verifyPayment(
          paymentHeader,
          paymentRequirements
        );

        if (!verificationResult.isValid) {
          // Payment verification failed
          await meteringService.recordUsage({
            requestId,
            endpointId: endpoint.id,
            orgId: service.orgId,
            payerAddress,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            price: pricing.price,
            currency: pricing.currency,
            network: pricing.network,
            status: "failed",
            isFreeRequest: false,
            responseStatus: 402,
            errorCode: "PAYMENT_VERIFICATION_FAILED"
          });

          const paymentResponse = X402Utils.createPaymentRequiredResponse(
            [paymentRequirements],
            verificationResult.invalidReason || "Payment verification failed"
          );

          return res.status(402).json(paymentResponse);
        }

        // Settlement
        const settlementResult = await facilitator.settlePayment(
          paymentHeader,
          paymentRequirements
        );

        if (!settlementResult.success) {
          await meteringService.recordUsage({
            requestId,
            endpointId: endpoint.id,
            orgId: service.orgId,
            payerAddress,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            price: pricing.price,
            currency: pricing.currency,
            network: pricing.network,
            status: "failed",
            isFreeRequest: false,
            responseStatus: 500,
            errorCode: "PAYMENT_SETTLEMENT_FAILED"
          });

          return res.status(500).json({
            error: {
              code: "SETTLEMENT_FAILED",
              message: settlementResult.error || "Payment settlement failed",
              requestId
            }
          });
        }

        proofId = settlementResult.txHash || "";
      } else if (canUseFreeRequest) {
        // Using free tier
        isFreeRequest = true;
        await meteringService.incrementFreeTierUsage(service.orgId, endpoint.id, payerAddress);
      }

      // Check compliance rules
      const complianceResult = await checkComplianceRules(
        storage,
        service.orgId,
        payerAddress,
        req.ip || "unknown"
      );

      if (!complianceResult.allowed) {
        await meteringService.recordUsage({
          requestId,
          endpointId: endpoint.id,
          orgId: service.orgId,
          payerAddress,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          price: pricing.price,
          currency: pricing.currency,
          network: pricing.network,
          status: "failed",
          isFreeRequest,
          responseStatus: 403,
          errorCode: "COMPLIANCE_VIOLATION"
        });

        return res.status(403).json({
          error: {
            code: "COMPLIANCE_VIOLATION",
            message: "Access denied by compliance rules",
            reason: complianceResult.reason,
            requestId
          }
        });
      }

      // Forward request to target API
      const targetUrl = `${service.baseUrl}${apiPath}`;
      const targetResponse = await forwardRequest(
        targetUrl,
        req,
        timeout,
        retries
      );

      const latencyMs = Date.now() - requestStart;

      // Record successful usage
      await meteringService.recordUsage({
        requestId,
        endpointId: endpoint.id,
        orgId: service.orgId,
        payerAddress,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        price: pricing.price,
        currency: pricing.currency,
        network: pricing.network,
        proofId,
        status: isFreeRequest ? "unpaid" : "paid",
        latencyMs,
        responseStatus: targetResponse.status,
        isFreeRequest
      });

      // Create escrow holding for paid requests
      if (!isFreeRequest && proofId) {
        const org = await storage.getOrganization(service.orgId);
        const escrowReleaseAt = new Date(Date.now() + (org?.escrowHoldHours || 24) * 60 * 60 * 1000);
        
        await storage.createEscrowHolding({
          orgId: service.orgId,
          usageRecordId: requestId, // Link to usage record
          amount: pricing.price,
          currency: pricing.currency,
          network: pricing.network,
          releaseAt: escrowReleaseAt,
          status: "pending",
          proofId
        });

        // Set payment response header
        if (proofId) {
          const settlementResponseHeader = X402Utils.createPaymentHeader({
            x402Version: 1,
            scheme: "exact",
            network: pricing.network,
            payload: {
              txHash: proofId,
              status: "settled",
              amount: pricing.price
            }
          });
          
          res.setHeader("X-PAYMENT-RESPONSE", settlementResponseHeader);
        }
      }

      // Set custom headers
      res.setHeader("X-Request-ID", requestId);
      res.setHeader("X-Latency-MS", latencyMs.toString());
      if (isFreeRequest) {
        res.setHeader("X-Free-Request", "true");
      }

      // Return the target API response
      res.status(targetResponse.status)
        .set(targetResponse.headers)
        .send(targetResponse.data);

    } catch (error) {
      console.error("x402 proxy error:", error);
      
      // Record failed request
      if (requestId) {
        try {
          await meteringService.recordUsage({
            requestId,
            endpointId: "",
            orgId: "",
            payerAddress: req.headers["x-payer-address"] as string || "anonymous",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            price: "0",
            currency: "USDC",
            network: "base",
            status: "failed",
            responseStatus: 500,
            errorCode: "INTERNAL_PROXY_ERROR",
            isFreeRequest: false
          });
        } catch (meteringError) {
          console.error("Failed to record error usage:", meteringError);
        }
      }
      
      res.status(500).json({
        error: {
          code: "INTERNAL_PROXY_ERROR",
          message: "Internal proxy error",
          requestId: requestId || uuidv4()
        }
      });
    }
  };
}

async function checkComplianceRules(
  storage: IStorage,
  orgId: string,
  payerAddress: string,
  clientIp: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const rules = await storage.getComplianceRules(orgId);
    
    for (const rule of rules) {
      if (!rule.isActive) continue;

      if (rule.type === "geo_block") {
        // In production, you would use a GeoIP service to get country from IP
        // For demo purposes, we'll check against a mock list
        const blockedCountries = rule.rules.countries || [];
        const mockCountry = "US"; // Mock IP geolocation
        if (blockedCountries.includes(mockCountry)) {
          return {
            allowed: false,
            reason: `Geographic access denied for country: ${mockCountry}`
          };
        }
      }

      if (rule.type === "ip_block") {
        const blockedIPs = rule.rules.ips || [];
        if (blockedIPs.includes(clientIp)) {
          return {
            allowed: false,
            reason: "IP address is blocked"
          };
        }
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
