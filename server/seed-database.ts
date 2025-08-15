import { DatabaseStorage } from "./storage-db";

async function seedDatabase() {
  const storage = new DatabaseStorage();

  console.log("🌱 Seeding database with demo data...");

  try {
    // Create demo organization
    const demoOrg = await storage.createOrganization({
      id: "demo-org-1",
      name: "Demo Organization",
      slug: "demo-org",
      email: "demo@paygate402.com",
      website: "https://demo.paygate402.com", 
      escrowPeriodDays: 7,
      freeTierLimits: { 
        requestsPerDay: 1000,
        requestsPerMonth: 10000 
      }
    });

    // Create demo service
    const demoService = await storage.createService({
      id: "demo-service-1",
      orgId: demoOrg.id,
      name: "AI API Service", 
      description: "AI and analytics endpoints",
      slug: "ai-api",
      baseUrl: "https://api.openai.com"
    });

    // Create demo endpoints
    const endpoint1 = await storage.createEndpoint({
      id: "endpoint-1",
      serviceId: demoService.id,
      path: "/ai/chat",
      method: "POST",
      description: "AI Chat completion endpoint",
      isActive: true,
      supportedNetworks: ["base", "ethereum"]
    });

    const endpoint2 = await storage.createEndpoint({
      id: "endpoint-2", 
      serviceId: demoService.id,
      path: "/data/analytics",
      method: "GET", 
      description: "Analytics data endpoint",
      isActive: true,
      supportedNetworks: ["base"]
    });

    // Create pricing for endpoints
    await storage.createPricing({
      id: "pricing-1",
      endpointId: endpoint1.id,
      price: "0.001",
      currency: "USDC",
      network: "base",
      effectiveFrom: new Date()
    });

    await storage.createPricing({
      id: "pricing-2", 
      endpointId: endpoint2.id,
      price: "0.0005",
      currency: "USDC", 
      network: "base",
      effectiveFrom: new Date()
    });

    // Create demo usage records
    await storage.createUsageRecord({
      id: "usage-1",
      requestId: "req-1",
      endpointId: endpoint1.id,
      orgId: demoOrg.id,
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
      isFreeRequest: false,
      paidAt: new Date()
    });

    await storage.createUsageRecord({
      id: "usage-2",
      requestId: "req-2", 
      endpointId: endpoint2.id,
      orgId: demoOrg.id,
      payerAddress: "0x2222222222222222222222222222222222222222",
      ipAddress: "192.168.1.2",
      userAgent: "Demo Client/1.0",
      price: "0.0005",
      currency: "USDC",
      network: "base",
      status: "unpaid",
      latencyMs: 95,
      responseStatus: 402,
      isFreeRequest: false
    });

    // Create escrow holding for the paid transaction  
    await storage.createEscrowHolding({
      id: "escrow-1",
      orgId: demoOrg.id,
      usageRecordId: "usage-1",
      payerAddress: "0x1111111111111111111111111111111111111111",
      amount: "0.001",
      currency: "USDC",
      network: "base",
      status: "pending",
      releaseAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    console.log("✅ Database seeded successfully!");
    console.log(`Created organization: ${demoOrg.name}`);
    console.log(`Created service: ${demoService.name}`);
    console.log(`Created ${2} endpoints with pricing`);
    console.log(`Created ${2} usage records (1 paid, 1 unpaid)`);
    console.log(`Created ${1} escrow holding`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

export { seedDatabase };