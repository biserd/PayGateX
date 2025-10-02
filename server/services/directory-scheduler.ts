import { x402Scraper } from "./x402-scraper-service";

/**
 * Background scheduler for x402 Directory
 * Runs scraper at regular intervals to keep directory data fresh
 */
export class DirectoryScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Start the scheduler
   */
  start() {
    if (this.intervalId) {
      console.log("[Directory Scheduler] Already running");
      return;
    }

    console.log(`[Directory Scheduler] Starting - will refresh every ${this.REFRESH_INTERVAL_MS / 60000} minutes`);

    // Run immediately on startup
    this.runScraper();

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.runScraper();
    }, this.REFRESH_INTERVAL_MS);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[Directory Scheduler] Stopped");
    }
  }

  /**
   * Run the scraper
   */
  private async runScraper() {
    try {
      console.log("[Directory Scheduler] Running scheduled scrape...");
      const result = await x402Scraper.run();
      console.log(`[Directory Scheduler] Scrape complete: ${result.success} success, ${result.failed} failed`);
    } catch (error) {
      console.error("[Directory Scheduler] Scrape failed:", error);
    }
  }
}

// Export singleton instance
export const directoryScheduler = new DirectoryScheduler();
