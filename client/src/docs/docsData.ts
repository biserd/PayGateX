export interface DocPage {
  slug: string;
  title: string;
  summary: string;
  content: string; // Simplified to string content
  seoDescription?: string;
}

export interface DocSection {
  title: string;
  slug: string;
  description: string;
  pages: DocPage[];
}

export const docsData: DocSection[] = [
  {
    title: "Introduction",
    slug: "introduction", 
    description: "Get started with PayGate x402 - the API monetization platform",
    pages: [
      {
        slug: "about-paygate",
        title: "About PayGate x402",
        summary: "Understand what PayGate x402 is and how it revolutionizes API monetization",
        seoDescription: "PayGate x402 is a payment proxy platform that implements the x402 payment protocol for API monetization through automated micropayments.",
        content: `# About PayGate x402

PayGate x402 is a sophisticated payment proxy platform that implements the x402 payment protocol for APIs, allowing developers to monetize their API endpoints through automated micropayments.

## What is x402?

The x402 payment protocol extends HTTP with payment requirements. When an API endpoint requires payment, it responds with HTTP status code 402 (Payment Required) along with payment instructions. Once payment is verified, the request proceeds to the target API.

## Platform Architecture

**Payment Flow:**
1. API request → PayGate x402 proxy
2. Check payment requirements
3. If unpaid → Return 402 with signed quote
4. If paid → Verify payment → Forward to API
5. Return API response to client

## Key Features

- **x402 Protocol Implementation**: Full HTTP 402 payment protocol support
- **Multi-Network Support**: Base, Ethereum, and other blockchain networks
- **Real-time Analytics**: Comprehensive usage tracking and revenue reporting
- **Compliance Controls**: Geographic restrictions and IP filtering
- **Escrow System**: Time-based payment holds with dispute resolution
- **Free Tier Management**: Configurable free request limits
- **Facilitator Adapters**: Pluggable payment verification (Coinbase, x402.rs, Mock)

## What makes PayGate x402 unique?

- **Protocol-Native**: Built specifically for the x402 payment protocol
- **Developer-First**: Simple integration with existing APIs
- **Transparent Pricing**: Static USDC pricing with versioned pricebooks
- **Sandbox Mode**: Test with Base Sepolia before mainnet deployment
- **Enterprise Ready**: Multi-tenant architecture with organization isolation
- **Comprehensive Compliance**: Built-in geo-blocking and wallet restrictions

## Use Cases

### API Monetization
Transform any REST API into a revenue-generating service with per-call pricing.

### AI Agent Access
Enable AI agents to make paid API calls using blockchain payments.

### Data Services
Monetize data APIs, analytics endpoints, and real-time information feeds.

### Enterprise APIs
Add payment requirements to internal or partner APIs with compliance controls.`
      },
      {
        slug: "explore-products",
        title: "Explore Products",
        summary: "Overview of PayGate x402's core products and capabilities",
        seoDescription: "Explore PayGate x402's products: x402 Proxy, Facilitator Adapters, Analytics, Compliance, Escrow, and Multi-network support.",
        content: `# Explore Products

PayGate x402 offers a comprehensive suite of products to monetize and manage your APIs through the x402 payment protocol.

## x402 Proxy
Core monetization engine that intercepts API calls, enforces payment requirements, and forwards requests after verification.

**Features:**
- HTTP 402 response handling
- Request/response forwarding
- Payment verification
- Free tier enforcement

## Facilitator Adapters
Pluggable payment verification system supporting multiple blockchain networks and payment providers.

**Supported Adapters:**
- Coinbase Commerce integration
- x402.rs protocol support
- Mock adapter for testing
- Custom adapter support

## Real-time Analytics
Comprehensive usage tracking, revenue reporting, and performance monitoring with real-time updates.

**Capabilities:**
- Revenue and request metrics
- Conversion rate tracking
- Latency monitoring
- Usage record analysis

## Compliance Controls
Comprehensive compliance framework with geographic restrictions, IP filtering, and wallet management.

**Features:**
- Geographic geo-blocking
- IP address filtering
- Wallet allowlists/denylists
- Audit trail logging

## Escrow & Disputes
Time-based payment escrow system with automatic release and comprehensive dispute resolution.

**Features:**
- Configurable hold periods
- Automatic payment release
- Dispute management
- Refund processing

## Multi-Network Support
Support for multiple blockchain networks with sandbox and production modes.

**Supported Networks:**
- Base mainnet & Sepolia testnet
- Ethereum mainnet & testnets
- Network-aware payment verification
- Seamless sandbox-to-production migration

## Getting Started

Ready to monetize your APIs? Here's how to get started:

1. Set up your organization and configure wallet addresses
2. Create your first API endpoint with pricing
3. Test in sandbox mode with Base Sepolia
4. Implement compliance rules as needed
5. Go live with mainnet payments`
      }
    ]
  },
  {
    title: "Getting Started",
    slug: "getting-started",
    description: "Quick setup guides and tutorials to get you running",
    pages: [
      {
        slug: "quickstart",
        title: "5-Minute Quickstart",
        summary: "Get your first paid API call working in under 5 minutes",
        seoDescription: "Quick setup guide for PayGate x402 - create an endpoint and make your first paid API call in under 5 minutes.",
        content: `# 5-Minute Quickstart

Get your first paid API call working with PayGate x402 in under 5 minutes. This guide will take you from setup to your first successful payment.

## Prerequisites

- A wallet with Base Sepolia ETH (for testnet)
- Basic understanding of REST APIs
- cURL or HTTP client for testing

## Step 1: Access the Dashboard

Navigate to the PayGate x402 dashboard and authenticate. The demo organization is pre-configured for testing.

\`\`\`
Organization: Demo Organization
Sandbox Mode: Enabled (Base Sepolia)
Wallet: 0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0
\`\`\`

## Step 2: Create Your First Endpoint

Go to the Endpoints page and create a new API endpoint:

1. Click "Create Endpoint"
2. Enter endpoint details:
   - **Path:** \`/cats/fact\`
   - **Method:** GET
   - **Target URL:** \`https://catfact.ninja/fact\`
   - **Price:** 0.01 USDC
3. Click "Create" to save

## Step 3: Test Unpaid Request (Expect 402)

Make a request without payment to see the x402 response:

\`\`\`bash
curl -i https://your-paygate-domain.replit.app/proxy/cats/fact
\`\`\`

Expected response (HTTP 402):

\`\`\`
HTTP/1.1 402 Payment Required
x402-price: 0.01
x402-currency: USDC
x402-network: base-sepolia
x402-address: 0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0
x402-quote-id: quote_123abc

{
  "error": "Payment required",
  "amount": "0.01",
  "currency": "USDC",
  "network": "base-sepolia"
}
\`\`\`

## Step 4: Make a Payment

Send USDC to the provided address on Base Sepolia:

> **For Testing:** The system uses a mock facilitator by default, so you can simulate payments without actual USDC transfers.

## Step 5: Make Paid Request

Include payment proof in your request headers:

\`\`\`bash
curl -H "x-payment: mock_tx_hash_123" \\
     https://your-paygate-domain.replit.app/proxy/cats/fact
\`\`\`

Expected response (HTTP 200):

\`\`\`json
{
  "fact": "A cat's hearing is better than a dog's...",
  "length": 41
}
\`\`\`

## Step 6: View Analytics

Check the Analytics page to see your request and revenue data:
- Total requests: 2 (1 unpaid, 1 paid)
- Revenue: $0.01 USDC
- Conversion rate: 50%

## 🎉 Congratulations!

You've successfully set up your first monetized API endpoint with PayGate x402. Your API is now generating revenue through the x402 payment protocol!

## Next Steps

- [Set up Base Sepolia wallet for real testing](/docs/getting-started/sandbox-setup)
- [Learn more about the x402 protocol](/docs/concepts/x402-protocol)
- Configure Coinbase facilitator for production (Coming soon)
- Complete API monetization tutorial (Coming soon)`
      },
      {
        slug: "sandbox-setup",
        title: "Sandbox Setup",
        summary: "Configure Base Sepolia testnet for development and testing",
        seoDescription: "Learn how to set up Base Sepolia testnet wallet and configure PayGate x402 for development testing.",
        content: `# Sandbox Setup

Set up Base Sepolia testnet for safe development and testing before deploying to mainnet. This guide covers wallet configuration, testnet tokens, and sandbox mode.

## ⚠️ Sandbox vs Production

Sandbox mode uses Base Sepolia testnet with test tokens. Production mode uses Base mainnet with real USDC. Always test thoroughly in sandbox before going live.

## Step 1: Set Up Base Sepolia Wallet

You'll need a wallet configured for Base Sepolia testnet:

### MetaMask Configuration

1. Open MetaMask and click "Add Network"
2. Select "Add a network manually"
3. Enter Base Sepolia details:
   \`\`\`
   Network Name: Base Sepolia
   RPC URL: https://sepolia.base.org
   Chain ID: 84532
   Currency Symbol: ETH
   Block Explorer: https://sepolia.basescan.org
   \`\`\`
4. Click "Save" to add the network

## Step 2: Get Testnet Tokens

You'll need Base Sepolia ETH and testnet USDC:

### Base Sepolia ETH

1. Visit the [Base Sepolia Bridge](https://bridge.base.org/deposit)
2. Connect your wallet and switch to Base Sepolia
3. Use the faucet to get testnet ETH

### Testnet USDC

**Demo Wallet:** The system includes a pre-funded demo wallet for testing:
\`\`\`
Address: 0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0
\`\`\`

## Step 3: Configure PayGate Organization

Set up your organization for sandbox testing:

### Organization Settings

1. Navigate to Settings page
2. Ensure sandbox mode is enabled
3. Configure testnet wallet address
4. Set free tier limits for testing

Current Demo Organization Settings:
\`\`\`
Sandbox Mode: ✅ Enabled
Testnet Wallet: 0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0
Network: Base Sepolia (Chain ID: 84532)
Free Tier: 100 requests per 30 days
\`\`\`

## Step 4: Test Payment Flow

Verify your sandbox setup with a complete payment test:

### Create Test Endpoint

\`\`\`bash
curl -X POST https://your-domain.replit.app/api/endpoints \\
  -H "Content-Type: application/json" \\
  -d '{
    "path": "/test/sandbox",
    "method": "GET", 
    "targetUrl": "https://httpbin.org/json",
    "price": "0.005",
    "currency": "USDC"
  }'
\`\`\`

### Test Unpaid Request

\`\`\`bash
curl -i https://your-domain.replit.app/proxy/test/sandbox
\`\`\`

### Expected 402 Response

\`\`\`
HTTP/1.1 402 Payment Required
x402-price: 0.005
x402-currency: USDC
x402-network: base-sepolia
x402-chain-id: 84532
x402-address: 0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0
\`\`\`

## Step 5: Facilitator Configuration

Configure the payment facilitator for sandbox testing:

### Environment Variables

\`\`\`bash
# For testing with mock facilitator
FACILITATOR_TYPE=mock

# For Coinbase integration (production)
FACILITATOR_TYPE=coinbase
COINBASE_FACILITATOR_URL=https://facilitator.coinbase.com
COINBASE_API_KEY=your_api_key_here
\`\`\`

### Mock Facilitator Testing

The mock facilitator accepts any payment proof for testing:

\`\`\`bash
curl -H "x-payment: mock_tx_sandbox_test" \\
     https://your-domain.replit.app/proxy/test/sandbox
\`\`\`

## Step 6: Verify Analytics

Check that usage is being tracked correctly:

1. Navigate to Analytics page
2. Verify sandbox transactions appear
3. Check network column shows "base-sepolia"
4. Confirm pricing matches your configuration

## ✅ Sandbox Ready

Your sandbox environment is now configured and ready for development. You can safely test all PayGate x402 features without using real funds.

## Moving to Production

When ready to go live:

1. Configure mainnet wallet address
2. Disable sandbox mode
3. Update facilitator to production settings
4. Test with small amounts first
5. Monitor analytics and compliance

## ⚠️ Production Checklist

- ✅ Testnet functionality verified
- ✅ Compliance rules configured
- ✅ Escrow settings reviewed
- ✅ Pricing strategy finalized
- ✅ Monitoring and alerts set up`
      }
    ]
  },
  {
    title: "API Testing",
    slug: "api-testing", 
    description: "Testing guides and tools for PayGate x402 integration",
    pages: [
      {
        slug: "postman-testing",
        title: "Postman Testing Guide",
        summary: "Complete guide for testing PayGate x402 APIs using Postman collections",
        seoDescription: "Learn how to test PayGate x402 APIs with Postman - setup collections, test payment flows, and validate x402 responses.",
        content: `# Testing PayGate x402 with Postman

Complete Postman testing guide for your PayGate x402 APIs with automated test scripts and collection setup.

## Setup Postman Collection

1. **Create New Collection**: "PayGate x402 Testing"
2. **Set Collection Variables**:
   - \`base_url\`: \`http://localhost:5000\`
   - \`org_id\`: \`demo-org\` (or your actual org ID)
   - \`service_id\`: \`demo-service\` (or your actual service ID)
   - \`endpoint_path\`: Your endpoint path (e.g., \`cats\`, \`fact\`, etc.)

## Test 1: Unpaid Request (Should Get HTTP 402)

**Request Setup:**
- **Method**: GET (or your endpoint's method)
- **URL**: \`{{base_url}}/proxy/{{org_id}}/{{service_id}}/{{endpoint_path}}\`
- **Headers**: None needed for first test

**Expected Response:**
- **Status**: 402 Payment Required
- **Body**: x402 protocol compliant JSON:

\`\`\`json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "base",
    "maxAmountRequired": "500", 
    "resource": "/demo-org-1/demo-service-1/api/v1/cats",
    "description": "API access",
    "payTo": "demo-org-1",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }]
}
\`\`\`

**Postman Test Script:**

\`\`\`javascript
pm.test("Status is 402", function () {
    pm.response.to.have.status(402);
});

pm.test("Response has quote header", function () {
    const quoteHeader = pm.response.headers.get("X-402-QUOTE");
    pm.expect(quoteHeader).to.not.be.null;
    
    // Decode the base64 quote
    const quoteData = JSON.parse(atob(quoteHeader));
    pm.expect(quoteData).to.have.property('nonce');
    
    // Save quote nonce as quote ID for next request
    pm.collectionVariables.set("quote_id", quoteData.nonce);
    pm.collectionVariables.set("quote_signature", quoteData.signature);
});
\`\`\`

## Test 2: Simulate Payment (Development Only)

**Request Setup:**
- **Method**: POST
- **URL**: \`{{base_url}}/api/payments/simulate\`
- **Headers**: 
  - \`Content-Type\`: \`application/json\`
- **Body** (raw JSON):

\`\`\`json
{
  "endpointId": "endpoint-1",
  "amount": "0.001"
}
\`\`\`

**Expected Response:**
- **Status**: 200 OK
- **Body**: Payment simulation success

## Test 3: Paid Request (Should Get API Response)

**Request Setup:**
- **Method**: GET (same as Test 1)
- **URL**: \`{{base_url}}/proxy/{{org_id}}/{{service_id}}/{{endpoint_path}}\`
- **Headers**:
  - \`x-payment\`: \`{{simulated_tx_hash}}\` (from Test 2)
  - \`x-payer-address\`: \`0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0\`

**Expected Response:**
- **Status**: 200 OK
- **Body**: Actual API response from target service

**Postman Test Script:**

\`\`\`javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains API data", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.be.an('object');
});
\`\`\`

## Automated Test Collection

Create a complete collection with environment variables and automated test scripts:

### Environment Variables

\`\`\`json
{
  "base_url": "http://localhost:5000",
  "org_id": "demo-org",
  "service_id": "demo-service", 
  "wallet_address": "0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0"
}
\`\`\`

### Pre-request Scripts

\`\`\`javascript
// Generate unique request ID for testing
pm.collectionVariables.set("request_id", pm.globals.replaceIn('{{$guid}}'));

// Set timestamp
pm.collectionVariables.set("timestamp", new Date().toISOString());
\`\`\`

### Collection Runner

1. **Set up test data**: Create multiple test cases with different endpoints
2. **Run collection**: Execute all tests in sequence
3. **Generate report**: Export results for documentation
4. **CI/CD integration**: Use Newman for automated testing

## Troubleshooting

### Common Issues

**402 Response Missing Headers**
- Check endpoint configuration
- Verify pricing is set
- Confirm network settings

**Payment Verification Fails**
- Validate transaction hash format
- Check payer address matches
- Verify network (sandbox vs mainnet)

**API Not Forwarding**
- Check target URL is accessible
- Verify endpoint path mapping
- Review proxy configuration

### Debug Tips

1. **Enable Verbose Logging**: Check server logs for detailed error messages
2. **Test Direct API**: Bypass PayGate to test target API directly
3. **Check Network**: Ensure correct blockchain network is configured
4. **Validate Headers**: Use Postman console to inspect all headers

## Next Steps

- [Base Sepolia Testing Guide](/docs/api-testing/base-sepolia-testing) - Real blockchain testing
- Load Testing - Performance validation (Coming soon)
- Production Testing - Mainnet deployment (Coming soon)`
      },
      {
        slug: "base-sepolia-testing", 
        title: "Base Sepolia Testing",
        summary: "Test with real Base Sepolia testnet transactions and USDC payments",
        seoDescription: "Learn how to test PayGate x402 with real Base Sepolia testnet transactions using MetaMask and testnet USDC.",
        content: `# Base Sepolia Testing Guide

Test PayGate x402 with real Base Sepolia testnet transactions and USDC payments.

## Prerequisites

### 1. Wallet Setup
- **MetaMask or Compatible Wallet**: Install and set up
- **Base Sepolia Network**: Add to your wallet
  - Network Name: Base Sepolia
  - RPC URL: https://sepolia.base.org
  - Chain ID: 84532
  - Currency Symbol: ETH
  - Block Explorer: https://sepolia.basescan.org

### 2. Get Test Assets
- **ETH for Gas**: Get Base Sepolia ETH from faucet
  - Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
  - Connect wallet and claim test ETH
- **Test USDC**: Get Base Sepolia USDC
  - Contract: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  - Use Base Sepolia faucets or bridge small amounts

## Testing with PayGate x402

### 1. Enable Sandbox Mode

\`\`\`bash
# Ensure sandbox mode is enabled (Base Sepolia)
curl -X PUT "http://localhost:5000/api/organization/sandbox" \\
  -H "Content-Type: application/json" \\
  -d '{"sandboxMode": true}'
\`\`\`

### 2. Get Payment Quote

\`\`\`bash
# Request x402 quote for Base Sepolia
curl -s "http://localhost:5000/proxy/demo-org/demo-service/api/v1/cats"
\`\`\`

**Expected Response:**

\`\`\`json
{
  "error": "Payment required",
  "amount": "0.01",
  "currency": "USDC", 
  "network": "base-sepolia",
  "address": "0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0",
  "quote_id": "quote_abc123"
}
\`\`\`

### 3. Make USDC Payment

Using your wallet:
1. **Recipient**: Use the \`payTo\` address from the quote
2. **Amount**: Convert from the quote (e.g., "500" = 0.0005 USDC)
3. **Network**: Base Sepolia (Chain ID: 84532)
4. **Token**: USDC (0x036CbD53842c5426634e7929541eC2318f3dCF7e)

### 4. Test API with Payment Proof

\`\`\`bash
# Use the transaction hash from your USDC transfer
curl -s "http://localhost:5000/proxy/demo-org/demo-service/api/v1/cats" \\
  -H "x-payment: YOUR_TX_HASH" \\
  -H "x-payer-address: YOUR_WALLET_ADDRESS"
\`\`\`

## Wallet Address Configuration

### For Organizations
The organization's wallet address is configured in the database as the \`payTo\` field. This is where USDC payments are sent.

### For Users (Payers)
Users provide their wallet address in the \`x-payer-address\` header when making payments. This identifies who made the payment.

## Example Test Flow

1. **Get Quote**: Request shows Base Sepolia network and USDC amount
2. **Send USDC**: Transfer required amount to organization's address  
3. **Get Transaction Hash**: Copy from wallet or block explorer
4. **Test Access**: Use transaction hash to access protected API
5. **Verify**: Check Base Sepolia block explorer for transaction

## Network Configuration

- **Sandbox Mode**: Base Sepolia (testnet)
  - Safe for testing with small amounts
  - Same interface as mainnet
  - No real financial risk

- **Production Mode**: Base Mainnet
  - Real USDC transactions
  - Actual financial cost
  - Full production environment

## Verification Steps

### 1. Check Transaction Status

Visit [Base Sepolia Explorer](https://sepolia.basescan.org) and search for your transaction hash to confirm:
- Transaction was successful
- Correct amount was sent
- Correct recipient address
- USDC token transfer occurred

### 2. Verify PayGate Processing

Check PayGate logs for:
- Payment verification attempt
- Facilitator response
- Usage record creation
- API forwarding success

### 3. Validate Analytics

In the PayGate dashboard:
- Revenue should increase by payment amount
- Request count should increment
- Usage records should show \`paid\` status
- Network should display \`base-sepolia\`

## Troubleshooting

### Payment Not Recognized

**Symptoms**: API still returns 402 despite payment
**Solutions**:
- Verify transaction hash is correct
- Check payer address matches exactly
- Confirm payment amount meets minimum
- Wait for blockchain confirmation

### Wrong Network

**Symptoms**: Payment quote shows incorrect network
**Solutions**:
- Verify sandbox mode is enabled
- Check organization network configuration
- Restart PayGate with correct settings

### Insufficient Gas

**Symptoms**: Transaction fails in wallet
**Solutions**:
- Get more Base Sepolia ETH from faucet
- Increase gas limit if needed
- Try transaction during low network usage

## Moving to Production

When ready to switch to mainnet:

1. **Disable Sandbox Mode**:
   \`\`\`bash
   curl -X PUT "http://localhost:5000/api/organization/sandbox" \\
     -H "Content-Type: application/json" \\
     -d '{"sandboxMode": false}'
   \`\`\`

2. **Update Wallet Configuration**: Set mainnet wallet addresses
3. **Test with Small Amounts**: Start with minimal USDC amounts
4. **Monitor Analytics**: Watch for successful mainnet transactions
5. **Scale Gradually**: Increase usage as confidence grows

## Security Notes

- Never use mainnet private keys on testnet
- Store testnet and mainnet wallets separately  
- Monitor both networks for unauthorized transactions
- Keep detailed records of all test transactions`
      }
    ]
  },
  {
    title: "Tutorials", 
    slug: "tutorials",
    description: "Step-by-step guides for common PayGate x402 use cases",
    pages: [
      {
        slug: "complete-testing-guide",
        title: "Complete Platform Testing",
        summary: "End-to-end testing guide covering all PayGate x402 features",
        seoDescription: "Complete step-by-step testing guide for PayGate x402 - from authentication to payment enforcement and analytics.",
        content: `# PayGate x402 Complete Testing Guide

End-to-end testing guide covering all features of the PayGate x402 platform, from basic authentication to advanced payment enforcement and analytics.

## Prerequisites
- PayGate x402 application running (\`npm run dev\`)
- Access to the web interface
- Basic understanding of API endpoints and HTTP requests

## Step 1: Authentication & Account Setup

### 1.1 Create Account
1. Navigate to the landing page at \`http://localhost:5000\`
2. Click "Sign In" button in the header
3. On the auth page, switch to "Register" tab
4. Fill in registration form:
   - Username: \`testuser\`
   - Password: \`testpass123\`
5. Click "Register" - you should be automatically logged in
6. Verify you're redirected to the dashboard

### 1.2 Explore Dashboard
1. Check the dashboard summary shows initial metrics (likely zeros)
2. Note the organization ID in the URL or interface
3. Familiarize yourself with the sidebar navigation

## Step 2: Configure Your First API Endpoint

### 2.1 Create a Service
1. Navigate to "Endpoints" in the sidebar
2. Click "Add Service" button
3. Fill in service details:
   - Name: \`Test Weather API\`
   - Description: \`Weather data service for testing\`
4. Click "Create Service"

### 2.2 Add an Endpoint
1. In the newly created service, click "Add Endpoint"
2. Configure endpoint:
   - Name: \`Get Weather\`
   - Method: \`GET\`
   - Path: \`/weather\`
   - Price: \`0.10\` (10 cents in USDC)
   - Network: \`Base\`
   - Origin URL: \`https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo\`
3. Click "Create Endpoint"

## Step 3: Test Payment Enforcement

### 3.1 Test Unpaid Request
1. Copy the proxy URL for your endpoint (should be something like \`http://localhost:5000/proxy/org-id/service-id/weather\`)
2. Open a new terminal or use curl:
   \`\`\`bash
   curl -v "http://localhost:5000/proxy/[your-org-id]/[your-service-id]/weather"
   \`\`\`
3. **Expected Result**: HTTP 402 Payment Required response with payment instructions

### 3.2 Verify x402 Response
The response should include:
- Status: 402 Payment Required
- Headers with payment information
- JSON body with quote details including:
  - Price in USDC
  - Payment networks
  - Quote signature
  - Expiry time

## Step 4: Simulate Payment and Test Success

### 4.1 Mock Payment (Development Mode)
1. Note the quote ID from the 402 response
2. Make a payment simulation request:
   \`\`\`bash
   curl -X POST "http://localhost:5000/api/payments/simulate" \\
     -H "Content-Type: application/json" \\
     -d '{
       "endpointId": "your-endpoint-id",
       "amount": "0.10"
     }'
   \`\`\`

### 4.2 Test Paid API Access
1. Use the simulated transaction hash from step 4.1
2. Retry the API request with payment proof:
   \`\`\`bash
   curl "http://localhost:5000/proxy/[your-org-id]/[your-service-id]/weather" \\
     -H "x-payment: simulated_tx_hash_123" \\
     -H "x-payer-address: 0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0"
   \`\`\`
3. **Expected Result**: HTTP 200 OK with actual weather API response

## Step 5: Verify Analytics and Tracking

### 5.1 Check Dashboard Metrics
1. Navigate back to the Dashboard
2. Refresh the page to see updated metrics
3. Verify the following updated values:
   - Total Revenue: +$0.10
   - Total Requests: +2 (one unpaid, one paid)
   - Successful Payments: +1

### 5.2 Review Analytics Page
1. Go to "Analytics" in the sidebar
2. Check detailed metrics:
   - Request timeline showing your tests
   - Revenue breakdown
   - Conversion rates (should be 50% if you made 1 unpaid + 1 paid request)

## Step 6: Test Compliance Features

### 6.1 Set Up Geo-blocking
1. Navigate to "Compliance" page
2. Add a new rule:
   - Type: Geographic Restriction
   - Action: Block
   - Countries: Select a test country
   - Apply to: Your test endpoint
3. Save the rule

### 6.2 Test Geo-blocking (Simulated)
1. Make another API request with a simulated different location header:
   \`\`\`bash
   curl "http://localhost:5000/proxy/[your-org-id]/[your-service-id]/weather" \\
     -H "CF-IPCountry: [blocked-country-code]"
   \`\`\`
2. **Expected Result**: HTTP 403 Forbidden due to compliance rule

## Step 7: Test Escrow Functionality

### 7.1 Configure Escrow Settings
1. Go to "Settings" page
2. Set Escrow Hold Period to 1 minute (for testing)
3. Save settings

### 7.2 Test Escrow Flow
1. Make another paid request (following steps 4.1-4.2)
2. Navigate to "Escrow" page
3. Verify payment appears in "Pending" status
4. Wait 1 minute, refresh page
5. Payment should move to "Released" status

## Step 8: Test Advanced Features

### 8.1 Free Tier Testing
1. Configure free tier: 3 requests per 30 days
2. Make 3 unpaid requests to the same endpoint
3. On the 4th request, verify you still get 402 (free tier exhausted)

### 8.2 Multi-Network Testing
1. Create a second endpoint with Ethereum network
2. Test that payment quotes show correct network information
3. Verify analytics properly separate networks

## Step 9: Load and Stress Testing

### 9.1 Concurrent Requests
1. Use a tool like Apache Bench or curl with xargs:
   \`\`\`bash
   seq 1 10 | xargs -n1 -P10 curl -s "http://localhost:5000/proxy/[org]/[service]/weather"
   \`\`\`
2. Verify all requests return consistent 402 responses
3. Check that analytics properly count all requests

### 9.2 Payment Throughput
1. Simulate multiple payments rapidly
2. Verify payment verification doesn't become a bottleneck
3. Check that all payments are properly recorded in analytics

## Step 10: Production Readiness Checks

### 10.1 Security Validation
- [ ] All API endpoints require valid authentication
- [ ] Payment proofs are properly verified
- [ ] No sensitive data appears in logs
- [ ] HTTPS is configured (in production)

### 10.2 Performance Verification
- [ ] Response times are acceptable (<500ms for 402 responses)
- [ ] Payment verification completes quickly (<2s)
- [ ] Analytics updates in real-time
- [ ] No memory leaks during extended testing

### 10.3 Data Integrity
- [ ] Usage records accurately reflect all requests
- [ ] Revenue calculations are correct
- [ ] Escrow amounts match payment totals
- [ ] Compliance rules are consistently applied

## Troubleshooting Common Issues

### Payment Verification Fails
- Check facilitator configuration
- Verify network settings (sandbox vs mainnet)
- Confirm wallet address format

### Analytics Not Updating
- Check database connectivity
- Verify usage record creation in logs
- Refresh browser cache

### API Not Forwarding
- Test target API directly
- Check proxy configuration
- Verify endpoint URL format

### Compliance Rules Not Working
- Check rule configuration syntax
- Verify IP address detection
- Test with different headers

## Next Steps

After successful testing:
1. **Configure Production Settings**: Update wallet addresses, disable sandbox mode
2. **Set Up Monitoring**: Configure alerts for payment failures, high error rates
3. **Deploy to Production**: Use proper deployment process with environment variables
4. **Monitor Usage**: Watch analytics for real user behavior and payment patterns

## Automated Testing

For CI/CD integration, consider:
- Newman (Postman CLI) for API testing
- Jest/Mocha for unit tests
- Playwright for end-to-end web interface testing
- Custom scripts for payment simulation`
      }
    ]
  },
  {
    title: "Core Concepts", 
    slug: "concepts",
    description: "Essential concepts for understanding PayGate x402",
    pages: [
      {
        slug: "x402-protocol",
        title: "x402 Protocol Overview",
        summary: "Deep dive into the x402 payment protocol and how it works",
        seoDescription: "Complete guide to the x402 payment protocol - quotes, verification, settlement, and HTTP 402 payment flow.",
        content: `# x402 Protocol Overview

The x402 protocol extends HTTP with payment capabilities, allowing APIs to require payment before processing requests. This protocol enables seamless micropayments for API access.

## Protocol Flow

The x402 protocol follows a simple three-step process:

1. **Quote Request** - Client makes API request without payment
   - Server responds with HTTP 402 and payment details
2. **Payment** - Client sends payment to specified address
   - Blockchain transaction provides payment proof
3. **Verification & Access** - Client includes payment proof in retry request
   - Server verifies payment and processes original request

## HTTP 402 Response

When payment is required, PayGate x402 returns an HTTP 402 response with payment details:

\`\`\`
HTTP/1.1 402 Payment Required
x402-price: 0.01
x402-currency: USDC
x402-network: base
x402-chain-id: 8453
x402-address: 0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0
x402-quote-id: quote_abc123
x402-expires: 2024-09-14T10:30:00Z
Content-Type: application/json

{
  "error": "Payment required",
  "amount": "0.01",
  "currency": "USDC",
  "network": "base",
  "address": "0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0",
  "quote_id": "quote_abc123"
}
\`\`\`

### Response Headers

- **x402-price**: Payment amount required
- **x402-currency**: Payment currency (typically USDC)
- **x402-network**: Blockchain network (base, ethereum)
- **x402-chain-id**: Numeric chain identifier
- **x402-address**: Payment recipient address
- **x402-quote-id**: Unique quote identifier
- **x402-expires**: Quote expiration timestamp

## Payment Verification

After making payment, clients include proof in subsequent requests:

\`\`\`
GET /api/data HTTP/1.1
Host: api.example.com
x-payment: 0x1234567890abcdef...
x402-quote-id: quote_abc123

# PayGate verifies payment and forwards request
# Returns actual API response on success
\`\`\`

### Payment Proof Types

- **Transaction Hash**: Blockchain transaction ID
- **Facilitator Receipt**: Payment service confirmation
- **Signed Message**: Cryptographic payment proof

## Facilitator Integration

PayGate x402 supports multiple payment facilitators for verification:

### Coinbase Commerce
Production-ready payment processing with full blockchain verification.

### x402.rs
Native x402 protocol implementation with direct blockchain integration.

### Mock Facilitator
Development and testing adapter that accepts any payment proof.

## Network Support

PayGate x402 supports multiple blockchain networks with automatic configuration:

**Supported Networks:**
- **Base Mainnet** - Chain ID: 8453 (Production)
- **Base Sepolia** - Chain ID: 84532 (Testing)
- **Ethereum Mainnet** - Chain ID: 1 (Production)
- **Ethereum Goerli** - Chain ID: 5 (Testing)

## Error Handling

The x402 protocol defines standard error responses:

### Payment Verification Failed

\`\`\`
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Payment verification failed",
  "code": "INVALID_PAYMENT_PROOF",
  "details": "Transaction not found or insufficient amount"
}
\`\`\`

### Quote Expired

\`\`\`
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Quote expired",
  "code": "QUOTE_EXPIRED", 
  "details": "Please request a new quote"
}
\`\`\`

## Idempotency

PayGate x402 ensures request idempotency through unique request IDs:

**How Idempotency Works:**
1. Each request generates a unique request ID
2. Payment verification is cached by request ID
3. Duplicate payments are handled gracefully
4. Usage records prevent double billing

## Security Considerations

- **Quote Expiration**: Quotes expire to prevent replay attacks
- **Payment Verification**: All payments verified on-chain
- **Request Signing**: Optional request signing for enhanced security
- **Rate Limiting**: Configurable rate limits per endpoint
- **Compliance**: Geographic and wallet-based restrictions

## Next Steps

Now that you understand the x402 protocol basics, explore:

- Payment Lifecycle - Detailed payment flow (Coming soon)
- x402 Proxy Configuration - Proxy setup and routing (Coming soon)
- Facilitator Management - Payment verification setup (Coming soon)
- Complete API monetization tutorial (Coming soon)`
      }
    ]
  }
];

export function findDocPage(sectionSlug: string, pageSlug?: string): { section: DocSection; page: DocPage } | null {
  const section = docsData.find(s => s.slug === sectionSlug);
  if (!section) return null;
  
  if (!pageSlug) {
    // Return first page of section
    const page = section.pages[0];
    return page ? { section, page } : null;
  }
  
  const page = section.pages.find(p => p.slug === pageSlug);
  return page ? { section, page } : null;
}

export function getAllDocPages(): Array<{ section: DocSection; page: DocPage }> {
  return docsData.flatMap(section => 
    section.pages.map(page => ({ section, page }))
  );
}