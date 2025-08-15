import { 
  type User, 
  type InsertUser,
  type ApiEndpoint,
  type InsertApiEndpoint,
  type Transaction,
  type InsertTransaction,
  type Analytics,
  type InsertAnalytics,
  type ComplianceRule,
  type InsertComplianceRule,
  type EscrowHolding,
  type InsertEscrowHolding
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // API Endpoint methods
  getApiEndpoint(id: string): Promise<ApiEndpoint | undefined>;
  getApiEndpointsByUserId(userId: string): Promise<ApiEndpoint[]>;
  getApiEndpointByPath(path: string): Promise<ApiEndpoint | undefined>;
  createApiEndpoint(endpoint: InsertApiEndpoint): Promise<ApiEndpoint>;
  updateApiEndpoint(id: string, updates: Partial<ApiEndpoint>): Promise<ApiEndpoint | undefined>;
  deleteApiEndpoint(id: string): Promise<boolean>;

  // Transaction methods
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByEndpointId(endpointId: string): Promise<Transaction[]>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  getRecentTransactions(userId: string, limit?: number): Promise<Transaction[]>;

  // Analytics methods
  getAnalytics(endpointId: string, startDate: Date, endDate: Date): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getUserAnalyticsSummary(userId: string): Promise<{
    totalRevenue: string;
    totalRequests: number;
    totalPaidRequests: number;
    activeEndpoints: number;
  }>;

  // Compliance methods
  getComplianceRules(userId: string): Promise<ComplianceRule[]>;
  createComplianceRule(rule: InsertComplianceRule): Promise<ComplianceRule>;
  updateComplianceRule(id: string, updates: Partial<ComplianceRule>): Promise<ComplianceRule | undefined>;
  deleteComplianceRule(id: string): Promise<boolean>;

  // Escrow methods
  getEscrowHoldings(userId: string): Promise<EscrowHolding[]>;
  createEscrowHolding(holding: InsertEscrowHolding): Promise<EscrowHolding>;
  updateEscrowHolding(id: string, updates: Partial<EscrowHolding>): Promise<EscrowHolding | undefined>;
  getEscrowSummary(userId: string): Promise<{
    pendingAmount: string;
    releasedToday: string;
    totalRefunds: string;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private apiEndpoints: Map<string, ApiEndpoint> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private analytics: Map<string, Analytics> = new Map();
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private escrowHoldings: Map<string, EscrowHolding> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create a demo user
    const demoUser: User = {
      id: "demo-user-1",
      username: "demo",
      password: "password",
      email: "demo@paygate402.com",
      walletAddress: "0x1234567890123456789012345678901234567890",
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo API endpoints
    const endpoints: ApiEndpoint[] = [
      {
        id: "endpoint-1",
        userId: demoUser.id,
        name: "Weather API",
        description: "Real-time weather data",
        path: "/api/v1/weather",
        targetUrl: "https://api.openweathermap.org/data/2.5/weather",
        price: "0.001",
        priceUnit: "USDC",
        isActive: true,
        network: "base",
        createdAt: new Date(),
      },
      {
        id: "endpoint-2",
        userId: demoUser.id,
        name: "AI Chat API",
        description: "AI conversation API",
        path: "/api/v1/ai-chat",
        targetUrl: "https://api.openai.com/v1/chat/completions",
        price: "0.010",
        priceUnit: "USDC",
        isActive: true,
        network: "base",
        createdAt: new Date(),
      },
      {
        id: "endpoint-3",
        userId: demoUser.id,
        name: "Translation API",
        description: "Text translation service",
        path: "/api/v1/translate",
        targetUrl: "https://api.deepl.com/v2/translate",
        price: "0.005",
        priceUnit: "USDC",
        isActive: false,
        network: "base",
        createdAt: new Date(),
      },
    ];

    endpoints.forEach(endpoint => this.apiEndpoints.set(endpoint.id, endpoint));

    // Create demo transactions
    const now = new Date();
    const transactions: Transaction[] = [
      {
        id: "tx-1",
        endpointId: "endpoint-1",
        payerAddress: "0x1111111111111111111111111111111111111111",
        amount: "0.001",
        currency: "USDC",
        status: "completed",
        txHash: "0xabc123...",
        escrowReleaseAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 2 * 60 * 1000),
        completedAt: new Date(now.getTime() - 2 * 60 * 1000),
      },
      {
        id: "tx-2",
        endpointId: "endpoint-2",
        payerAddress: "0x2222222222222222222222222222222222222222",
        amount: "0.010",
        currency: "USDC",
        status: "completed",
        txHash: "0xdef456...",
        escrowReleaseAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 5 * 60 * 1000),
        completedAt: new Date(now.getTime() - 5 * 60 * 1000),
      },
      {
        id: "tx-3",
        endpointId: "endpoint-1",
        payerAddress: "0x3333333333333333333333333333333333333333",
        amount: "0.001",
        currency: "USDC",
        status: "failed",
        txHash: null,
        escrowReleaseAt: null,
        createdAt: new Date(now.getTime() - 8 * 60 * 1000),
        completedAt: null,
      },
    ];

    transactions.forEach(tx => this.transactions.set(tx.id, tx));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // API Endpoint methods
  async getApiEndpoint(id: string): Promise<ApiEndpoint | undefined> {
    return this.apiEndpoints.get(id);
  }

  async getApiEndpointsByUserId(userId: string): Promise<ApiEndpoint[]> {
    return Array.from(this.apiEndpoints.values()).filter(endpoint => endpoint.userId === userId);
  }

  async getApiEndpointByPath(path: string): Promise<ApiEndpoint | undefined> {
    return Array.from(this.apiEndpoints.values()).find(endpoint => endpoint.path === path);
  }

  async createApiEndpoint(insertEndpoint: InsertApiEndpoint): Promise<ApiEndpoint> {
    const id = randomUUID();
    const endpoint: ApiEndpoint = {
      ...insertEndpoint,
      id,
      createdAt: new Date(),
    };
    this.apiEndpoints.set(id, endpoint);
    return endpoint;
  }

  async updateApiEndpoint(id: string, updates: Partial<ApiEndpoint>): Promise<ApiEndpoint | undefined> {
    const endpoint = this.apiEndpoints.get(id);
    if (!endpoint) return undefined;
    
    const updated = { ...endpoint, ...updates };
    this.apiEndpoints.set(id, updated);
    return updated;
  }

  async deleteApiEndpoint(id: string): Promise<boolean> {
    return this.apiEndpoints.delete(id);
  }

  // Transaction methods
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByEndpointId(endpointId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(tx => tx.endpointId === endpointId);
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    const userEndpoints = await this.getApiEndpointsByUserId(userId);
    const endpointIds = userEndpoints.map(e => e.id);
    return Array.from(this.transactions.values()).filter(tx => endpointIds.includes(tx.endpointId));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updated = { ...transaction, ...updates };
    this.transactions.set(id, updated);
    return updated;
  }

  async getRecentTransactions(userId: string, limit = 10): Promise<Transaction[]> {
    const userTransactions = await this.getTransactionsByUserId(userId);
    return userTransactions
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  // Analytics methods
  async getAnalytics(endpointId: string, startDate: Date, endDate: Date): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      analytics => 
        analytics.endpointId === endpointId &&
        analytics.date >= startDate &&
        analytics.date <= endDate
    );
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getUserAnalyticsSummary(userId: string): Promise<{
    totalRevenue: string;
    totalRequests: number;
    totalPaidRequests: number;
    activeEndpoints: number;
  }> {
    const userTransactions = await this.getTransactionsByUserId(userId);
    const userEndpoints = await this.getApiEndpointsByUserId(userId);
    
    const completedTransactions = userTransactions.filter(tx => tx.status === "completed");
    const totalRevenue = completedTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
    return {
      totalRevenue: totalRevenue.toFixed(6),
      totalRequests: userTransactions.length,
      totalPaidRequests: completedTransactions.length,
      activeEndpoints: userEndpoints.filter(e => e.isActive).length,
    };
  }

  // Compliance methods
  async getComplianceRules(userId: string): Promise<ComplianceRule[]> {
    return Array.from(this.complianceRules.values()).filter(rule => rule.userId === userId);
  }

  async createComplianceRule(insertRule: InsertComplianceRule): Promise<ComplianceRule> {
    const id = randomUUID();
    const rule: ComplianceRule = {
      ...insertRule,
      id,
      createdAt: new Date(),
    };
    this.complianceRules.set(id, rule);
    return rule;
  }

  async updateComplianceRule(id: string, updates: Partial<ComplianceRule>): Promise<ComplianceRule | undefined> {
    const rule = this.complianceRules.get(id);
    if (!rule) return undefined;
    
    const updated = { ...rule, ...updates };
    this.complianceRules.set(id, updated);
    return updated;
  }

  async deleteComplianceRule(id: string): Promise<boolean> {
    return this.complianceRules.delete(id);
  }

  // Escrow methods
  async getEscrowHoldings(userId: string): Promise<EscrowHolding[]> {
    return Array.from(this.escrowHoldings.values()).filter(holding => holding.userId === userId);
  }

  async createEscrowHolding(insertHolding: InsertEscrowHolding): Promise<EscrowHolding> {
    const id = randomUUID();
    const holding: EscrowHolding = {
      ...insertHolding,
      id,
      createdAt: new Date(),
    };
    this.escrowHoldings.set(id, holding);
    return holding;
  }

  async updateEscrowHolding(id: string, updates: Partial<EscrowHolding>): Promise<EscrowHolding | undefined> {
    const holding = this.escrowHoldings.get(id);
    if (!holding) return undefined;
    
    const updated = { ...holding, ...updates };
    this.escrowHoldings.set(id, updated);
    return updated;
  }

  async getEscrowSummary(userId: string): Promise<{
    pendingAmount: string;
    releasedToday: string;
    totalRefunds: string;
  }> {
    const holdings = await this.getEscrowHoldings(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pending = holdings
      .filter(h => h.status === "pending")
      .reduce((sum, h) => sum + parseFloat(h.amount), 0);
    
    const releasedToday = holdings
      .filter(h => h.status === "released" && h.createdAt! >= today)
      .reduce((sum, h) => sum + parseFloat(h.amount), 0);
    
    const refunds = holdings
      .filter(h => h.status === "refunded")
      .reduce((sum, h) => sum + parseFloat(h.amount), 0);
    
    return {
      pendingAmount: pending.toFixed(6),
      releasedToday: releasedToday.toFixed(6),
      totalRefunds: refunds.toFixed(6),
    };
  }
}

export const storage = new MemStorage();
