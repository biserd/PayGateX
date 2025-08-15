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

### Database Design
The schema is defined using Drizzle ORM with PostgreSQL as the underlying database. Core entities include users, API endpoints, transactions, analytics, compliance rules, and escrow holdings. The design supports multi-tenant usage with user-scoped data isolation. Transaction records track payment status and escrow timing, while analytics tables enable real-time performance monitoring and revenue calculations.

### Authentication & Authorization
The current implementation uses a demo user pattern for development, with infrastructure in place for proper user authentication. API endpoints are scoped to individual users, ensuring data isolation. The system tracks user ownership of endpoints and transactions, with middleware handling user context propagation throughout the request lifecycle.

### Payment Processing
The payment system implements the x402 protocol specification, supporting blockchain-based micropayments primarily on the Base network. A configurable payment processor service handles verification through either mock implementations for development or real Coinbase facilitator APIs for production. The system supports USDC transactions with configurable pricing per endpoint and automatic escrow functionality with time-based release mechanisms.

### Analytics & Monitoring
Real-time analytics track API usage, revenue, and performance metrics across multiple time periods. The analytics service computes daily summaries, growth rates, and user-specific statistics. Revenue tracking includes escrow status monitoring and refund processing. The dashboard provides comprehensive insights into API performance with exportable data and trend analysis.

### Compliance Framework
A flexible compliance system supports geographic restrictions, wallet blacklisting, and regulatory requirements. Rules are stored as JSON configurations with type-based categorization, allowing for dynamic policy enforcement. The system includes geo-blocking capabilities and transaction monitoring for suspicious activity detection.

### Development Infrastructure
The application uses modern development tooling including TypeScript for type safety, ESLint for code quality, and Vite for fast development builds. The build process supports both development and production deployments with automatic asset optimization. Environment-specific configurations handle database connections, API keys, and feature flags.

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