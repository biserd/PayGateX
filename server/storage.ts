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
  type Payout,
  type InsertPayout,
  type AuditLog,
  type InsertAuditLog,
  type WebhookEndpoint,
  type InsertWebhookEndpoint,
  type ApiKey,
  type InsertApiKey,
  type ContactSubmission,
  type InsertContactSubmission,
  type X402Service,
  type InsertX402Service
} from "@shared/schema";

export interface IStorage {
  // Organization methods
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | undefined>;
  updateOrganizationSandboxMode(id: string, sandboxMode: boolean): Promise<void>;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSettings(id: string, settings: any): Promise<User | undefined>;

  // Service methods
  getService(id: string): Promise<Service | undefined>;
  getServicesByOrgId(orgId: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<Service>): Promise<Service | undefined>;

  // Endpoint methods
  getEndpoint(id: string): Promise<Endpoint | undefined>;
  getEndpointByPath(path: string, method: string): Promise<Endpoint | undefined>;
  getEndpointsByServiceId(serviceId: string): Promise<Endpoint[]>;
  getEndpointsByOrgId(orgId: string): Promise<Endpoint[]>;
  createEndpoint(endpoint: InsertEndpoint): Promise<Endpoint>;
  updateEndpoint(id: string, updates: Partial<Endpoint>): Promise<Endpoint | undefined>;
  deleteEndpoint(id: string): Promise<boolean>;

  // Pricing methods
  getCurrentPricing(endpointId: string): Promise<Pricebook | undefined>;
  getPricingHistory(endpointId: string): Promise<Pricebook[]>;
  createPricing(pricing: InsertPricebook): Promise<Pricebook>;
  updatePricing(id: string, updates: Partial<Pricebook>): Promise<Pricebook | undefined>;

  // Usage record methods
  getUsageRecord(id: string): Promise<UsageRecord | undefined>;
  getUsageRecordByRequestId(requestId: string): Promise<UsageRecord | undefined>;
  getUsageRecords(filters: {
    orgId: string;
    endpointId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<UsageRecord[]>;
  createUsageRecord(record: InsertUsageRecord): Promise<UsageRecord>;
  getRecentUsageRecords(orgId: string, limit?: number): Promise<UsageRecord[]>;

  // Free tier methods
  getFreeTierUsage(orgId: string, endpointId: string, payerAddress: string, periodStart: Date, periodEnd: Date): Promise<FreeTierUsage | undefined>;
  createFreeTierUsage(usage: InsertFreeTierUsage): Promise<FreeTierUsage>;
  updateFreeTierUsage(id: string, updates: { requestCount: number; updatedAt: Date }): Promise<FreeTierUsage | undefined>;

  // Compliance methods
  getComplianceRules(orgId: string): Promise<ComplianceRule[]>;
  createComplianceRule(rule: InsertComplianceRule): Promise<ComplianceRule>;
  updateComplianceRule(id: string, updates: Partial<ComplianceRule>): Promise<ComplianceRule | undefined>;
  deleteComplianceRule(id: string): Promise<boolean>;

  // Escrow methods
  getEscrowHoldings(orgId: string): Promise<EscrowHolding[]>;
  createEscrowHolding(holding: InsertEscrowHolding): Promise<EscrowHolding>;
  updateEscrowHolding(id: string, updates: Partial<EscrowHolding>): Promise<EscrowHolding | undefined>;
  getEscrowSummary(orgId: string): Promise<{
    pendingAmount: string;
    releasedToday: string;
    totalRefunds: string;
  }>;

  // Dispute methods
  getDispute(id: string): Promise<Dispute | undefined>;
  getDisputesByOrgId(orgId: string): Promise<Dispute[]>;
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  updateDispute(id: string, updates: Partial<Dispute>): Promise<Dispute | undefined>;

  // Audit log methods
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(orgId: string, limit?: number): Promise<AuditLog[]>;

  // Webhook methods
  getWebhookEndpoints(orgId: string): Promise<WebhookEndpoint[]>;
  createWebhookEndpoint(webhook: InsertWebhookEndpoint): Promise<WebhookEndpoint>;
  updateWebhookEndpoint(id: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | undefined>;

  // API Key methods
  getApiKeys(orgId: string): Promise<ApiKey[]>;
  getApiKeyById(id: string): Promise<ApiKey | undefined>;
  getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | undefined>;
  revokeApiKey(id: string): Promise<void>;

  // Contact submission methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  markContactSubmissionAsRead(id: string): Promise<void>;

  // x402 Directory methods
  getX402Services(filters?: { 
    isActive?: boolean; 
    category?: string; 
    network?: string;
    search?: string;
  }): Promise<X402Service[]>;
  getX402ServiceById(id: string): Promise<X402Service | undefined>;
  getX402ServiceByUrl(url: string): Promise<X402Service | undefined>;
  createX402Service(service: InsertX402Service): Promise<X402Service>;
  updateX402Service(id: string, updates: Partial<X402Service>): Promise<X402Service | undefined>;
  upsertX402Service(service: InsertX402Service): Promise<X402Service>;
  getX402Categories(): Promise<string[]>;

  // Legacy support methods (for backward compatibility)
  getApiEndpoint(id: string): Promise<Endpoint | undefined>;
  getApiEndpointsByUserId(userId: string): Promise<Endpoint[]>;
  getApiEndpointByPath(path: string): Promise<Endpoint | undefined>;
  createApiEndpoint(endpoint: any): Promise<Endpoint>;
  updateApiEndpoint(id: string, updates: Partial<Endpoint>): Promise<Endpoint | undefined>;
  deleteApiEndpoint(id: string): Promise<boolean>;
}

// Import database implementation
import { DatabaseStorage } from "./storage-db";
import { seedDatabase } from "./seed-database";

// Export a singleton instance using real database
export const storage = new DatabaseStorage();

// Seed database on first run
let hasSeeded = false;
export async function ensureSeeded() {
  if (!hasSeeded) {
    try {
      // Check if data already exists
      const existingOrg = await storage.getOrganization("demo-org-1");
      if (!existingOrg) {
        await seedDatabase();
      } else {
        console.log("📊 Database already seeded, skipping...");
      }
      hasSeeded = true;
    } catch (error) {
      console.error("❌ Database seeding failed:", error);
      // Don't throw - let app continue with empty database
    }
  }
}