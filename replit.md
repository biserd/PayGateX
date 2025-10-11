# PayGate x402 - x402 Payment Required Proxy Platform

## Overview

PayGate x402 is a web application that implements the x402 payment protocol for APIs, enabling developers to monetize API endpoints through automated micropayments. It acts as a payment proxy, intercepting API calls, verifying blockchain payments, and forwarding requests upon successful payment.

The platform serves two main purposes:

1.  **Enterprise SaaS Platform**: Provides a comprehensive dashboard for API providers to manage endpoints, track analytics, enforce compliance, configure escrow, manage webhooks, and generate API keys. It complements existing infrastructure like Google AP2 and Stripe ACP for blockchain-based API monetization.
2.  **x402 Public Directory**: A public discovery platform, envisioned as the "Etherscan for x402," where developers and AI agents can find payment-enabled APIs. It aggregates services from Coinbase Bazaar and x402 Index, offering real-time quote collection, advanced search, and category/network filtering without requiring authentication.

The application is a full-stack TypeScript project, featuring a React frontend, an Express.js backend, and PostgreSQL for data persistence, with support for the Base blockchain.

## Recent Changes

### Contact Form Email Integration (October 2025)
Implemented email notifications for contact form submissions:
- **Email Service**: Gmail SMTP using nodemailer with hello@bigappledigital.nyc credentials
- **Contact Notifications**: All contact form submissions now send emails to hello@paygate402.com
- **Email Template**: Professional HTML email with sender details, subject, message, and reply-to link
- **Non-blocking Delivery**: Email sending runs asynchronously without blocking form submission
- **User Registration Alerts**: Automatic email notifications sent to hello@paygate402.com for new user registrations
- **UI Improvements**: Fixed label text contrast on contact form for better readability
- **Contact Information**: Updated displayed contact email to hello@paygate402.com (production domain)

### x402 Discovery Endpoint (October 2025)
Implemented x402 protocol-compliant discovery endpoint for platform-wide service discovery:
- **HTTP 402 Response**: `/api/x402-discovery` returns proper HTTP 402 Payment Required status
- **x402 Protocol Format**: Response follows x402 specification with `x402Version: 1` and `accepts` array
- **Platform Discovery**: Aggregates all active services/endpoints in a single discoverable response
- **x402scan Compatibility**: Enables submission to x402scan.com directory for ecosystem-wide discovery
- **Complete Metadata**: Each endpoint includes scheme, network, pricing, wallet address, asset contract, and extra platform info
- **Sandbox Support**: Automatically uses Base Sepolia addresses and test networks when in sandbox mode

### User Roles & Multi-Tenant Organizations (October 2025)
Fixed user registration and organization structure:
- **Role Management**: ajaxus (biserd@gmail.com) is the only admin; all other users are "member" role
- **Auto-Organization Creation**: Each new user registration automatically creates a dedicated organization
- **Organization Structure**: Format is `{username} Organization` with slug `{username}-org`
- **Default Settings**: New orgs have sandbox mode enabled, 24h escrow hold, 100 free tier requests per 30 days
- **Data Isolation**: Each user operates within their own organization for proper multi-tenant separation

### SEO Implementation (October 2025)
Comprehensive SEO implementation added across all pages:
- **Custom useSEO Hook**: Created reusable hook (`client/src/hooks/use-seo.ts`) for dynamic page titles, meta descriptions, and Open Graph tags
- **Unique Page Titles**: All pages have descriptive, keyword-optimized titles with "| PayGate x402" suffix
- **Meta Tags**: Complete meta description, Open Graph (title, description, url, image), and Twitter Card tags
- **Structured Data**: JSON-LD markup in index.html for Organization, WebSite, and SoftwareApplication
- **Favicon**: SVG favicon with PayGate branding
- **robots.txt**: Created with sitemap reference for search engine crawling

### Admin Dashboard (October 2025)
Implemented comprehensive administrative dashboard for platform monitoring:
- **Access Control**: Restricted to admin@paygate402.com email only (username: ajaxus)
- **Backend Endpoint**: `/api/admin/metrics` returns platform-wide statistics with authentication check
- **Route Protection**: Frontend `/admin` route redirects non-admin users to dashboard
- **Conditional Navigation**: Admin link only visible in sidebar for admin users
- **Key Metrics Displayed**:
  - User metrics: total users, new registrations (7d/30d)
  - Service & endpoint metrics: total/active counts, new additions (7d)
  - API usage: total requests, paid/free requests, total revenue
  - User activity table: all registered users with engagement stats (services, endpoints, API calls, last activity)
- **Real-time Updates**: Auto-refreshes every 30 seconds for live monitoring

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend uses React 18 with TypeScript and Vite. It leverages Radix UI components styled with shadcn/ui and Tailwind CSS, featuring custom CSS variables for theming. TanStack Query manages server state, and Wouter handles client-side routing.

### Technical Implementations
The backend is an Express.js application with TypeScript, designed as a RESTful API. It follows a service-oriented architecture for payment processing, analytics, and x402 protocol handling. A custom storage interface abstracts database operations. The x402 proxy middleware intercepts API calls to enforce payment requirements.

The database schema supports a multi-tenant SaaS platform with core entities like Organizations, Services, Endpoints, Pricebooks, UsageRecords, FreeTierUsage, ComplianceRules, EscrowHoldings, Disputes, AuditLogs, WebhookEndpoints, and ApiKeys.

Authentication currently uses a demo organization pattern, with infrastructure for proper user authentication and API endpoints scoped to organizations for data isolation.

The payment system implements the x402 protocol with facilitator adapters (mock, Coinbase, x402.rs), a metering service, usage analytics, multi-network support (Base, Ethereum), static USDC pricing, and a configurable escrow system.

The x402 proxy layer handles request interception, payment verification, returns HTTP 402 responses with signed quotes, origin URL forwarding, health checks, compliance enforcement (geo-blocking, IP filtering), usage tracking, free tier support, and precise HTTP method/path matching. It supports Base Sepolia (sandbox) and Base Mainnet (production) with network-aware quotes.

Advanced analytics provide real-time metrics (request counts, revenue, conversion rates, latency) that are organization-scoped, tracking paid vs. unpaid requests, escrow monitoring, and performance.

The compliance framework supports geographic restrictions, wallet allow/deny lists, and real-time enforcement through middleware.

Enterprise provider tools include a webhook system with HMAC-SHA256 signing, exponential backoff retry, event broadcasting (payment confirmed/failed, escrow created), delivery tracking, and test webhooks. API Key Management features secure key generation, SHA-256 hashing, one-time display, prefix display, revocation, and usage tracking.

The x402 Public Directory aggregates services from Coinbase Bazaar and x402 Index, collecting real-time quotes, and providing rich metadata, advanced search, and filtering by category and network. It is built on a dedicated database table (`x402_services`), a resilient scraper service, a scheduler, and a public RESTful API.

### System Design Choices
The project uses TypeScript, ESLint, and Vite for development. Environment-specific configurations manage database connections, API keys, and feature flags. The storage layer is abstracted for development (in-memory) and production (database). Testing is guided by `TESTING_GUIDE.md` and `POSTMAN_TESTING_GUIDE.md`, covering protocol implementation, payment simulation, and analytics.

## External Dependencies

### Database Infrastructure
-   **PostgreSQL**: Primary database (Neon serverless hosting)
-   **Drizzle ORM**: Type-safe database operations
-   **connect-pg-simple**: Session storage

### Payment & Blockchain
-   **@neondatabase/serverless**: Serverless PostgreSQL client
-   **Base Network**: Primary blockchain for USDC transactions
-   **Coinbase Facilitator API**: Production payment verification

### UI Framework & Styling
-   **React 18**: Core frontend framework
-   **Radix UI**: Accessible component primitives
-   **Tailwind CSS**: Utility-first styling
-   **Lucide React**: Icon library

### Development & Build Tools
-   **Vite**: Fast build tool
-   **TanStack Query**: Server state management
-   **React Hook Form**: Form handling
-   **Zod**: Runtime type validation

### Third-party Services
-   **Replit Integration**: Development environment and deployment
-   **Google Fonts**: Typography (Inter, JetBrains Mono)