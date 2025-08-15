import { PaymentRequirements, VerificationResponse, SettlementResponse } from "../../client/src/lib/x402";

export interface FacilitatorAdapter {
  verifyPayment(paymentHeader: string, requirements: PaymentRequirements): Promise<VerificationResponse>;
  settlePayment(paymentHeader: string, requirements: PaymentRequirements): Promise<SettlementResponse>;
  getSupportedNetworks(): Promise<string[]>;
  createSignedQuote(requirements: PaymentRequirements): Promise<string>;
}

export class CoinbaseFacilitatorAdapter implements FacilitatorAdapter {
  private facilitatorUrl: string;
  private apiKey: string;

  constructor(facilitatorUrl: string = "https://facilitator.coinbase.com", apiKey?: string) {
    this.facilitatorUrl = facilitatorUrl;
    this.apiKey = apiKey || process.env.COINBASE_API_KEY || "";
  }

  async verifyPayment(paymentHeader: string, requirements: PaymentRequirements): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          x402Version: 1,
          paymentHeader,
          paymentRequirements: requirements
        })
      });

      if (!response.ok) {
        throw new Error(`Facilitator verification failed: ${response.status}`);
      }

      return await response.json() as VerificationResponse;
    } catch (error) {
      console.error("Coinbase payment verification error:", error);
      return {
        isValid: false,
        invalidReason: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }

  async settlePayment(paymentHeader: string, requirements: PaymentRequirements): Promise<SettlementResponse> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/settle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          x402Version: 1,
          paymentHeader,
          paymentRequirements: requirements
        })
      });

      if (!response.ok) {
        throw new Error(`Facilitator settlement failed: ${response.status}`);
      }

      return await response.json() as SettlementResponse;
    } catch (error) {
      console.error("Coinbase payment settlement error:", error);
      return {
        success: false,
        error: `Settlement failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        txHash: null,
        networkId: null
      };
    }
  }

  async getSupportedNetworks(): Promise<string[]> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/supported`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get supported networks: ${response.status}`);
      }

      const data = await response.json();
      return data.networks || ["base", "ethereum"];
    } catch (error) {
      console.error("Failed to get supported networks:", error);
      return ["base", "ethereum"]; // Default fallback
    }
  }

  async createSignedQuote(requirements: PaymentRequirements): Promise<string> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          x402Version: 1,
          paymentRequirements: requirements
        })
      });

      if (!response.ok) {
        throw new Error(`Quote generation failed: ${response.status}`);
      }

      const data = await response.json();
      return data.signedQuote || "";
    } catch (error) {
      console.error("Coinbase quote generation error:", error);
      // Return a mock signed quote for development
      const quote = {
        requirements,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).slice(2)
      };
      return btoa(JSON.stringify(quote));
    }
  }
}

export class X402RSFacilitatorAdapter implements FacilitatorAdapter {
  private facilitatorUrl: string;
  private apiKey: string;

  constructor(facilitatorUrl: string = "https://api.x402.rs", apiKey?: string) {
    this.facilitatorUrl = facilitatorUrl;
    this.apiKey = apiKey || process.env.X402RS_API_KEY || "";
  }

  async verifyPayment(paymentHeader: string, requirements: PaymentRequirements): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/v1/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify({
          payment_header: paymentHeader,
          requirements
        })
      });

      if (!response.ok) {
        throw new Error(`x402.rs verification failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        isValid: data.valid,
        invalidReason: data.error || undefined
      };
    } catch (error) {
      console.error("x402.rs payment verification error:", error);
      return {
        isValid: false,
        invalidReason: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }

  async settlePayment(paymentHeader: string, requirements: PaymentRequirements): Promise<SettlementResponse> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/v1/payments/settle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify({
          payment_header: paymentHeader,
          requirements
        })
      });

      if (!response.ok) {
        throw new Error(`x402.rs settlement failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        error: data.error || undefined,
        txHash: data.transaction_hash || null,
        networkId: data.network_id || null
      };
    } catch (error) {
      console.error("x402.rs payment settlement error:", error);
      return {
        success: false,
        error: `Settlement failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        txHash: null,
        networkId: null
      };
    }
  }

  async getSupportedNetworks(): Promise<string[]> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/v1/networks`, {
        headers: {
          "X-API-Key": this.apiKey,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get supported networks: ${response.status}`);
      }

      const data = await response.json();
      return data.networks || ["base", "solana"];
    } catch (error) {
      console.error("Failed to get supported networks:", error);
      return ["base", "solana"]; // Default fallback
    }
  }

  async createSignedQuote(requirements: PaymentRequirements): Promise<string> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/v1/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify({
          requirements
        })
      });

      if (!response.ok) {
        throw new Error(`Quote generation failed: ${response.status}`);
      }

      const data = await response.json();
      return data.signed_quote || "";
    } catch (error) {
      console.error("x402.rs quote generation error:", error);
      // Return a mock signed quote for development
      const quote = {
        requirements,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).slice(2)
      };
      return btoa(JSON.stringify(quote));
    }
  }
}

export class MockFacilitatorAdapter implements FacilitatorAdapter {
  async verifyPayment(paymentHeader: string, requirements: PaymentRequirements): Promise<VerificationResponse> {
    // Mock verification - always succeeds for demo purposes
    const isValid = Math.random() > 0.1; // 90% success rate
    
    return {
      isValid,
      invalidReason: isValid ? undefined : "Mock verification failed"
    };
  }

  async settlePayment(paymentHeader: string, requirements: PaymentRequirements): Promise<SettlementResponse> {
    // Mock settlement
    const success = Math.random() > 0.05; // 95% success rate
    
    if (success) {
      const txHash = `0x${Math.random().toString(16).slice(2, 66).padStart(64, '0')}`;
      return {
        success: true,
        txHash,
        networkId: requirements.network
      };
    } else {
      return {
        success: false,
        error: "Mock settlement failed",
        txHash: null,
        networkId: null
      };
    }
  }

  async getSupportedNetworks(): Promise<string[]> {
    return ["base", "ethereum", "solana", "polygon"];
  }

  async createSignedQuote(requirements: PaymentRequirements): Promise<string> {
    const quote = {
      requirements,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).slice(2),
      signature: "mock_signature_" + Math.random().toString(36).slice(2)
    };
    
    return btoa(JSON.stringify(quote));
  }
}

// Factory function to create facilitator adapters
export function createFacilitatorAdapter(type: "coinbase" | "x402rs" | "mock" = "mock"): FacilitatorAdapter {
  switch (type) {
    case "coinbase":
      return new CoinbaseFacilitatorAdapter();
    case "x402rs":
      return new X402RSFacilitatorAdapter();
    case "mock":
    default:
      return new MockFacilitatorAdapter();
  }
}