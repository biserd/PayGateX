# PayGate x402 - x402 Payment Required Proxy Platform

## Overview

PayGate x402 is a sophisticated web application that implements the x402 payment protocol for APIs, allowing developers to monetize their API endpoints through automated micropayments. The platform acts as a payment proxy that intercepts API calls, verifies payments via blockchain transactions, and forwards requests to target APIs only after successful payment verification.

The application provides a comprehensive dashboard for API endpoint management, real-time analytics, compliance controls, and escrow functionality. It's built as a full-stack TypeScript application with a React frontend and Express.js backend, utilizing PostgreSQL for data persistence and supporting multiple payment networks including Base blockchain.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React 18 and TypeScript, using Vite as the build tool. The UI leverages Radix UI components with shadcn/ui styling system, providing a modern and accessible interface. TanStack Query handles server state management and API caching, while Wouter provides lightweight client-side routing. The design system uses Tailwind CSS with custom CSS variables for theming and includes comprehensive component libraries for forms, dialogs, and data visualization.

### Backend Architecture
The server uses Express.js with TypeScript in ESM format, implementing a RESTful API design. The application follows a service-oriented architecture with dedicated services for payment processing, analytics computation, and x402 protocol handling. A custom storage interface abstracts database operations, allowing for flexible data layer implementations. The x402 proxy middleware intercepts API calls and enforces payment requirements before forwarding requests to target endpoints.

### Database Design - UPDATED (Oct 2025)
The schema has been completely redesigned to support a comprehensive multi-tenant SaaS platform. Core entities now include:
- **Organizations**: Multi-tenant structure with configurable escrow periods and free tier limits
- **Services**: Grouping of related API endpoints under an organization
- **Endpoints**: Individual API routes with configurable pricing and network support
- **Pricebooks**: Versioned pricing with effective dates and network-specific rates
- **UsageRecords**: Comprehensive request tracking with payment status, latency, and billing data
- **FreeTierUsage**: Per-endpoint free tier tracking with period-based limits
- **ComplianceRules**: Geo-blocking, IP filtering, and wallet restrictions
- **EscrowHoldings**: Time-based payment escrow with automatic release mechanisms
- **Disputes**: Dispute resolution system for payment conflicts
- **AuditLogs**: Complete audit trail of system actions
- **WebhookEndpoints**: Payment confirmation webhooks with HMAC-SHA256 signing
- **ApiKeys**: Secure API key management with SHA-256 hashing for authentication

### Authentication & Authorization
The current implementation uses a demo organization pattern for development, with infrastructure in place for proper user authentication. API endpoints are scoped to organizations, ensuring data isolation. The system tracks organization ownership of endpoints and transactions, with middleware handling user context propagation throughout the request lifecycle.

### Payment Processing - ENHANCED
The payment system implements the x402 protocol specification with comprehensive features:
- **Facilitator Adapters**: Pluggable payment verification (mock, Coinbase, x402.rs)
- **Metering Service**: Request tracking with idempotency keys and free tier enforcement
- **Usage Analytics**: Real-time metrics calculation with conversion rates and latency tracking
- **Multi-Network Support**: Base, Ethereum, and other blockchain networks
- **Static Pricing**: Per-call USDC pricing with versioned pricebooks
- **Escrow System**: Configurable hold periods with automatic release and refund capabilities

### x402 Proxy System - FULLY OPERATIONAL ✅
The comprehensive proxy layer includes:
- **Request Interception**: ✅ Matches incoming requests to configured endpoints
- **Payment Verification**: ✅ Checks for valid payment proofs before forwarding  
- **HTTP 402 Responses**: ✅ Returns signed quotes for unpaid requests with network info
- **Origin URL Forwarding**: ✅ Configurable target URLs per endpoint
- **Health Checks**: ✅ Built-in endpoint health monitoring
- **Compliance Enforcement**: ✅ Real-time geo-blocking and IP filtering
- **Usage Tracking**: ✅ Complete request/response lifecycle logging
- **Free Tier Support**: ✅ Automatic free request handling with configurable limits
- **Method Matching**: ✅ Precise HTTP method and path matching for endpoint resolution
- **Mock Responses**: ✅ Development-friendly mock API responses for testing
- **Base Sepolia Integration**: ✅ Sandbox mode uses Base Sepolia testnet (Chain ID: 84532)
- **Base Mainnet Support**: ✅ Production mode uses Base mainnet (Chain ID: 8453)
- **Network-Aware Quotes**: ✅ x402 quotes include proper network and chain ID headers

**Recent Updates (Aug 2025)**: 
- ✅ **Base Sepolia Integration Complete**: Real wallet addresses replace demo identifiers
- ✅ **Payment Verification Working**: Real USDC transactions verified on Base Sepolia testnet
- ✅ **Network-Aware Wallets**: Sandbox uses 0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0, production uses configured mainnet wallet
- ✅ **Real Transaction Success**: User successfully sent USDC and gained API access via x402 protocol
- ✅ **MetaMask Error Resolution**: Confirmed no wallet connectivity code exists outside Wallet Test page - MetaMask browser extension errors are cosmetic only
- Enhanced x402 responses with network configuration and chain ID headers
- Real-time sandbox/production mode switching affects payment verification immediately

### Analytics & Monitoring - ENHANCED
Advanced analytics system with:
- **Real-time Metrics**: Request counts, revenue, conversion rates, latency
- **Organization-scoped Data**: Multi-tenant analytics with proper isolation  
- **Usage Record Analysis**: Detailed tracking of paid vs unpaid requests
- **Escrow Monitoring**: Pending amounts, daily releases, refund tracking
- **Performance Metrics**: Average latency, error rates, success rates

### Compliance Framework - EXPANDED
Comprehensive compliance system supporting:
- **Geographic Restrictions**: IP-based geo-blocking with configurable rules
- **Wallet Management**: Allow/deny lists for payer addresses
- **Regulatory Compliance**: Configurable rules for different jurisdictions
- **Real-time Enforcement**: Middleware-level compliance checking
- **Audit Trail**: Complete logging of compliance actions and decisions

### Enterprise Provider Tools - NEW (Oct 2025)
Production-ready tools for API providers to manage and monetize their endpoints:

**Webhook System**:
- ✅ **HMAC-SHA256 Signing**: Cryptographically signed payloads for secure webhook verification
- ✅ **Exponential Backoff Retry**: Automatic retry with 5 attempts (1s, 2s, 4s, 8s, 16s intervals)
- ✅ **Event Broadcasting**: Triggers on payment.confirmed, payment.failed, escrow.created events
- ✅ **Delivery Tracking**: Complete logging of delivery attempts, failures, and success rates
- ✅ **Test Webhooks**: One-click test delivery for webhook validation
- ✅ **Organization-Scoped**: Multi-tenant webhook management with proper isolation

**API Key Management**:
- ✅ **Secure Key Generation**: High-entropy keys (pk_live_*) with 256-bit randomness
- ✅ **SHA-256 Hashing**: Keys hashed server-side, plaintext never stored
- ✅ **One-Time Display**: Full key shown only once at creation for maximum security
- ✅ **Prefix Display**: Shows first 12 characters for key identification
- ✅ **Revocation System**: Instant key revocation with timestamp tracking
- ✅ **Organization Ownership**: Cross-tenant protection prevents unauthorized key access
- ✅ **Usage Tracking**: Last used timestamp for audit and monitoring

These tools position PayGate x402 as enterprise-grade infrastructure complementary to Google AP2 and Stripe ACP, enabling API providers to monetize endpoints that power AI agents through blockchain-based micropayments.

### Development Infrastructure
The application uses modern development tooling including TypeScript for type safety, ESLint for code quality, and Vite for fast development builds. The build process supports both development and production deployments with automatic asset optimization. Environment-specific configurations handle database connections, API keys, and feature flags. The storage layer is fully abstracted with comprehensive in-memory implementation for development and database implementation ready for production.

### Testing and Quality Assurance
Comprehensive testing guide (TESTING_GUIDE.md) covers all platform features including authentication, endpoint configuration, payment enforcement, analytics verification, compliance controls, and escrow functionality. The testing process validates x402 protocol implementation, payment simulation workflows, and real-time analytics updates. Includes troubleshooting guides and production readiness checklists.

### Documentation and Repository Management
Complete GitHub repository documentation (README.md) provides comprehensive overview of platform architecture, quick start guides, API documentation, deployment instructions, and contribution guidelines. Includes detailed feature descriptions, security best practices, production deployment checklists, and roadmap for future enhancements. Documentation covers both technical implementation details and business use cases for API monetization.

Comprehensive testing documentation includes both command-line testing guide (TESTING_GUIDE.md) and Postman-specific testing guide (POSTMAN_TESTING_GUIDE.md). The Postman guide covers collection setup, automated test scripts, environment configurations, and CI/CD integration with Newman for x402 payment protocol validation.

## External Dependencies

### Database Infrastructure
- **PostgreSQL**: Primary database with Neon serverless hosting support
- **Drizzle ORM**: Type-safe database operations and migrations
- **connect-pg-simple**: Session storage for PostgreSQL

### Payment & Blockchain
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **Base Network**: Primary blockchain for USDC transactions
- **Coinbase Facilitator API**: Production payment verification service

### UI Framework & Styling
- **React 18**: Core frontend framework with TypeScript support
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Lucide React**: Comprehensive icon library

### Development & Build Tools
- **Vite**: Fast build tool with hot module replacement
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema definition

### Third-party Services
- **Replit Integration**: Development environment support and deployment
- **Font Providers**: Google Fonts for typography (Inter, JetBrains Mono)
- **Analytics Providers**: Configurable for usage tracking and monitoring