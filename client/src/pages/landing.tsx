import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Zap, DollarSign, Globe, Users, ArrowRight, Coins, TrendingUp, Lock, Menu, X, Search, BarChart3, Webhook } from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useSEO({
    title: 'API Monetization Platform - Blockchain Payments with x402 Protocol',
    description: 'PayGate x402: Monetize APIs with automated blockchain micropayments. Enterprise dashboard, real-time analytics, escrow protection, compliance enforcement, webhooks, and public x402 Directory for discovering payment-enabled APIs.',
    path: '/',
    keywords: 'API monetization, x402 protocol, blockchain payments, USDC, Base network, payment proxy, API commerce, AI agents, AP2, HTTP 402'
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PayGate x402</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/directory" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-directory">
              Directory
            </a>
            <a href="/docs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-docs">
              Docs
            </a>
            <a href="/release-notes" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-release-notes">
              Release Notes
            </a>
            <a href="/contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-contact">
              Contact
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <Button 
              onClick={() => window.location.href = "/auth"}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <a href="/directory" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-directory">Directory</a>
              <a href="/docs" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-docs">Docs</a>
              <a href="/release-notes" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-release-notes">Release Notes</a>
              <a href="/contact" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-contact">Contact</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge className="mb-6 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-1.5">
            Built on x402 Protocol
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Your APIs Into<br />
            <span className="text-blue-600">Revenue Streams</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            The enterprise platform for API monetization. Set your price, route traffic through our proxy, and watch the USDC roll in.
          </p>
          
          {/* Hero Visual - PayGate Dashboard Preview */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12 max-w-4xl mx-auto">
            {/* Dashboard Preview Card */}
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 text-left shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Your Dashboard</span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Today's Revenue</div>
                  <div className="text-3xl font-bold text-gray-900">$1,247.50</div>
                  <div className="text-sm text-green-600 mt-1">+23% from yesterday</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="text-xs text-gray-500">API Calls</div>
                    <div className="text-lg font-semibold text-gray-900">12,847</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="text-xs text-gray-500">Conversion</div>
                    <div className="text-lg font-semibold text-gray-900">94.2%</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Endpoints</span>
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">3 live</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Endpoint Configuration Card */}
            <div className="flex-1 bg-gray-900 rounded-2xl p-6 text-left overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white">Endpoint Config</span>
              </div>
              
              <div className="font-mono text-sm space-y-3">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Target URL</div>
                  <div className="text-green-400">api.yourservice.com/v1/data</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Price</div>
                    <div className="text-blue-400">$0.01 <span className="text-gray-500">USDC</span></div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Network</div>
                    <div className="text-orange-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Base
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Proxy URL</div>
                  <div className="text-yellow-400 text-xs">paygate402.com/proxy/abc123</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/auth"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
              data-testid="button-get-started"
            >
              Start Monetizing
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = "/directory"}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-medium"
              data-testid="button-explore-directory"
            >
              <Search className="mr-2 w-5 h-5" />
              Explore Directory
            </Button>
          </div>
        </div>
      </section>

      {/* Value Prop Banner */}
      <section className="py-12 px-6 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">85-95%</div>
              <div className="text-gray-600">Revenue you keep</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">Sub-second</div>
              <div className="text-gray-600">Payment verification</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">Zero</div>
              <div className="text-gray-600">Monthly fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Pillars Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Two ways to grow your business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're monetizing APIs or discovering payment-enabled services, PayGate has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Enterprise Dashboard */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-2">
              <CardHeader className="p-6">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-gray-900 text-2xl mb-3">
                  Enterprise Dashboard
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Your command center for API monetization. Manage endpoints, track revenue, configure escrow, and enforce compliance—all from one place.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    Real-time revenue & analytics dashboard
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    Configurable escrow with dispute resolution
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    Geo-blocking & wallet compliance controls
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    Webhook notifications for every payment
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = "/auth"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-dashboard-cta"
                >
                  Open Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* x402 Directory */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-2">
              <CardHeader className="p-6">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-orange-600" />
                </div>
                <CardTitle className="text-gray-900 text-2xl mb-3">
                  x402 Public Directory
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  The discovery platform for payment-enabled APIs. Find services, compare pricing, and integrate with confidence. Think "Etherscan for x402."
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                    Browse payment-enabled APIs across categories
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                    Real-time pricing from x402 endpoints
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                    Filter by network, category, and price
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                    No login required to explore
                  </li>
                </ul>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/directory"}
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                  data-testid="button-directory-cta"
                >
                  Browse Directory
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-0">
              Built for Scale
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Enterprise-grade infrastructure
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to run a professional API monetization operation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Automatic Payment Gate
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Our proxy intercepts requests, verifies payment, and forwards to your API. No code changes required on your end.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Escrow Protection
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Configurable hold periods protect both parties. Automated dispute resolution handles edge cases gracefully.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Revenue Analytics
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Track earnings, conversion rates, and usage patterns. Export reports and set up alerts for key metrics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Compliance Controls
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Block specific regions or wallets. Maintain allow/deny lists. Stay compliant with your regulatory requirements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Multi-Network
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Accept USDC on Base (recommended for low fees), Ethereum, and other supported networks. Your choice.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                  <Webhook className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Webhooks & API Keys
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Get notified of every payment. Generate API keys for programmatic access. HMAC-signed for security.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-0">
              <DollarSign className="w-4 h-4 mr-1" />
              Simple Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We take a cut. You keep the rest.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No monthly fees. No setup costs. We only make money when you do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <CardTitle className="text-gray-900 text-xl mb-2">Starter</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">85%</span>
                  <span className="text-gray-500 ml-2">you keep</span>
                </div>
                <div className="text-gray-500 text-sm mb-4">15% platform fee</div>
                <CardDescription className="text-gray-600">
                  For developers testing the waters with API monetization.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Up to 10,000 requests/month
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Basic analytics
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Base & Ethereum
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Email support
                  </li>
                </ul>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.href = "/auth"}
                  data-testid="button-starter-plan"
                >
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Growth Plan */}
            <Card className="bg-white border-2 border-blue-600 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 text-white border-0">Most Popular</Badge>
              </div>
              <CardHeader className="p-6 pt-8">
                <CardTitle className="text-gray-900 text-xl mb-2">Growth</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">90%</span>
                  <span className="text-gray-500 ml-2">you keep</span>
                </div>
                <div className="text-gray-500 text-sm mb-4">10% platform fee</div>
                <CardDescription className="text-gray-600">
                  For businesses scaling their API revenue seriously.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Up to 100,000 requests/month
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Advanced analytics + exports
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Custom escrow periods
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Priority support
                  </li>
                </ul>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.href = "/auth"}
                  data-testid="button-growth-plan"
                >
                  Upgrade to Growth
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <CardTitle className="text-gray-900 text-xl mb-2">Enterprise</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">95%</span>
                  <span className="text-gray-500 ml-2">you keep</span>
                </div>
                <div className="text-gray-500 text-sm mb-4">5% platform fee</div>
                <CardDescription className="text-gray-600">
                  For high-volume operations with custom requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Unlimited requests
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Custom reporting
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Dedicated infrastructure
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    24/7 support + SLA
                  </li>
                </ul>
                <Button 
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => window.location.href = "/contact"}
                  data-testid="button-enterprise-plan"
                >
                  Talk to Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Up and running in 10 minutes
            </h2>
            <p className="text-lg text-gray-600">
              No smart contracts to deploy. No complex integration. Just configure and go.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Add Your Endpoint</h3>
              <p className="text-gray-600">
                Enter your API's URL, set your price in USDC, and choose which blockchain network to accept payments on.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Share Your Proxy URL</h3>
              <p className="text-gray-600">
                We give you a PayGate proxy URL. Share it with clients. Unpaid requests get HTTP 402 with payment details.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Collect Revenue</h3>
              <p className="text-gray-600">
                USDC flows to your wallet. Track it all in your dashboard. Withdraw anytime after escrow clears.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Your APIs are worth more than $0
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Stop giving away valuable data and compute. Start charging for every request with PayGate x402.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/auth"}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-medium"
              data-testid="button-cta-start"
            >
              Start Monetizing
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = "/directory"}
              className="border-white text-white hover:bg-blue-700 px-8 py-3 text-lg font-medium"
              data-testid="button-cta-directory"
            >
              Explore the Directory
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PayGate x402</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <a href="/privacy" className="hover:text-blue-600 transition-colors" data-testid="link-privacy">
                Privacy
              </a>
              <a href="/terms" className="hover:text-blue-600 transition-colors" data-testid="link-terms">
                Terms
              </a>
              <a href="/contact" className="hover:text-blue-600 transition-colors" data-testid="link-contact-footer">
                Contact
              </a>
              <a href="/docs" className="hover:text-blue-600 transition-colors" data-testid="link-docs-footer">
                Documentation
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} PayGate x402. API monetization made simple.</p>
            <p className="mt-2">hello@paygate402.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
