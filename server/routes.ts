import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, ensureSeeded } from "./storage";
import { insertEndpointSchema, insertUsageRecordSchema, insertComplianceRuleSchema, insertServiceSchema, insertPricebookSchema } from "@shared/schema";
import { z } from "zod";
import { x402ProxyMiddleware } from "./middleware/x402-proxy";
import { createFacilitatorAdapter } from "./services/facilitator-adapter";
import { DatabaseMeteringService, UsageAnalytics } from "./services/metering";
import { setupAuth } from "./auth";

const facilitatorAdapter = createFacilitatorAdapter("mock"); // Use mock for development
const meteringService = new DatabaseMeteringService(storage);
const usageAnalytics = new UsageAnalytics(storage);

// Simple authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure database is seeded with demo data
  await ensureSeeded();
  
  // Setup authentication
  setupAuth(app);
  
  const httpServer = createServer(app);

  // Mock current org/user (in production, this would come from authentication)
  const DEMO_ORG_ID = "demo-org-1";
  const DEMO_USER_ID = "demo-user-1";

  // Add x402 proxy middleware for API endpoints
  app.all("/proxy/*", async (req, res, next) => {
    // Call the x402 proxy middleware directly
    const middleware = x402ProxyMiddleware(storage, facilitatorAdapter, meteringService);
    return middleware(req, res, next);
  });

  // Note: Auth routes are now handled in auth.ts

  // Dashboard analytics (protected)
  app.get("/api/dashboard/summary", isAuthenticated, async (req, res) => {
    try {
      // Disable caching for real-time data
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const metrics = await usageAnalytics.getUsageMetrics(DEMO_ORG_ID);
      const escrowSummary = await storage.getEscrowSummary(DEMO_ORG_ID);
      const recentUsage = await storage.getRecentUsageRecords(DEMO_ORG_ID, 5);
      
      // Enrich usage records with endpoint information
      const enrichedTransactions = await Promise.all(
        recentUsage.map(async (record) => {
          const endpoint = await storage.getEndpoint(record.endpointId);
          return {
            ...record,
            endpoint: endpoint ? {
              path: endpoint.path,
              method: endpoint.method
            } : null
          };
        })
      );
      
      res.json({
        totalRequests: metrics.totalRequests,
        paidRequests: metrics.paidRequests,
        totalRevenue: metrics.totalRevenue.toFixed(6),
        conversionRate: metrics.conversionRate.toFixed(2),
        averageLatency: metrics.averageLatency,
        escrow: escrowSummary,
        recentTransactions: enrichedTransactions
      });
    } catch (error) {
      console.error("Dashboard summary error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  });

  // Services and Endpoints management combined  
  app.get("/api/endpoints", isAuthenticated, async (req, res) => {
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

  // Usage Records route for transaction list (dashboard)
  app.get("/api/usage-records", isAuthenticated, async (req, res) => {
    try {
      const usageRecords = await storage.getRecentUsageRecords(DEMO_ORG_ID, 10);

      // Add endpoint information to usage records
      const recordsWithEndpoints = await Promise.all(
        usageRecords.map(async (record) => {
          const endpoint = await storage.getEndpoint(record.endpointId);
          return {
            ...record,
            endpoint: endpoint ? {
              path: endpoint.path,
              method: endpoint.method
            } : null
          };
        })
      );

      res.json(recordsWithEndpoints);
    } catch (error) {
      console.error("Error fetching usage records:", error);
      res.status(500).json({ error: "Failed to fetch usage records" });
    }
  });

  // Analytics (using real usage records)
  app.get("/api/analytics/revenue/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days) || 30;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const records = await storage.getUsageRecords({
        orgId: DEMO_ORG_ID,
        startDate,
        endDate
      });
      
      // Generate daily revenue data from usage records
      const dailyRevenue = [];
      const paidRecords = records.filter(r => r.status === 'paid');
      
      for (let i = 0; i < days; i++) {
        const dayStart = new Date(startDate);
        dayStart.setDate(dayStart.getDate() + i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        
        const dayRecords = paidRecords.filter(r => 
          r.createdAt && r.createdAt >= dayStart && r.createdAt < dayEnd
        );
        
        const revenue = dayRecords.reduce((sum, r) => sum + parseFloat(r.price), 0);
        
        dailyRevenue.push({
          date: dayStart.toISOString().split('T')[0],
          revenue: Math.round(revenue * 1000000) / 1000000, // Round to 6 decimals
          requests: dayRecords.length
        });
      }
      
      const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
      const averageDailyRevenue = totalRevenue / days;
      
      res.json({
        dailyRevenue,
        totalRevenue,
        averageDailyRevenue,
        growthRate: 0 // Calculate if needed
      });
    } catch (error) {
      console.error("Revenue analytics error:", error);
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  app.get("/api/analytics/requests/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days) || 30;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const records = await storage.getUsageRecords({
        orgId: DEMO_ORG_ID,
        startDate,
        endDate
      });
      
      // Generate daily request data from usage records
      const dailyRequests = [];
      
      for (let i = 0; i < days; i++) {
        const dayStart = new Date(startDate);
        dayStart.setDate(dayStart.getDate() + i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        
        const dayRecords = records.filter(r => 
          r.createdAt && r.createdAt >= dayStart && r.createdAt < dayEnd
        );
        
        const paidRequests = dayRecords.filter(r => r.status === 'paid').length;
        const unpaidRequests = dayRecords.filter(r => r.status === 'unpaid').length;
        
        dailyRequests.push({
          date: dayStart.toISOString().split('T')[0],
          totalRequests: dayRecords.length,
          paidRequests,
          unpaidRequests,
          freeRequests: dayRecords.filter(r => r.isFreeRequest).length
        });
      }
      
      const totalRequests = records.length;
      const averageDailyRequests = totalRequests / days;
      
      res.json({
        dailyRequests,
        totalRequests,
        averageDailyRequests,
        growthRate: 0 // Calculate if needed
      });
    } catch (error) {
      console.error("Request analytics error:", error);
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

  // User settings endpoints
  app.get("/api/settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      const userSettings = await (storage as any).getUserSettings(userId);
      
      const settings = {
        id: userId,
        name: user?.username || "",
        email: user?.email || "",
        company: userSettings?.company || "",
        timezone: userSettings?.timezone || "UTC", 
        notifications: {
          email: userSettings?.emailNotifications ?? true,
          webhook: userSettings?.webhookNotifications ?? false,
          sms: userSettings?.smsNotifications ?? false
        },
        security: {
          twoFactorEnabled: userSettings?.twoFactorEnabled ?? false,
          apiKeyRotationDays: userSettings?.apiKeyRotationDays ?? 30
        },
        payment: {
          defaultNetwork: userSettings?.defaultNetwork || "base",
          escrowPeriodHours: userSettings?.escrowPeriodHours ?? 24,
          minimumPayment: userSettings?.minimumPayment || "0.01"
        }
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const userId = req.user!.id;
      const updates = req.body;
      
      console.log("Updating user settings:", userId, updates);
      
      // Update user settings in database
      await storage.updateUserSettings(userId, updates);
      
      res.json({ success: true, message: "Settings updated successfully" });
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Organization settings
  app.get("/api/organization", async (req, res) => {
    try {
      const organization = await storage.getOrganization(DEMO_ORG_ID);
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch organization" });
    }
  });

  app.patch("/api/organization", async (req, res) => {
    try {
      const updates = req.body;
      const organization = await storage.updateOrganization(DEMO_ORG_ID, updates);
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      res.status(500).json({ error: "Failed to update organization" });
    }
  });

  // Service settings
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServicesByOrgId(DEMO_ORG_ID);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.patch("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const service = await storage.updateService(id, updates);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service" });
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

  // Payment simulation endpoint
  app.post("/api/payments/simulate", async (req, res) => {
    try {
      const { endpointId, amount } = req.body;
      
      if (!endpointId) {
        return res.status(400).json({ error: "endpointId is required" });
      }

      // Get the endpoint to validate it exists
      const endpoint = await storage.getEndpoint(endpointId);
      if (!endpoint) {
        return res.status(404).json({ error: "Endpoint not found" });
      }

      // Create a mock payment simulation
      const simulationResult = {
        endpointId,
        amount: amount || endpoint.priceAmount,
        network: endpoint.supportedNetworks?.[0] || "base",
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
        status: "simulated",
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64), // Mock hash
        timestamp: new Date().toISOString(),
        gasUsed: Math.floor(Math.random() * 50000) + 21000, // Mock gas usage
        gasFee: (Math.random() * 0.01).toFixed(6),
        message: `Payment simulation successful for ${endpoint.path}`
      };

      // For simulation, we'll skip recording usage since this is a mock transaction
      console.log(`Simulated payment for endpoint ${endpoint.path}: ${simulationResult.amount} USDC`);
      console.log(`Mock transaction hash: ${simulationResult.transactionHash}`);

      res.json(simulationResult);
    } catch (error) {
      console.error("Payment simulation error:", error);
      res.status(500).json({ error: "Payment simulation failed" });
    }
  });

  return httpServer;
}
