import { IStorage } from "./storage";
import { randomUUID } from "crypto";
import { 
  type User, 
  type InsertUser,
  type Organization,
  type InsertOrganization,
  type Service,
  type InsertService,
  type Endpoint,
  type InsertEndpoint,
  type Pricebook,
  type InsertPricebook,
  type UsageRecord,
  type InsertUsageRecord,
  type FreeTierUsage,
  type InsertFreeTierUsage,
  type ComplianceRule,
  type InsertComplianceRule,
  type EscrowHolding,
  type InsertEscrowHolding,
  type Dispute,
  type InsertDispute,

  type AuditLog,
  type InsertAuditLog,
  type WebhookEndpoint,
  type InsertWebhookEndpoint
} from "@shared/schema";

export class MemStorage implements IStorage {
  private organizations: Map<string, Organization> = new Map();
  private users: Map<string, User> = new Map();
  private services: Map<string, Service> = new Map();
  private endpoints: Map<string, Endpoint> = new Map();
  private pricebooks: Map<string, Pricebook> = new Map();
  private usageRecords: Map<string, UsageRecord> = new Map();
  private freeTierUsage: Map<string, FreeTierUsage> = new Map();
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private escrowHoldings: Map<string, EscrowHolding> = new Map();
  private disputes: Map<string, Dispute> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();
  private webhookEndpoints: Map<string, WebhookEndpoint> = new Map();

  constructor() {
    this.initializeDemo();
  }

  private initializeDemo() {
    // Create demo organization
    const demoOrg: Organization = {
      id: "demo-org-1",
      name: "Demo Organization",
      slug: "demo-org",
      email: "admin@demo.com",
      walletAddress: "0x1234567890123456789012345678901234567890",
      escrowHoldHours: 24,
      freeTierLimit: 100,
      freeTierPeriodDays: 30,
      createdAt: new Date()
    };
    this.organizations.set(demoOrg.id, demoOrg);

    // Create demo user
    const demoUser: User = {
      id: "demo-user-1",
      orgId: "demo-org-1",
      username: "demouser",
      password: "hashedpassword",
      email: "user@demo.com",
      role: "admin",
      walletAddress: "0x1234567890123456789012345678901234567890",
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo service
    const demoService: Service = {
      id: "demo-service-1",
      orgId: "demo-org-1",
      name: "Demo API Service",
      description: "A demo API service for testing",
      slug: "demo-api",
      isActive: true,
      baseUrl: "https://api.example.com",
      healthCheckPath: "/health",
      createdAt: new Date()
    };
    this.services.set(demoService.id, demoService);

    // Create demo endpoints
    const endpoints = [
      {
        id: "endpoint-1",
        serviceId: "demo-service-1",
        path: "/ai/chat",
        method: "POST",
        description: "AI Chat completion endpoint",
        isActive: true,
        supportedNetworks: ["base", "ethereum"],
        createdAt: new Date()
      },
      {
        id: "endpoint-2", 
        serviceId: "demo-service-1",
        path: "/data/analytics",
        method: "GET",
        description: "Analytics data endpoint",
        isActive: true,
        supportedNetworks: ["base"],
        createdAt: new Date()
      }
    ];

    endpoints.forEach(endpoint => {
      this.endpoints.set(endpoint.id, endpoint as Endpoint);
    });

    // Create demo pricing
    const pricings = [
      {
        id: "pricing-1",
        endpointId: "endpoint-1",
        version: 1,
        price: "0.001",
        currency: "USDC",
        network: "base",
        isActive: true,
        effectiveFrom: new Date(),
        createdAt: new Date()
      },
      {
        id: "pricing-2",
        endpointId: "endpoint-2",
        version: 1,
        price: "0.0005",
        currency: "USDC",
        network: "base",
        isActive: true,
        effectiveFrom: new Date(),
        createdAt: new Date()
      }
    ];

    pricings.forEach(pricing => {
      this.pricebooks.set(pricing.id, pricing as Pricebook);
    });

    // Create demo usage records
    const now = new Date();
    const usageRecords = [
      {
        id: "usage-1",
        requestId: "req-1",
        endpointId: "endpoint-1",
        orgId: "demo-org-1",
        payerAddress: "0x1111111111111111111111111111111111111111",
        ipAddress: "192.168.1.1",
        userAgent: "Demo Client/1.0",
        price: "0.001",
        currency: "USDC",
        network: "base",
        proofId: "0xabc123",
        status: "paid",
        latencyMs: 150,
        responseStatus: 200,
        errorCode: null,
        isFreeRequest: false,
        createdAt: now,
        paidAt: now
      },
      {
        id: "usage-2",
        requestId: "req-2",
        endpointId: "endpoint-2",
        orgId: "demo-org-1",
        payerAddress: "0x2222222222222222222222222222222222222222",
        ipAddress: "192.168.1.2",
        userAgent: "Demo Client/1.0",
        price: "0.0005",
        currency: "USDC",
        network: "base",
        proofId: null,
        status: "unpaid",
        latencyMs: 95,
        responseStatus: 402,
        errorCode: null,
        isFreeRequest: false,
        createdAt: now,
        paidAt: null
      }
    ];

    usageRecords.forEach(record => {
      this.usageRecords.set(record.id, record as UsageRecord);
    });

    // Create demo escrow holdings
    const escrowHolding: EscrowHolding = {
      id: "escrow-1",
      orgId: "demo-org-1",
      usageRecordId: "usage-1",
      amount: "0.001",
      currency: "USDC",
      network: "base",
      releaseAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "pending",
      proofId: "0xabc123",
      createdAt: now,
      releasedAt: null
    };
    this.escrowHoldings.set(escrowHolding.id, escrowHolding);
  }

  // Organization methods
  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const newOrg: Organization = {
      id: randomUUID(),
      ...org,
      createdAt: new Date()
    };
    this.organizations.set(newOrg.id, newOrg);
    return newOrg;
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | undefined> {
    const org = this.organizations.get(id);
    if (!org) return undefined;
    
    const updatedOrg = { ...org, ...updates };
    this.organizations.set(id, updatedOrg);
    return updatedOrg;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      ...user,
      createdAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUserSettings(id: string, settings: any): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    // Store settings by extending the user object with settings data
    // In production, you'd have a separate user_settings table
    const updatedUser: User & { settings?: any } = {
      ...user,
      settings: {
        ...(user as any).settings || {},
        ...settings
      }
    };
    
    this.users.set(id, updatedUser as User);
    return updatedUser as User;
  }

  // Service methods
  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByOrgId(orgId: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.orgId === orgId);
  }

  async createService(service: InsertService): Promise<Service> {
    const newService: Service = {
      id: randomUUID(),
      ...service,
      createdAt: new Date()
    };
    this.services.set(newService.id, newService);
    return newService;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updates };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Endpoint methods
  async getEndpoint(id: string): Promise<Endpoint | undefined> {
    return this.endpoints.get(id);
  }

  async getEndpointByPath(path: string, method: string): Promise<Endpoint | undefined> {
    return Array.from(this.endpoints.values())
      .find(e => e.path === path && e.method === method && e.isActive);
  }

  async getEndpointsByServiceId(serviceId: string): Promise<Endpoint[]> {
    return Array.from(this.endpoints.values()).filter(e => e.serviceId === serviceId);
  }

  async getEndpointsByOrgId(orgId: string): Promise<Endpoint[]> {
    const services = await this.getServicesByOrgId(orgId);
    const serviceIds = services.map(s => s.id);
    return Array.from(this.endpoints.values())
      .filter(e => serviceIds.includes(e.serviceId));
  }

  async createEndpoint(endpoint: InsertEndpoint): Promise<Endpoint> {
    const newEndpoint: Endpoint = {
      id: randomUUID(),
      ...endpoint,
      createdAt: new Date()
    };
    this.endpoints.set(newEndpoint.id, newEndpoint);
    return newEndpoint;
  }

  async updateEndpoint(id: string, updates: Partial<Endpoint>): Promise<Endpoint | undefined> {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) return undefined;
    
    const updatedEndpoint = { ...endpoint, ...updates };
    this.endpoints.set(id, updatedEndpoint);
    return updatedEndpoint;
  }

  async deleteEndpoint(id: string): Promise<boolean> {
    return this.endpoints.delete(id);
  }

  // Pricing methods
  async getCurrentPricing(endpointId: string): Promise<Pricebook | undefined> {
    return Array.from(this.pricebooks.values())
      .filter(p => p.endpointId === endpointId && p.isActive)
      .sort((a, b) => new Date(b.effectiveFrom!).getTime() - new Date(a.effectiveFrom!).getTime())[0];
  }

  async getPricingHistory(endpointId: string): Promise<Pricebook[]> {
    return Array.from(this.pricebooks.values())
      .filter(p => p.endpointId === endpointId)
      .sort((a, b) => new Date(b.effectiveFrom!).getTime() - new Date(a.effectiveFrom!).getTime());
  }

  async createPricing(pricing: InsertPricebook): Promise<Pricebook> {
    const newPricing: Pricebook = {
      id: randomUUID(),
      ...pricing,
      effectiveFrom: new Date(),
      createdAt: new Date()
    };
    this.pricebooks.set(newPricing.id, newPricing);
    return newPricing;
  }

  async updatePricing(id: string, updates: Partial<Pricebook>): Promise<Pricebook | undefined> {
    const pricing = this.pricebooks.get(id);
    if (!pricing) return undefined;
    
    const updatedPricing = { ...pricing, ...updates };
    this.pricebooks.set(id, updatedPricing);
    return updatedPricing;
  }

  // Usage record methods
  async getUsageRecord(id: string): Promise<UsageRecord | undefined> {
    return this.usageRecords.get(id);
  }

  async getUsageRecordByRequestId(requestId: string): Promise<UsageRecord | undefined> {
    return Array.from(this.usageRecords.values())
      .find(r => r.requestId === requestId);
  }

  async getUsageRecords(filters: {
    orgId: string;
    endpointId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<UsageRecord[]> {
    return Array.from(this.usageRecords.values())
      .filter(r => {
        if (r.orgId !== filters.orgId) return false;
        if (filters.endpointId && r.endpointId !== filters.endpointId) return false;
        if (filters.startDate && r.createdAt && new Date(r.createdAt) < filters.startDate) return false;
        if (filters.endDate && r.createdAt && new Date(r.createdAt) > filters.endDate) return false;
        return true;
      });
  }

  async createUsageRecord(record: InsertUsageRecord): Promise<UsageRecord> {
    const newRecord: UsageRecord = {
      id: randomUUID(),
      ...record,
      createdAt: new Date()
    };
    this.usageRecords.set(newRecord.id, newRecord);
    return newRecord;
  }

  async getRecentUsageRecords(orgId: string, limit: number = 50): Promise<UsageRecord[]> {
    return Array.from(this.usageRecords.values())
      .filter(r => r.orgId === orgId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  // Free tier methods
  async getFreeTierUsage(
    orgId: string, 
    endpointId: string, 
    payerAddress: string,
    periodStart: Date, 
    periodEnd: Date
  ): Promise<FreeTierUsage | undefined> {
    return Array.from(this.freeTierUsage.values())
      .find(u => 
        u.orgId === orgId &&
        u.endpointId === endpointId &&
        u.payerAddress === payerAddress &&
        u.periodStart <= periodStart &&
        u.periodEnd >= periodEnd
      );
  }

  async createFreeTierUsage(usage: InsertFreeTierUsage): Promise<FreeTierUsage> {
    const newUsage: FreeTierUsage = {
      id: randomUUID(),
      ...usage,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.freeTierUsage.set(newUsage.id, newUsage);
    return newUsage;
  }

  async updateFreeTierUsage(
    id: string, 
    updates: { requestCount: number; updatedAt: Date }
  ): Promise<FreeTierUsage | undefined> {
    const usage = this.freeTierUsage.get(id);
    if (!usage) return undefined;
    
    const updatedUsage = { ...usage, ...updates };
    this.freeTierUsage.set(id, updatedUsage);
    return updatedUsage;
  }

  // Compliance methods
  async getComplianceRules(orgId: string): Promise<ComplianceRule[]> {
    return Array.from(this.complianceRules.values())
      .filter(r => r.orgId === orgId && r.isActive);
  }

  async createComplianceRule(rule: InsertComplianceRule): Promise<ComplianceRule> {
    const newRule: ComplianceRule = {
      id: randomUUID(),
      ...rule,
      createdAt: new Date()
    };
    this.complianceRules.set(newRule.id, newRule);
    return newRule;
  }

  async updateComplianceRule(
    id: string, 
    updates: Partial<ComplianceRule>
  ): Promise<ComplianceRule | undefined> {
    const rule = this.complianceRules.get(id);
    if (!rule) return undefined;
    
    const updatedRule = { ...rule, ...updates };
    this.complianceRules.set(id, updatedRule);
    return updatedRule;
  }

  async deleteComplianceRule(id: string): Promise<boolean> {
    return this.complianceRules.delete(id);
  }

  // Escrow methods
  async getEscrowHoldings(orgId: string): Promise<EscrowHolding[]> {
    return Array.from(this.escrowHoldings.values())
      .filter(h => h.orgId === orgId);
  }

  async createEscrowHolding(holding: InsertEscrowHolding): Promise<EscrowHolding> {
    const newHolding: EscrowHolding = {
      id: randomUUID(),
      ...holding,
      createdAt: new Date()
    };
    this.escrowHoldings.set(newHolding.id, newHolding);
    return newHolding;
  }

  async updateEscrowHolding(
    id: string, 
    updates: Partial<EscrowHolding>
  ): Promise<EscrowHolding | undefined> {
    const holding = this.escrowHoldings.get(id);
    if (!holding) return undefined;
    
    const updatedHolding = { ...holding, ...updates };
    this.escrowHoldings.set(id, updatedHolding);
    return updatedHolding;
  }

  async getEscrowSummary(orgId: string): Promise<{
    pendingAmount: string;
    releasedToday: string;
    totalRefunds: string;
  }> {
    const holdings = await this.getEscrowHoldings(orgId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pendingAmount = holdings
      .filter(h => h.status === "pending")
      .reduce((sum, h) => sum + parseFloat(h.amount), 0);

    const releasedToday = holdings
      .filter(h => h.status === "released" && h.releasedAt && new Date(h.releasedAt) >= today)
      .reduce((sum, h) => sum + parseFloat(h.amount), 0);

    const totalRefunds = holdings
      .filter(h => h.status === "refunded")
      .reduce((sum, h) => sum + parseFloat(h.amount), 0);

    return {
      pendingAmount: pendingAmount.toFixed(6),
      releasedToday: releasedToday.toFixed(6),
      totalRefunds: totalRefunds.toFixed(6)
    };
  }

  // Dispute methods
  async getDispute(id: string): Promise<Dispute | undefined> {
    return this.disputes.get(id);
  }

  async getDisputesByOrgId(orgId: string): Promise<Dispute[]> {
    return Array.from(this.disputes.values())
      .filter(d => d.orgId === orgId);
  }

  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const newDispute: Dispute = {
      id: randomUUID(),
      ...dispute,
      createdAt: new Date()
    };
    this.disputes.set(newDispute.id, newDispute);
    return newDispute;
  }

  async updateDispute(id: string, updates: Partial<Dispute>): Promise<Dispute | undefined> {
    const dispute = this.disputes.get(id);
    if (!dispute) return undefined;
    
    const updatedDispute = { ...dispute, ...updates };
    this.disputes.set(id, updatedDispute);
    return updatedDispute;
  }

  // Audit log methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: randomUUID(),
      ...log,
      createdAt: new Date()
    };
    this.auditLogs.set(newLog.id, newLog);
    return newLog;
  }

  async getAuditLogs(orgId: string, limit: number = 100): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(l => l.orgId === orgId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  // Webhook methods
  async getWebhookEndpoints(orgId: string): Promise<WebhookEndpoint[]> {
    return Array.from(this.webhookEndpoints.values())
      .filter(w => w.orgId === orgId);
  }

  async createWebhookEndpoint(webhook: InsertWebhookEndpoint): Promise<WebhookEndpoint> {
    const newWebhook: WebhookEndpoint = {
      id: randomUUID(),
      ...webhook,
      createdAt: new Date()
    };
    this.webhookEndpoints.set(newWebhook.id, newWebhook);
    return newWebhook;
  }

  async updateWebhookEndpoint(
    id: string, 
    updates: Partial<WebhookEndpoint>
  ): Promise<WebhookEndpoint | undefined> {
    const webhook = this.webhookEndpoints.get(id);
    if (!webhook) return undefined;
    
    const updatedWebhook = { ...webhook, ...updates };
    this.webhookEndpoints.set(id, updatedWebhook);
    return updatedWebhook;
  }

  // Legacy support methods
  async getApiEndpoint(id: string): Promise<Endpoint | undefined> {
    return this.getEndpoint(id);
  }

  async getApiEndpointsByUserId(userId: string): Promise<Endpoint[]> {
    const user = await this.getUser(userId);
    if (!user) return [];
    return this.getEndpointsByOrgId(user.orgId);
  }

  async getApiEndpointByPath(path: string): Promise<Endpoint | undefined> {
    return this.getEndpointByPath(path, "POST");
  }

  async createApiEndpoint(endpoint: any): Promise<Endpoint> {
    return this.createEndpoint(endpoint);
  }

  async updateApiEndpoint(id: string, updates: Partial<Endpoint>): Promise<Endpoint | undefined> {
    return this.updateEndpoint(id, updates);
  }

  async deleteApiEndpoint(id: string): Promise<boolean> {
    return this.deleteEndpoint(id);
  }
}