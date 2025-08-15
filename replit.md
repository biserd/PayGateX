# PayGate 402 - HTTP 402 Payment Required Proxy Platform

## Overview

PayGate 402 is a sophisticated web application that implements the x402 payment protocol for APIs, allowing developers to monetize their API endpoints through automated micropayments. The platform acts as a payment proxy that intercepts API calls, verifies payments via blockchain transactions, and forwards requests to target APIs only after successful payment verification.

The application provides a comprehensive dashboard for API endpoint management, real-time analytics, compliance controls, and escrow functionality. It's built as a full-stack TypeScript application with a React frontend and Express.js backend, utilizing PostgreSQL for data persistence and supporting multiple payment networks including Base blockchain.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React 18 and TypeScript, using Vite as the build tool. The UI leverages Radix UI components with shadcn/ui styling system, providing a modern and accessible interface. TanStack Query handles server state management and API caching, while Wouter provides lightweight client-side routing. The design system uses Tailwind CSS with custom CSS variables for theming and includes comprehensive component libraries for forms, dialogs, and data visualization.

### Backend Architecture
The server uses Express.js with TypeScript in ESM format, implementing a RESTful API design. The application follows a service-oriented architecture with dedicated services for payment processing, analytics computation, and x402 protocol handling. A custom storage interface abstracts database operations, allowing for flexible data layer implementations. The x402 proxy middleware intercepts API calls and enforces payment requirements before forwarding requests to target endpoints.

### Database Design - UPDATED (Aug 2025)
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
- **WebhookEndpoints**: Payment confirmation webhooks

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

### x402 Proxy System - COMPLETE
The comprehensive proxy layer includes:
- **Request Interception**: Matches incoming requests to configured endpoints
- **Payment Verification**: Checks for valid payment proofs before forwarding
- **HTTP 402 Responses**: Returns signed quotes for unpaid requests
- **Origin URL Forwarding**: Configurable target URLs per endpoint
- **Health Checks**: Built-in endpoint health monitoring
- **Compliance Enforcement**: Real-time geo-blocking and IP filtering
- **Usage Tracking**: Complete request/response lifecycle logging

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

### Development Infrastructure
The application uses modern development tooling including TypeScript for type safety, ESLint for code quality, and Vite for fast development builds. The build process supports both development and production deployments with automatic asset optimization. Environment-specific configurations handle database connections, API keys, and feature flags. The storage layer is fully abstracted with comprehensive in-memory implementation for development and database implementation ready for production.

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