import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApiEndpointSchema, insertTransactionSchema, insertComplianceRuleSchema } from "@shared/schema";
import { z } from "zod";
import { x402ProxyMiddleware } from "./middleware/x402-proxy";
import { PaymentProcessor } from "./services/payment-processor";
import { AnalyticsService } from "./services/analytics";

const paymentProcessor = new PaymentProcessor();
const analyticsService = new AnalyticsService(storage);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Mock current user (in production, this would come from authentication)
  const DEMO_USER_ID = "demo-user-1";

  // Add x402 proxy middleware for API endpoints
  app.use("/proxy", x402ProxyMiddleware(storage, paymentProcessor));

  // Dashboard analytics
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const summary = await storage.getUserAnalyticsSummary(DEMO_USER_ID);
      const escrowSummary = await storage.getEscrowSummary(DEMO_USER_ID);
      const recentTransactions = await storage.getRecentTransactions(DEMO_USER_ID, 5);
      
      res.json({
        ...summary,
        escrow: escrowSummary,
        recentTransactions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  });

  // API Endpoints management
  app.get("/api/endpoints", async (req, res) => {
    try {
      const endpoints = await storage.getApiEndpointsByUserId(DEMO_USER_ID);
      
      // Get analytics for each endpoint
      const endpointsWithAnalytics = await Promise.all(
        endpoints.map(async (endpoint) => {
          const transactions = await storage.getTransactionsByEndpointId(endpoint.id);
          const todayTransactions = transactions.filter(tx => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return tx.createdAt! >= today;
          });
          
          const revenue = transactions
            .filter(tx => tx.status === "completed")
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
          
          return {
            ...endpoint,
            analytics: {
              requestsToday: todayTransactions.length,
              totalRevenue: revenue.toFixed(6),
              status: endpoint.isActive ? "active" : "paused"
            }
          };
        })
      );
      
      res.json(endpointsWithAnalytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch endpoints" });
    }
  });

  app.post("/api/endpoints", async (req, res) => {
    try {
      const validatedData = insertApiEndpointSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      
      const endpoint = await storage.createApiEndpoint(validatedData);
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
      
      const endpoint = await storage.updateApiEndpoint(id, updates);
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
      const deleted = await storage.deleteApiEndpoint(id);
      
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
      const transactions = await storage.getRecentTransactions(DEMO_USER_ID, parseInt(limit as string));
      
      // Enrich with endpoint information
      const enrichedTransactions = await Promise.all(
        transactions.map(async (tx) => {
          const endpoint = await storage.getApiEndpoint(tx.endpointId);
          return {
            ...tx,
            endpoint: endpoint ? { name: endpoint.name, path: endpoint.path } : null
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
      const rules = await storage.getComplianceRules(DEMO_USER_ID);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance rules" });
    }
  });

  app.post("/api/compliance/rules", async (req, res) => {
    try {
      const validatedData = insertComplianceRuleSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
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
