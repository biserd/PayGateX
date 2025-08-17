#!/usr/bin/env tsx

import { storage } from "./storage-db";
import { getNetworkForSandbox, getNetworkConfig, isTestnet } from "./services/network-config";

async function testSandboxNetworkConfiguration() {
  console.log("🧪 Testing Sandbox Network Configuration\n");

  try {
    // Get demo organization
    const org = await storage.getOrganization("demo-org");
    if (!org) {
      console.error("❌ Demo organization not found");
      return;
    }

    console.log(`📊 Current Organization State:`);
    console.log(`   Name: ${org.name}`);
    console.log(`   Sandbox Mode: ${org.sandboxMode ? '✅ ENABLED (Testing)' : '❌ DISABLED (Production)'}`);
    console.log();

    // Test network determination
    const mainnetNetwork = "base";
    const sandboxNetwork = getNetworkForSandbox(org.sandboxMode, mainnetNetwork);
    
    console.log(`🌐 Network Configuration:`);
    console.log(`   Base Network: ${mainnetNetwork}`);
    console.log(`   Current Mode: ${org.sandboxMode ? 'Sandbox' : 'Production'}`);
    console.log(`   Active Network: ${sandboxNetwork}`);
    console.log(`   Is Testnet: ${isTestnet(sandboxNetwork) ? '✅ Yes' : '❌ No'}`);
    console.log();

    // Get network details
    const networkConfig = getNetworkConfig(sandboxNetwork);
    console.log(`⚙️  Network Details:`);
    console.log(`   Chain ID: ${networkConfig.chainId}`);
    console.log(`   Name: ${networkConfig.name}`);
    console.log(`   RPC URL: ${networkConfig.rpcUrl}`);
    console.log(`   USDC Address: ${networkConfig.usdcAddress}`);
    console.log(`   Block Explorer: ${networkConfig.blockExplorer}`);
    console.log();

    // Test both modes
    console.log(`🔄 Testing Mode Toggle:`);
    
    // Test sandbox mode (should use Base Sepolia)
    const sandboxTestNetwork = getNetworkForSandbox(true, "base");
    const sandboxConfig = getNetworkConfig(sandboxTestNetwork);
    console.log(`   Sandbox Mode → ${sandboxTestNetwork} (Chain ID: ${sandboxConfig.chainId})`);
    
    // Test production mode (should use Base mainnet)
    const productionTestNetwork = getNetworkForSandbox(false, "base");
    const productionConfig = getNetworkConfig(productionTestNetwork);
    console.log(`   Production Mode → ${productionTestNetwork} (Chain ID: ${productionConfig.chainId})`);
    console.log();

    // Test API endpoints
    console.log(`🔗 Testing API Endpoints:`);
    const response = await fetch("http://localhost:5000/api/organization/sandbox");
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ GET /api/organization/sandbox → sandboxMode: ${data.sandboxMode}`);
    } else {
      console.log(`   ❌ GET /api/organization/sandbox → ${response.status} ${response.statusText}`);
    }

    // Test toggle endpoint
    const toggleResponse = await fetch("http://localhost:5000/api/organization/sandbox", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sandboxMode: !org.sandboxMode })
    });

    if (toggleResponse.ok) {
      const toggleData = await toggleResponse.json();
      console.log(`   ✅ PUT /api/organization/sandbox → toggled to: ${toggleData.sandboxMode}`);
      
      // Toggle back
      await fetch("http://localhost:5000/api/organization/sandbox", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sandboxMode: org.sandboxMode })
      });
      console.log(`   ✅ Restored original state: ${org.sandboxMode}`);
    } else {
      console.log(`   ❌ PUT /api/organization/sandbox → ${toggleResponse.status} ${toggleResponse.statusText}`);
    }

    console.log("\n✅ Sandbox configuration test completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testSandboxNetworkConfiguration();