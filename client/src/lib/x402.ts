// x402 Protocol Types and Utilities
// Based on Coinbase x402 specification

export interface PaymentRequirements {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  outputSchema?: object | null;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra: object | null;
}

export interface PaymentRequiredResponse {
  x402Version: number;
  accepts: PaymentRequirements[];
  error?: string;
}

export interface PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: any; // scheme dependent
}

export interface VerificationRequest {
  x402Version: number;
  paymentHeader: string;
  paymentRequirements: PaymentRequirements;
}

export interface VerificationResponse {
  isValid: boolean;
  invalidReason: string | null;
}

export interface SettlementRequest {
  x402Version: number;
  paymentHeader: string;
  paymentRequirements: PaymentRequirements;
}

export interface SettlementResponse {
  success: boolean;
  error: string | null;
  txHash: string | null;
  networkId: string | null;
}

export interface SupportedSchemes {
  kinds: Array<{
    scheme: string;
    network: string;
  }>;
}

// x402 Protocol Constants
export const X402_VERSION = 1;
export const X402_PAYMENT_HEADER = "X-PAYMENT";
export const X402_PAYMENT_RESPONSE_HEADER = "X-PAYMENT-RESPONSE";

// Supported networks
export const SUPPORTED_NETWORKS = {
  BASE: "base",
  ETHEREUM: "ethereum", 
  POLYGON: "polygon",
  SOLANA: "solana"
} as const;

// Supported schemes
export const SUPPORTED_SCHEMES = {
  EXACT: "exact",
  UPTO: "upto"
} as const;

// Default payment assets
export const DEFAULT_ASSETS = {
  [SUPPORTED_NETWORKS.BASE]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  [SUPPORTED_NETWORKS.ETHEREUM]: "0xA0b86a33E6441E7c38b8F3C4b7F6e0C8a8E8E7aA", // USDC on Ethereum
  [SUPPORTED_NETWORKS.POLYGON]: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
} as const;

// Utility functions
export class X402Utils {
  /**
   * Create a Payment Required response (HTTP 402)
   */
  static createPaymentRequiredResponse(
    accepts: PaymentRequirements[],
    error?: string
  ): PaymentRequiredResponse {
    return {
      x402Version: X402_VERSION,
      accepts,
      error
    };
  }

  /**
   * Create payment requirements for an endpoint
   */
  static createPaymentRequirements(
    endpoint: {
      path: string;
      description: string;
      price: string;
      payTo: string;
      network: string;
    }
  ): PaymentRequirements {
    const asset = DEFAULT_ASSETS[endpoint.network as keyof typeof DEFAULT_ASSETS] || DEFAULT_ASSETS.BASE;
    
    return {
      scheme: SUPPORTED_SCHEMES.EXACT,
      network: endpoint.network,
      maxAmountRequired: endpoint.price,
      resource: endpoint.path,
      description: endpoint.description,
      mimeType: "application/json",
      outputSchema: null,
      payTo: endpoint.payTo,
      maxTimeoutSeconds: 30,
      asset,
      extra: {
        name: "USD Coin",
        version: "1"
      }
    };
  }

  /**
   * Parse payment payload from X-PAYMENT header
   */
  static parsePaymentHeader(headerValue: string): PaymentPayload | null {
    try {
      const decoded = Buffer.from(headerValue, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to parse payment header:', error);
      return null;
    }
  }

  /**
   * Create payment header value from payload
   */
  static createPaymentHeader(payload: PaymentPayload): string {
    const jsonString = JSON.stringify(payload);
    return Buffer.from(jsonString, 'utf-8').toString('base64');
  }

  /**
   * Validate payment requirements
   */
  static validatePaymentRequirements(requirements: PaymentRequirements): string[] {
    const errors: string[] = [];
    
    if (!requirements.scheme) {
      errors.push("Scheme is required");
    }
    
    if (!requirements.network) {
      errors.push("Network is required");
    }
    
    if (!requirements.maxAmountRequired || parseFloat(requirements.maxAmountRequired) <= 0) {
      errors.push("Valid amount is required");
    }
    
    if (!requirements.payTo) {
      errors.push("Payment address is required");
    }
    
    if (!requirements.asset) {
      errors.push("Asset address is required");
    }
    
    return errors;
  }

  /**
   * Check if a network is supported
   */
  static isSupportedNetwork(network: string): boolean {
    return Object.values(SUPPORTED_NETWORKS).includes(network as any);
  }

  /**
   * Check if a scheme is supported
   */
  static isSupportedScheme(scheme: string): boolean {
    return Object.values(SUPPORTED_SCHEMES).includes(scheme as any);
  }

  /**
   * Generate a payment request ID for tracking
   */
  static generatePaymentId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format amount for display (convert from wei-like units)
   */
  static formatAmount(amount: string, decimals: number = 6): string {
    const num = parseFloat(amount);
    return (num / Math.pow(10, decimals)).toFixed(decimals);
  }

  /**
   * Convert display amount to contract units (wei-like)
   */
  static toContractUnits(amount: string, decimals: number = 6): string {
    const num = parseFloat(amount);
    return Math.floor(num * Math.pow(10, decimals)).toString();
  }
}

// Mock payment processor for development
export class MockX402Processor {
  /**
   * Mock verification - simulates Coinbase facilitator verification
   */
  static async verifyPayment(
    paymentHeader: string,
    requirements: PaymentRequirements
  ): Promise<VerificationResponse> {
    const payload = X402Utils.parsePaymentHeader(paymentHeader);
    
    if (!payload) {
      return {
        isValid: false,
        invalidReason: "Invalid payment header format"
      };
    }

    // Simulate validation logic
    if (payload.scheme !== requirements.scheme) {
      return {
        isValid: false,
        invalidReason: "Scheme mismatch"
      };
    }

    if (payload.network !== requirements.network) {
      return {
        isValid: false,
        invalidReason: "Network mismatch"
      };
    }

    // Mock successful verification (90% success rate)
    const isValid = Math.random() > 0.1;
    
    return {
      isValid,
      invalidReason: isValid ? null : "Payment verification failed"
    };
  }

  /**
   * Mock settlement - simulates blockchain transaction
   */
  static async settlePayment(
    paymentHeader: string,
    requirements: PaymentRequirements
  ): Promise<SettlementResponse> {
    const payload = X402Utils.parsePaymentHeader(paymentHeader);
    
    if (!payload) {
      return {
        success: false,
        error: "Invalid payment payload",
        txHash: null,
        networkId: null
      };
    }

    // Simulate blockchain settlement (95% success rate)
    const success = Math.random() > 0.05;
    
    if (success) {
      // Generate mock transaction hash
      const txHash = `0x${Math.random().toString(16).slice(2, 66).padStart(64, '0')}`;
      
      return {
        success: true,
        error: null,
        txHash,
        networkId: requirements.network
      };
    } else {
      return {
        success: false,
        error: "Blockchain transaction failed",
        txHash: null,
        networkId: null
      };
    }
  }
}
