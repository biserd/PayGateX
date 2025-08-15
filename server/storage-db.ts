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
  type InsertWebhookEndpoint,
  users,
  organizations,
  services,
  endpoints,
  pricebooks,
  usageRecords,
  freeTierUsage,
  complianceRules,
  escrowHoldings,
  disputes,
  auditLogs,
  webhookEndpoints
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, inArray } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  
  // Organization methods
  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [created] = await db.insert(organizations).values(org).returning();
    return created;
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | undefined> {
    const [updated] = await db.update(organizations).set(updates).where(eq(organizations.id, id)).returning();
    return updated || undefined;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async upsertUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          createdAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Service methods
  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServicesByOrgId(orgId: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.orgId, orgId));
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service | undefined> {
    const [updated] = await db.update(services).set(updates).where(eq(services.id, id)).returning();
    return updated || undefined;
  }

  // Endpoint methods
  async getEndpoint(id: string): Promise<Endpoint | undefined> {
    const [endpoint] = await db.select().from(endpoints).where(eq(endpoints.id, id));
    return endpoint || undefined;
  }

  async getEndpointByPath(path: string, method: string): Promise<Endpoint | undefined> {
    const [endpoint] = await db.select().from(endpoints).where(
      and(eq(endpoints.path, path), eq(endpoints.method, method))
    );
    return endpoint || undefined;
  }

  async getEndpointsByServiceId(serviceId: string): Promise<Endpoint[]> {
    return await db.select().from(endpoints).where(eq(endpoints.serviceId, serviceId));
  }

  async getEndpointsByOrgId(orgId: string): Promise<Endpoint[]> {
    // Get services for this org first, then get endpoints
    const orgServices = await db.select().from(services).where(eq(services.orgId, orgId));
    const serviceIds = orgServices.map(s => s.id);
    
    if (serviceIds.length === 0) {
      return [];
    }
    
    return await db.select().from(endpoints).where(inArray(endpoints.serviceId, serviceIds));
  }

  async createEndpoint(endpoint: InsertEndpoint): Promise<Endpoint> {
    const [created] = await db.insert(endpoints).values(endpoint).returning();
    return created;
  }

  async updateEndpoint(id: string, updates: Partial<Endpoint>): Promise<Endpoint | undefined> {
    const [updated] = await db.update(endpoints).set(updates).where(eq(endpoints.id, id)).returning();
    return updated || undefined;
  }

  async deleteEndpoint(id: string): Promise<boolean> {
    const result = await db.delete(endpoints).where(eq(endpoints.id, id));
    return result.rowCount > 0;
  }

  // Pricing methods
  async getCurrentPricing(endpointId: string): Promise<Pricebook | undefined> {
    const [pricing] = await db.select().from(pricebooks)
      .where(eq(pricebooks.endpointId, endpointId))
      .orderBy(desc(pricebooks.effectiveFrom))
      .limit(1);
    return pricing || undefined;
  }

  async getPricingHistory(endpointId: string): Promise<Pricebook[]> {
    return await db.select().from(pricebooks)
      .where(eq(pricebooks.endpointId, endpointId))
      .orderBy(desc(pricebooks.effectiveFrom));
  }

  async createPricing(pricing: InsertPricebook): Promise<Pricebook> {
    const [created] = await db.insert(pricebooks).values(pricing).returning();
    return created;
  }

  async updatePricing(id: string, updates: Partial<Pricebook>): Promise<Pricebook | undefined> {
    const [updated] = await db.update(pricebooks).set(updates).where(eq(pricebooks.id, id)).returning();
    return updated || undefined;
  }

  // Usage record methods
  async getUsageRecord(id: string): Promise<UsageRecord | undefined> {
    const [record] = await db.select().from(usageRecords).where(eq(usageRecords.id, id));
    return record || undefined;
  }

  async getUsageRecordByRequestId(requestId: string): Promise<UsageRecord | undefined> {
    const [record] = await db.select().from(usageRecords).where(eq(usageRecords.requestId, requestId));
    return record || undefined;
  }

  async getUsageRecords(filters: {
    orgId: string;
    endpointId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<UsageRecord[]> {
    let query = db.select().from(usageRecords).where(eq(usageRecords.orgId, filters.orgId));
    
    if (filters.endpointId) {
      query = query.where(eq(usageRecords.endpointId, filters.endpointId));
    }
    if (filters.startDate) {
      query = query.where(gte(usageRecords.createdAt, filters.startDate));
    }
    if (filters.endDate) {
      query = query.where(lte(usageRecords.createdAt, filters.endDate));
    }
    
    return await query.orderBy(desc(usageRecords.createdAt));
  }

  async createUsageRecord(record: InsertUsageRecord): Promise<UsageRecord> {
    const [created] = await db.insert(usageRecords).values(record).returning();
    return created;
  }

  async getRecentUsageRecords(orgId: string, limit = 50): Promise<UsageRecord[]> {
    return await db.select().from(usageRecords)
      .where(eq(usageRecords.orgId, orgId))
      .orderBy(desc(usageRecords.createdAt))
      .limit(limit);
  }

  // Free tier methods
  async getFreeTierUsage(
    orgId: string, 
    endpointId: string, 
    payerAddress: string, 
    periodStart: Date, 
    periodEnd: Date
  ): Promise<FreeTierUsage | undefined> {
    const [usage] = await db.select().from(freeTierUsage).where(
      and(
        eq(freeTierUsage.orgId, orgId),
        eq(freeTierUsage.endpointId, endpointId),
        eq(freeTierUsage.payerAddress, payerAddress),
        gte(freeTierUsage.periodStart, periodStart),
        lte(freeTierUsage.periodEnd, periodEnd)
      )
    );
    return usage || undefined;
  }

  async createFreeTierUsage(usage: InsertFreeTierUsage): Promise<FreeTierUsage> {
    const [created] = await db.insert(freeTierUsage).values(usage).returning();
    return created;
  }

  async updateFreeTierUsage(
    id: string, 
    updates: { requestCount: number; updatedAt: Date }
  ): Promise<FreeTierUsage | undefined> {
    const [updated] = await db.update(freeTierUsage).set(updates).where(eq(freeTierUsage.id, id)).returning();
    return updated || undefined;
  }

  // Compliance methods
  async getComplianceRules(orgId: string): Promise<ComplianceRule[]> {
    return await db.select().from(complianceRules).where(eq(complianceRules.orgId, orgId));
  }

  async createComplianceRule(rule: InsertComplianceRule): Promise<ComplianceRule> {
    const [created] = await db.insert(complianceRules).values(rule).returning();
    return created;
  }

  async updateComplianceRule(id: string, updates: Partial<ComplianceRule>): Promise<ComplianceRule | undefined> {
    const [updated] = await db.update(complianceRules).set(updates).where(eq(complianceRules.id, id)).returning();
    return updated || undefined;
  }

  async deleteComplianceRule(id: string): Promise<boolean> {
    const result = await db.delete(complianceRules).where(eq(complianceRules.id, id));
    return result.rowCount > 0;
  }

  // Escrow methods
  async getEscrowHoldings(orgId: string): Promise<EscrowHolding[]> {
    return await db.select().from(escrowHoldings).where(eq(escrowHoldings.orgId, orgId));
  }

  async createEscrowHolding(holding: InsertEscrowHolding): Promise<EscrowHolding> {
    const [created] = await db.insert(escrowHoldings).values(holding).returning();
    return created;
  }

  async updateEscrowHolding(id: string, updates: Partial<EscrowHolding>): Promise<EscrowHolding | undefined> {
    const [updated] = await db.update(escrowHoldings).set(updates).where(eq(escrowHoldings.id, id)).returning();
    return updated || undefined;
  }

  async getEscrowSummary(orgId: string): Promise<{
    pendingAmount: string;
    releasedToday: string;
    totalRefunds: string;
  }> {
    const holdings = await this.getEscrowHoldings(orgId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let pendingAmount = 0;
    let releasedToday = 0;
    let totalRefunds = 0;
    
    holdings.forEach(holding => {
      if (holding.status === 'pending') {
        pendingAmount += parseFloat(holding.amount);
      } else if (holding.status === 'released' && holding.updatedAt >= today) {
        releasedToday += parseFloat(holding.amount);
      } else if (holding.status === 'refunded') {
        totalRefunds += parseFloat(holding.amount);
      }
    });
    
    return {
      pendingAmount: pendingAmount.toFixed(6),
      releasedToday: releasedToday.toFixed(6),
      totalRefunds: totalRefunds.toFixed(6)
    };
  }

  // Dispute methods
  async getDispute(id: string): Promise<Dispute | undefined> {
    const [dispute] = await db.select().from(disputes).where(eq(disputes.id, id));
    return dispute || undefined;
  }

  async getDisputesByOrgId(orgId: string): Promise<Dispute[]> {
    return await db.select().from(disputes).where(eq(disputes.orgId, orgId));
  }

  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const [created] = await db.insert(disputes).values(dispute).returning();
    return created;
  }

  async updateDispute(id: string, updates: Partial<Dispute>): Promise<Dispute | undefined> {
    const [updated] = await db.update(disputes).set(updates).where(eq(disputes.id, id)).returning();
    return updated || undefined;
  }

  // Audit log methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  async getAuditLogs(orgId: string, limit = 100): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .where(eq(auditLogs.orgId, orgId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  // Webhook methods
  async getWebhookEndpoints(orgId: string): Promise<WebhookEndpoint[]> {
    return await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.orgId, orgId));
  }

  async createWebhookEndpoint(webhook: InsertWebhookEndpoint): Promise<WebhookEndpoint> {
    const [created] = await db.insert(webhookEndpoints).values(webhook).returning();
    return created;
  }

  async updateWebhookEndpoint(id: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | undefined> {
    const [updated] = await db.update(webhookEndpoints).set(updates).where(eq(webhookEndpoints.id, id)).returning();
    return updated || undefined;
  }

  // Legacy support methods (for backward compatibility)
  async getApiEndpoint(id: string): Promise<Endpoint | undefined> {
    return this.getEndpoint(id);
  }

  async getApiEndpointsByUserId(userId: string): Promise<Endpoint[]> {
    // For now, map userId to orgId - in production you'd have proper user-org relationships
    return this.getEndpointsByOrgId(userId);
  }

  async getApiEndpointByPath(path: string): Promise<Endpoint | undefined> {
    const [endpoint] = await db.select().from(endpoints).where(eq(endpoints.path, path));
    return endpoint || undefined;
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