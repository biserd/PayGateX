import { storage } from "../storage";
import type { InsertX402Service } from "@shared/schema";

interface X402Quote {
  x402Version: number;
  accepts: Array<{
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource?: string;
    description?: string;
    payTo: string;
    asset: string;
    maxTimeoutSeconds?: number;
    extra?: any;
  }>;
}

interface BazaarService {
  url: string;
  name: string;
  description?: string;
  category?: string;
}

export class X402ScraperService {
  private bazaarUrl = "https://x402.org/facilitator/list";
  private x402IndexUrl = "https://www.x402index.com/api/all";

  /**
   * Run the complete scraper: fetch from all sources and update database
   */
  async run(): Promise<{ success: number; failed: number }> {
    console.log("[X402 Scraper] Starting scraper run...");
    
    let success = 0;
    let failed = 0;

    try {
      // Fetch from Bazaar
      const bazaarServices = await this.fetchFromBazaar();
      console.log(`[X402 Scraper] Found ${bazaarServices.length} services from Bazaar`);

      // Fetch from x402 Index
      const indexServices = await this.fetchFromX402Index();
      console.log(`[X402 Scraper] Found ${indexServices.length} services from x402 Index`);

      // Combine and deduplicate by URL
      const allServices = [...bazaarServices, ...indexServices];
      const uniqueServices = this.deduplicateByUrl(allServices);
      console.log(`[X402 Scraper] Processing ${uniqueServices.length} unique services`);

      // Process each service: collect quote and store
      for (const service of uniqueServices) {
        try {
          const enriched = await this.enrichWithQuote(service);
          await storage.upsertX402Service(enriched);
          success++;
        } catch (error) {
          console.error(`[X402 Scraper] Failed to process ${service.url}:`, error);
          failed++;
        }
      }

      console.log(`[X402 Scraper] Complete: ${success} success, ${failed} failed`);
    } catch (error) {
      console.error("[X402 Scraper] Fatal error during scraper run:", error);
    }

    return { success, failed };
  }

  /**
   * Fetch services from Coinbase Bazaar
   */
  private async fetchFromBazaar(): Promise<BazaarService[]> {
    try {
      const response = await fetch(this.bazaarUrl, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        console.warn(`[X402 Scraper] Bazaar returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      // Parse the response - structure may vary
      if (Array.isArray(data)) {
        return data.map(item => ({
          url: item.url || item.endpoint,
          name: item.name || item.service || "Unknown Service",
          description: item.description,
          category: item.category,
        }));
      }

      return [];
    } catch (error) {
      console.error("[X402 Scraper] Failed to fetch from Bazaar:", error);
      return [];
    }
  }

  /**
   * Fetch services from x402 Index
   */
  private async fetchFromX402Index(): Promise<BazaarService[]> {
    try {
      const response = await fetch(this.x402IndexUrl, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        console.warn(`[X402 Scraper] x402 Index returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      // Parse the response - structure may vary
      if (Array.isArray(data)) {
        return data.map(item => ({
          url: item.url || item.endpoint,
          name: item.name || item.service || "Unknown Service",
          description: item.description,
          category: item.category,
        }));
      }

      return [];
    } catch (error) {
      console.error("[X402 Scraper] Failed to fetch from x402 Index:", error);
      return [];
    }
  }

  /**
   * Trigger a 402 response from service URL to extract pricing
   */
  private async enrichWithQuote(service: BazaarService): Promise<InsertX402Service> {
    let quote: X402Quote | null = null;
    let responseTimeMs: number | undefined;

    try {
      const startTime = Date.now();
      const response = await fetch(service.url, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      responseTimeMs = Date.now() - startTime;

      // If 402 Payment Required, parse the quote
      if (response.status === 402) {
        quote = await response.json();
      }
    } catch (error) {
      // Service may be down or not respond properly - that's okay
      console.debug(`[X402 Scraper] Could not get quote from ${service.url}`);
    }

    // Extract pricing from quote if available
    const firstAccept = quote?.accepts?.[0];
    const price = firstAccept?.maxAmountRequired 
      ? (parseInt(firstAccept.maxAmountRequired) / 1000000).toString() // Convert atomic units to USDC
      : undefined;

    return {
      url: service.url,
      name: service.name,
      description: service.description || firstAccept?.description,
      price,
      currency: "USDC",
      network: firstAccept?.network || "base",
      category: service.category || this.guessCategory(service.name, service.description),
      payTo: firstAccept?.payTo,
      source: service.url.includes("x402index") ? "x402index" : "bazaar",
      isActive: true,
      responseTimeMs,
      lastAvailable: responseTimeMs ? new Date() : undefined,
      metadata: quote ? JSON.stringify(quote) : undefined,
    };
  }

  /**
   * Deduplicate services by URL
   */
  private deduplicateByUrl(services: BazaarService[]): BazaarService[] {
    const seen = new Set<string>();
    return services.filter(service => {
      if (seen.has(service.url)) {
        return false;
      }
      seen.add(service.url);
      return true;
    });
  }

  /**
   * Guess category from service name/description
   */
  private guessCategory(name: string, description?: string): string {
    const text = `${name} ${description || ""}`.toLowerCase();

    if (text.includes("ai") || text.includes("llm") || text.includes("model")) return "AI";
    if (text.includes("weather") || text.includes("climate")) return "Weather";
    if (text.includes("finance") || text.includes("stock") || text.includes("crypto")) return "Finance";
    if (text.includes("data") || text.includes("analytics")) return "Data";
    if (text.includes("image") || text.includes("photo") || text.includes("visual")) return "Media";
    if (text.includes("news") || text.includes("article")) return "News";
    
    return "Other";
  }
}

// Export singleton instance
export const x402Scraper = new X402ScraperService();
