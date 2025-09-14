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
curl -H "x402-payment-proof: mock_tx_hash_123" \\
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
- [Configure Coinbase facilitator for production](/docs/product-guides/facilitators)
- [Follow the complete API monetization tutorial](/docs/tutorials/monetize-api)`
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
curl -H "x402-payment-proof: mock_tx_sandbox_test" \\
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
x402-payment-proof: 0x1234567890abcdef...
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

- [Payment Lifecycle](/docs/concepts/payment-lifecycle) - Detailed payment flow
- [x402 Proxy Configuration](/docs/product-guides/x402-proxy) - Proxy setup and routing
- [Facilitator Management](/docs/product-guides/facilitators) - Payment verification setup
- [Complete Tutorial](/docs/tutorials/monetize-api) - End-to-end implementation`
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