# PayGate x402

**Production-ready SaaS platform for API monetization using the x402 payment protocol**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)

PayGate x402 is a comprehensive proxy platform that enables API monetization through automated micropayments. Built on the HTTP 402 payment protocol, it intercepts API requests, enforces payment verification, and forwards requests to upstream services only after successful payment confirmation.

## 🚀 Features

### Core Functionality
- **🔒 Payment Enforcement**: Automatic HTTP 402 responses for unpaid requests with signed payment quotes
- **⚡ Real-time Proxy**: High-performance request interception and forwarding
- **💰 Multi-Network Support**: USDC payments on Base, Ethereum, and other blockchain networks
- **🛡️ Escrow System**: Configurable hold periods with automated dispute resolution
- **📊 Analytics Dashboard**: Real-time revenue, conversion, and performance metrics

### Advanced Features
- **🌍 Compliance Controls**: Geo-blocking, IP filtering, and regulatory compliance tools
- **🔄 Free Tier Management**: Configurable free request limits per endpoint
- **📈 Usage Analytics**: Comprehensive tracking and reporting
- **🎯 Developer Tools**: RESTful API, webhook support, and extensive documentation
- **⚙️ Admin Dashboard**: Complete platform management interface

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **TanStack Query** for server state management
- **Wouter** for lightweight client-side routing
- **Radix UI + shadcn/ui** for accessible component library
- **Tailwind CSS** with custom design system

### Backend
- **Express.js** with TypeScript in ESM format
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** for data persistence
- **Custom x402 middleware** for payment enforcement
- **Service-oriented architecture** with pluggable payment facilitators

### Database Schema
Multi-tenant SaaS architecture with comprehensive data modeling:
- Organizations with configurable settings
- Services and endpoints with versioned pricing
- Usage tracking with payment status
- Compliance rules and audit logs
- Escrow holdings and dispute resolution

## 📋 Prerequisites

- Node.js 20+ and npm
- PostgreSQL database
- Basic understanding of REST APIs and blockchain payments

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/your-username/paygate-x402.git
cd paygate-x402
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Configure your database
DATABASE_URL="postgresql://user:password@localhost:5432/paygate"
SESSION_SECRET="your-secure-session-secret"
```

### 3. Database Setup
```bash
# Push schema to database
npm run db:push

# Seed with demo data (optional)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🧪 Testing

Follow our comprehensive [Testing Guide](./TESTING_GUIDE.md) to validate all platform features:

1. **Authentication** - User registration and login
2. **Endpoint Configuration** - Service and API endpoint setup
3. **Payment Enforcement** - HTTP 402 response validation
4. **Payment Processing** - Mock and real payment flows
5. **Analytics** - Real-time metrics verification
6. **Compliance** - Geo-blocking and filtering tests
7. **Escrow** - Payment holding and release mechanisms

### Quick Test Example
```bash
# Test unpaid request (should return HTTP 402)
curl -v "http://localhost:5000/proxy/your-org-id/your-service-id/endpoint"

# Test with payment proof (should forward to origin)
curl -v "http://localhost:5000/proxy/your-org-id/your-service-id/endpoint" \
  -H "x402-payment-hash: your-transaction-hash"
```

## 📖 API Documentation

### Core Endpoints

#### Authentication
```
POST /api/register     # User registration
POST /api/login        # User authentication
POST /api/logout       # Session termination
GET  /api/user         # Current user info
```

#### Services & Endpoints
```
GET    /api/services           # List user services
POST   /api/services           # Create new service
GET    /api/services/:id       # Get service details
PUT    /api/services/:id       # Update service
DELETE /api/services/:id       # Delete service

POST   /api/services/:id/endpoints    # Create endpoint
GET    /api/services/:id/endpoints    # List endpoints
PUT    /api/endpoints/:id             # Update endpoint
DELETE /api/endpoints/:id             # Delete endpoint
```

#### Analytics
```
GET /api/dashboard/summary     # Overview metrics
GET /api/analytics/revenue     # Revenue analytics
GET /api/analytics/usage       # Usage patterns
GET /api/analytics/conversion  # Conversion rates
```

#### x402 Proxy
```
ANY /proxy/:orgId/:serviceId/*  # Payment-enforced API proxy
```

### x402 Protocol Implementation

PayGate implements the x402 payment protocol specification:

1. **Unpaid Request**: Returns HTTP 402 with payment quote
2. **Payment Quote**: Signed quote with price, networks, and expiry
3. **Payment Verification**: Validates blockchain transaction proof
4. **Request Forwarding**: Proxies to origin API after payment confirmation

Example 402 Response:
```json
{
  "error": "Payment Required",
  "quote": {
    "id": "quote_123",
    "price": "0.10",
    "currency": "USDC",
    "networks": ["base", "ethereum"],
    "expires": "2025-01-16T12:00:00Z",
    "signature": "0x..."
  }
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."
PGHOST="localhost"
PGPORT="5432"
PGUSER="postgres"
PGPASSWORD="password"
PGDATABASE="paygate"

# Session Management
SESSION_SECRET="your-secure-session-secret"

# Payment Networks (optional)
COINBASE_API_KEY="your-coinbase-api-key"
ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/..."
BASE_RPC_URL="https://base-mainnet.infura.io/v3/..."
```

### Service Configuration
```javascript
// Example endpoint configuration
{
  "name": "Weather API",
  "method": "GET",
  "path": "/weather",
  "price": "0.05",           // USDC per request
  "network": "base",         // Payment network
  "originUrl": "https://api.weather.com/v1/weather",
  "freeTierLimit": 100       // Free requests per month
}
```

## 🏭 Production Deployment

### Recommended Stack
- **Hosting**: Replit, Vercel, or AWS
- **Database**: Neon, Supabase, or managed PostgreSQL
- **CDN**: Cloudflare for global distribution
- **Monitoring**: Sentry for error tracking
- **Analytics**: Custom dashboard + external tools

### Deployment Checklist
- [ ] Configure production database
- [ ] Set secure session secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure payment network APIs
- [ ] Set up monitoring and alerts
- [ ] Test payment flows end-to-end
- [ ] Configure backup and recovery
- [ ] Review security settings

### Performance Optimization
- Database indexing for high-volume queries
- Redis caching for frequently accessed data
- CDN configuration for static assets
- Load balancing for multiple instances
- Payment facilitator connection pooling

## 🛡️ Security

### Best Practices Implemented
- **Session Security**: Secure HTTP-only cookies with CSRF protection
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Rate Limiting**: Configurable per-endpoint and global limits
- **Audit Logging**: Complete trail of all system actions
- **Payment Verification**: Cryptographic signature validation

### Security Considerations
- Store payment facilitator API keys securely
- Implement proper CORS policies
- Use HTTPS in production
- Regular security audits and updates
- Monitor for suspicious payment patterns

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes with tests
4. Run the test suite: `npm test`
5. Submit a pull request

### Code Standards
- TypeScript for all new code
- ESLint configuration compliance
- Comprehensive test coverage
- Documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and testing guide
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

### Common Issues
- **Database Connection**: Verify DATABASE_URL and database accessibility
- **Payment Failures**: Check payment facilitator API credentials
- **Analytics Not Updating**: Ensure proper database permissions
- **CORS Errors**: Configure allowed origins in production

## 🗺️ Roadmap

### Current Version (v1.0)
- ✅ Core x402 payment enforcement
- ✅ Multi-tenant SaaS architecture
- ✅ Real-time analytics dashboard
- ✅ Compliance and escrow systems

### Upcoming Features (v1.1)
- [ ] Advanced payment routing
- [ ] Enhanced analytics and reporting
- [ ] API rate limiting per payment tier
- [ ] Webhook event system
- [ ] Mobile-responsive dashboard improvements

### Future Enhancements (v2.0)
- [ ] Multi-currency support
- [ ] Advanced dispute resolution
- [ ] Enterprise SSO integration
- [ ] White-label deployment options
- [ ] Advanced fraud detection

## 🙏 Acknowledgments

- **x402 Protocol**: Building on the HTTP 402 payment standard
- **Coinbase**: Payment verification infrastructure
- **Open Source Community**: Dependencies and inspiration
- **Contributors**: Everyone who has contributed to this project

---

**PayGate x402** - Transform any API into a revenue stream with automated micropayments.

For more information, visit our [documentation](./docs) or try the [live demo](https://paygate-x402.replit.app).