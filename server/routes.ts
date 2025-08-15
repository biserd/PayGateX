import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, ensureSeeded } from "./storage";
import { insertEndpointSchema, insertUsageRecordSchema, insertComplianceRuleSchema, insertServiceSchema, insertPricebookSchema } from "@shared/schema";
import { z } from "zod";
import { x402ProxyMiddleware } from "./middleware/x402-proxy";
import { createFacilitatorAdapter } from "./services/facilitator-adapter";
import { DatabaseMeteringService, UsageAnalytics } from "./services/metering";

const facilitatorAdapter = createFacilitatorAdapter("mock"); // Use mock for development
const meteringService = new DatabaseMeteringService(storage);
const usageAnalytics = new UsageAnalytics(storage);

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure database is seeded with demo data
  await ensureSeeded();
  
  const httpServer = createServer(app);

  // Mock current org/user (in production, this would come from authentication)
  const DEMO_ORG_ID = "demo-org-1";
  const DEMO_USER_ID = "demo-user-1";

  // Add x402 proxy middleware for API endpoints
  app.use("/proxy", x402ProxyMiddleware(storage, facilitatorAdapter, meteringService));

  // Dashboard analytics
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const metrics = await usageAnalytics.getUsageMetrics(DEMO_ORG_ID);
      const escrowSummary = await storage.getEscrowSummary(DEMO_ORG_ID);
      const recentUsage = await storage.getRecentUsageRecords(DEMO_ORG_ID, 5);
      
      res.json({
        totalRequests: metrics.totalRequests,
        paidRequests: metrics.paidRequests,
        totalRevenue: metrics.totalRevenue.toFixed(6),
        conversionRate: metrics.conversionRate.toFixed(2),
        averageLatency: metrics.averageLatency,
        escrow: escrowSummary,
        recentTransactions: recentUsage
      });
    } catch (error) {
      console.error("Dashboard summary error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  });

  // Services and Endpoints management combined
  app.get("/api/endpoints", async (req, res) => {
    try {
      const serviceId = req.query.serviceId as string;
      const endpoints = serviceId 
        ? await storage.getEndpointsByServiceId(serviceId)
        : await storage.getEndpointsByOrgId(DEMO_ORG_ID);
      
      // Get metrics for each endpoint using usage records
      const endpointsWithMetrics = await Promise.all(
        endpoints.map(async (endpoint) => {
          const metrics = await usageAnalytics.getUsageMetrics(DEMO_ORG_ID, endpoint.id);
          const pricing = await storage.getCurrentPricing(endpoint.id);
          
          return {
            ...endpoint,
            pricing: pricing ? {
              price: pricing.price,
              currency: pricing.currency,
              network: pricing.network
            } : null,
            metrics: {
              requestsToday: metrics.totalRequests,
              totalRevenue: metrics.totalRevenue.toFixed(6),
              conversionRate: metrics.conversionRate.toFixed(2),
              status: endpoint.isActive ? "active" : "paused"
            }
          };
        })
      );

      res.json(endpointsWithMetrics);
    } catch (error) {
      console.error("Get endpoints error:", error);
      res.status(500).json({ error: "Failed to fetch endpoints" });
    }
  });

  app.post("/api/endpoints", async (req, res) => {
    try {
      const validatedData = insertEndpointSchema.parse({
        ...req.body,
        serviceId: req.body.serviceId || "demo-service-1"
      });
      
      const endpoint = await storage.createEndpoint(validatedData);
      res.status(201).json(endpoint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid endpoint data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create endpoint" });
      }
    }
  });

  app.put("/api/endpoints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const endpoint = await storage.updateEndpoint(id, updates);
      if (!endpoint) {
        return res.status(404).json({ error: "Endpoint not found" });
      }
      
      res.json(endpoint);
    } catch (error) {
      res.status(500).json({ error: "Failed to update endpoint" });
    }
  });

  app.delete("/api/endpoints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEndpoint(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Endpoint not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete endpoint" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const { limit = "50" } = req.query;
      const transactions = await storage.getRecentUsageRecords(DEMO_ORG_ID, parseInt(limit as string));
      
      // Enrich with endpoint information
      const enrichedTransactions = await Promise.all(
        transactions.map(async (tx) => {
          const endpoint = await storage.getEndpoint(tx.endpointId);
          return {
            ...tx,
            endpoint: endpoint ? { path: endpoint.path, method: endpoint.method } : null
          };
        })
      );
      
      res.json(enrichedTransactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Analytics
  app.get("/api/analytics/revenue", async (req, res) => {
    try {
      const { days = "30" } = req.query;
      const revenueData = await analyticsService.getRevenueAnalytics(DEMO_USER_ID, parseInt(days as string));
      res.json(revenueData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  app.get("/api/analytics/requests", async (req, res) => {
    try {
      const { days = "30" } = req.query;
      const requestData = await analyticsService.getRequestAnalytics(DEMO_USER_ID, parseInt(days as string));
      res.json(requestData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch request analytics" });
    }
  });

  // Compliance rules
  app.get("/api/compliance/rules", async (req, res) => {
    try {
      const rules = await storage.getComplianceRules(DEMO_ORG_ID);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance rules" });
    }
  });

  app.post("/api/compliance/rules", async (req, res) => {
    try {
      const validatedData = insertComplianceRuleSchema.parse({
        ...req.body,
        orgId: DEMO_ORG_ID
      });
      
      const rule = await storage.createComplianceRule(validatedData);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid rule data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create compliance rule" });
      }
    }
  });

  // Escrow
  app.get("/api/escrow", async (req, res) => {
    try {
      const holdings = await storage.getEscrowHoldings(DEMO_USER_ID);
      const summary = await storage.getEscrowSummary(DEMO_USER_ID);
      
      res.json({
        holdings,
        summary
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch escrow data" });
    }
  });

  // x402 protocol endpoints
  app.post("/api/x402/verify", async (req, res) => {
    try {
      const { paymentHeader, paymentRequirements } = req.body;
      const result = await paymentProcessor.verifyPayment(paymentHeader, paymentRequirements);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Payment verification failed" });
    }
  });

  app.post("/api/x402/settle", async (req, res) => {
    try {
      const { paymentHeader, paymentRequirements } = req.body;
      const result = await paymentProcessor.settlePayment(paymentHeader, paymentRequirements);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Payment settlement failed" });
    }
  });

  app.get("/api/x402/supported", (req, res) => {
    res.json({
      kinds: [
        { scheme: "exact", network: "base" },
        { scheme: "exact", network: "ethereum" },
        { scheme: "exact", network: "polygon" }
      ]
    });
  });

  return httpServer;
}
