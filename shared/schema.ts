import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, timestamp, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Organization model for multi-tenant support
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  email: text("email").notNull(),
  walletAddress: text("wallet_address"), // Production wallet (Base mainnet)
  testnetWalletAddress: text("testnet_wallet_address"), // Base Sepolia wallet
  sandboxMode: boolean("sandbox_mode").notNull().default(true),
  escrowHoldHours: integer("escrow_hold_hours").notNull().default(24),
  freeTierLimit: integer("free_tier_limit").notNull().default(100),
  freeTierPeriodDays: integer("free_tier_period_days").notNull().default(30),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("member"), // admin, member, viewer
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User settings table for storing user preferences
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  company: text("company"),
  timezone: text("timezone").default("UTC"),
  emailNotifications: boolean("email_notifications").default(true),
  webhookNotifications: boolean("webhook_notifications").default(false),
  smsNotifications: boolean("sms_notifications").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  apiKeyRotationDays: integer("api_key_rotation_days").default(30),
  defaultNetwork: text("default_network").default("base"),
  escrowPeriodHours: integer("escrow_period_hours").default(24),
  minimumPayment: decimal("minimum_payment", { precision: 18, scale: 6 }).default("0.01"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Services (collection of endpoints)
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  baseUrl: text("base_url").notNull(),
  healthCheckPath: text("health_check_path").default("/health"),
  createdAt: timestamp("created_at").defaultNow(),
});

// API Endpoints
export const endpoints = pgTable("endpoints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  path: text("path").notNull(),
  method: text("method").notNull().default("GET"),
  targetUrl: text("target_url").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  supportedNetworks: jsonb("supported_networks").notNull().default(['base']),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pricing with versioning
export const pricebooks = pgTable("pricebooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  endpointId: varchar("endpoint_id").notNull().references(() => endpoints.id),
  version: integer("version").notNull().default(1),
  price: decimal("price", { precision: 18, scale: 6 }).notNull(),
  currency: text("currency").notNull().default("USDC"),
  network: text("network").notNull().default("base"),
  testnetNetwork: text("testnet_network").default("base-sepolia"),
  isActive: boolean("is_active").notNull().default(true),
  effectiveFrom: timestamp("effective_from").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Usage records with full metering
export const usageRecords = pgTable("usage_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().unique(), // For idempotency
  endpointId: varchar("endpoint_id").notNull().references(() => endpoints.id),
  orgId: varchar("org_id").notNull().references(() => organizations.id),
  payerAddress: text("payer_address"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  price: decimal("price", { precision: 18, scale: 6 }).notNull(),
  currency: text("currency").notNull().default("USDC"),
  network: text("network").notNull(),
  proofId: text("proof_id"), // Payment proof/transaction hash
  status: text("status").notNull().default("unpaid"), // unpaid, paid, failed, refunded
  latencyMs: integer("latency_ms"),
  responseStatus: integer("response_status"),
  errorCode: text("error_code"),
  isFreeRequest: boolean("is_free_request").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

// Disputes and refunds
export const disputes = pgTable("disputes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  usageRecordId: varchar("usage_record_id").notNull().references(() => usageRecords.id),
  orgId: varchar("org_id").notNull().references(() => organizations.id),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, approved, denied, resolved
  refundAmount: decimal("refund_amount", { precision: 18, scale: 6 }),
  refundTxHash: text("refund_tx_hash"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Payouts tracking
export const payouts = pgTable("payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  currency: text("currency").notNull().default("USDC"),
  network: text("network").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  txHash: text("tx_hash"),
  toAddress: text("to_address").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  usageCount: integer("usage_count").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Free tier tracking
export const freeTierUsage = pgTable("free_tier_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id),
  endpointId: varchar("endpoint_id").notNull().references(() => endpoints.id),
  payerAddress: text("payer_address").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  requestCount: integer("request_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit log for pricing changes and admin actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: varchar("resource_id").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Webhook registrations
export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: jsonb("events").notNull().default(['payment.confirmed']),
  isActive: boolean("is_active").notNull().default(true),
  lastDelivery: timestamp("last_delivery"),
  failureCount: integer("failure_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const complianceRules = pgTable("compliance_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id),
  type: text("type").notNull(), // geo_block, ip_block, wallet_allow, wallet_deny
  rules: jsonb("rules").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const escrowHoldings = pgTable("escrow_holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id),
  usageRecordId: varchar("usage_record_id").notNull().references(() => usageRecords.id),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  currency: text("currency").notNull().default("USDC"),
  network: text("network").notNull(),
  releaseAt: timestamp("release_at").notNull(),
  status: text("status").notNull().default("pending"), // pending, released, refunded, disputed
  proofId: text("proof_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  releasedAt: timestamp("released_at"),
});

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertEndpointSchema = createInsertSchema(endpoints).omit({
  id: true,
  createdAt: true,
});

export const insertPricebookSchema = createInsertSchema(pricebooks).omit({
  id: true,
  createdAt: true,
  effectiveFrom: true,
});

export const insertUsageRecordSchema = createInsertSchema(usageRecords).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export const insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertFreeTierUsageSchema = createInsertSchema(freeTierUsage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookEndpointSchema = createInsertSchema(webhookEndpoints).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceRuleSchema = createInsertSchema(complianceRules).omit({
  id: true,
  createdAt: true,
});

export const insertEscrowHoldingSchema = createInsertSchema(escrowHoldings).omit({
  id: true,
  createdAt: true,
  releasedAt: true,
});

// Contact form submissions table
export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address"),
  isRead: boolean("is_read").default(false),
  response: text("response"), // For storing admin response
  respondedAt: timestamp("responded_at")
});

// Client-safe contact submission schema (excludes admin-only fields)
export const clientContactSubmissionSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  subject: true,
  message: true
});

// Full schema for internal use (includes all fields except auto-generated ones)
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  submittedAt: true,
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Endpoint = typeof endpoints.$inferSelect;
export type InsertEndpoint = z.infer<typeof insertEndpointSchema>;

export type Pricebook = typeof pricebooks.$inferSelect;
export type InsertPricebook = z.infer<typeof insertPricebookSchema>;

export type UsageRecord = typeof usageRecords.$inferSelect;
export type InsertUsageRecord = z.infer<typeof insertUsageRecordSchema>;

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;

export type FreeTierUsage = typeof freeTierUsage.$inferSelect;
export type InsertFreeTierUsage = z.infer<typeof insertFreeTierUsageSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;
export type InsertWebhookEndpoint = z.infer<typeof insertWebhookEndpointSchema>;

export type ComplianceRule = typeof complianceRules.$inferSelect;
export type InsertComplianceRule = z.infer<typeof insertComplianceRuleSchema>;

export type EscrowHolding = typeof escrowHoldings.$inferSelect;
export type InsertEscrowHolding = z.infer<typeof insertEscrowHoldingSchema>;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ClientContactSubmission = z.infer<typeof clientContactSubmissionSchema>;

// Legacy support - keeping old schema for backward compatibility
export const apiEndpoints = endpoints;
export const transactions = usageRecords;
export const analytics = freeTierUsage;
