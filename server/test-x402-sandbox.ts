#!/usr/bin/env tsx

import { storage } from "./storage-db";

async function testX402SandboxIntegration() {
  console.log("🔐 Testing x402 Proxy with Sandbox Mode\n");

  try {
    // Get current sandbox state
    const org = await storage.getOrganization("demo-org");
    console.log(`📊 Organization Mode: ${org?.sandboxMode ? 'Sandbox (Base Sepolia)' : 'Production (Base Mainnet)'}\n`);

    // Test unpaid request (should return 402 with network info)
    console.log("🚫 Testing unpaid request...");
    const unpaidResponse = await fetch("http://localhost:5000/proxy/demo-org/demo-service/users/123", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (unpaidResponse.status === 402) {
      const paymentData = await unpaidResponse.json();
      console.log(`   ✅ Received 402 Payment Required`);
      console.log(`   💰 Price: ${paymentData.pricing?.amount} ${paymentData.pricing?.currency}`);
      console.log(`   🌐 Network: ${paymentData.pricing?.network}`);
      console.log(`   📋 Quote: ${unpaidResponse.headers.get('X-402-QUOTE')?.substring(0, 50)}...`);
    } else {
      console.log(`   ❌ Expected 402, got ${unpaidResponse.status}`);
    }

    console.log();

    // Test with mock payment
    console.log("💳 Testing with mock payment...");
    const mockTxHash = org?.sandboxMode 
      ? "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" // Sandbox
      : "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"; // Production

    const paidResponse = await fetch("http://localhost:5000/proxy/demo-org/demo-service/users/123", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Payment": mockTxHash,
        "X-Payer-Address": "0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0"
      }
    });

    if (paidResponse.ok) {
      console.log(`   ✅ Payment accepted (${paidResponse.status})`);
      console.log(`   📝 Response: ${await paidResponse.text()}`);
    } else {
      console.log(`   ❌ Payment rejected (${paidResponse.status}): ${await paidResponse.text()}`);
    }

    console.log();

    // Test sandbox toggle impact
    console.log("🔄 Testing sandbox toggle impact...");
    
    // Toggle sandbox mode
    const currentMode = org?.sandboxMode;
    await fetch("http://localhost:5000/api/organization/sandbox", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sandboxMode: !currentMode })
    });

    console.log(`   📊 Toggled to: ${!currentMode ? 'Sandbox' : 'Production'} mode`);

    // Test request in new mode
    const toggledResponse = await fetch("http://localhost:5000/proxy/demo-org/demo-service/users/456", {
      method: "GET"
    });

    if (toggledResponse.status === 402) {
      const toggledData = await toggledResponse.json();
      console.log(`   🌐 New network: ${toggledData.pricing?.network}`);
      console.log(`   📋 Sandbox flag: ${toggledData.sandbox}`);
    }

    // Restore original mode
    await fetch("http://localhost:5000/api/organization/sandbox", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sandboxMode: currentMode })
    });

    console.log(`   ↩️  Restored to: ${currentMode ? 'Sandbox' : 'Production'} mode`);

    console.log("\n✅ x402 sandbox integration test completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testX402SandboxIntegration();