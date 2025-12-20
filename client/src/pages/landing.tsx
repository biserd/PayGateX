import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Zap, DollarSign, Globe, Users, ArrowRight, Sparkles, Coins, TrendingUp, Lock, Menu, X } from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useSEO({
    title: 'Enterprise SaaS for x402 & AP2 Payment Protocol',
    description: 'Monetize your APIs with automated blockchain micropayments on Base. PayGate x402 implements the HTTP 402 protocol for trustless API payments with enterprise SaaS tools and public x402 directory.',
    path: '/'
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
      <section className="py-20 md:py-32 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The internet-native payment protocol
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Fast, cheap, and AI-friendly payments over HTTP
          </p>
          
          {/* Hero Visual */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12 max-w-4xl mx-auto">
            {/* Payment Card */}
            <div className="flex-1 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 text-left">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Payment required</h3>
              <p className="text-gray-600 mb-6">To access this content, please pay 1 USDC.</p>
              
              <div className="bg-white rounded-xl p-4 space-y-3 mb-6 shadow-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Connected wallet</span>
                  <span className="font-mono text-gray-900">0x7A2E...0E95</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Network</span>
                  <span className="text-gray-900 flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Base
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold text-gray-900">1 USDC</span>
                </div>
              </div>
              
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3">
                Pay now
              </Button>
            </div>
            
            {/* Code Block */}
            <div className="flex-1 bg-gray-900 rounded-2xl p-6 text-left overflow-hidden">
              <div className="font-mono text-sm space-y-4">
                <div>
                  <span className="text-gray-500">// one line of code to accept digital dollars</span>
                </div>
                <div>
                  <span className="text-white">app.</span>
                  <span className="text-blue-400">use</span>
                  <span className="text-white">(</span>
                  <span className="text-green-400">"/your-route"</span>
                  <span className="text-white">, </span>
                  <span className="text-yellow-400">paymentMiddleware</span>
                  <span className="text-white">(</span>
                  <span className="text-green-400">"$0.10"</span>
                  <span className="text-white">, </span>
                  <span className="text-orange-400">myAddress</span>
                  <span className="text-white">));</span>
                </div>
                <div className="mt-8">
                  <span className="text-gray-500">// if a request arrives without payment, the server responds</span>
                </div>
                <div>
                  <span className="text-gray-500">// with HTTP 402, prompting the client to pay and retry</span>
                </div>
                <div className="mt-4">
                  <span className="text-blue-400">HTTP</span>
                  <span className="text-white">/1.1 </span>
                  <span className="text-orange-400">402</span>
                  <span className="text-white"> Payment Required</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/auth"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
              data-testid="button-get-started"
            >
              Get started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = "/docs"}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-medium"
              data-testid="button-view-docs"
            >
              View docs
            </Button>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            The onchain payment gateway for AI and APIs
          </h2>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-0">
              Enterprise Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to monetize APIs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete payment infrastructure for API providers, from request interception to revenue analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Automated Payment Enforcement
                </CardTitle>
                <CardDescription className="text-gray-600">
                  x402 proxy intercepts requests and enforces payment before forwarding to your APIs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Escrow & Refunds
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Built-in escrow system with configurable hold periods and automated dispute resolution
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Real-time Analytics
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Track revenue, conversion rates, usage patterns and performance metrics in real-time
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
                  Geo-blocking, IP filtering, wallet restrictions and regulatory compliance tools
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Multi-Network Support
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Accept USDC payments on Base, Ethereum and other supported blockchain networks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-gray-900 text-xl mb-2">
                  Developer-Friendly
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Simple integration with comprehensive API documentation and webhook support
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
              Revenue Sharing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              You keep 85-95% of revenue
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No upfront costs. No monthly fees. We only succeed when you do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-6">
                <CardTitle className="text-gray-900 text-xl mb-2">Starter</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">15%</span>
                  <span className="text-gray-500 ml-2">platform fee</span>
                </div>
                <div className="text-green-600 font-semibold mb-4">You keep 85%</div>
                <CardDescription className="text-gray-600">
                  Perfect for developers getting started with API monetization.
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
                    Basic analytics dashboard
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Base & Ethereum networks
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Email support
                  </li>
                </ul>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-starter-plan"
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Growth Plan */}
            <Card className="bg-white border-2 border-blue-600 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 text-white border-0">Recommended</Badge>
              </div>
              <CardHeader className="p-6 pt-8">
                <CardTitle className="text-gray-900 text-xl mb-2">Growth</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">10%</span>
                  <span className="text-gray-500 ml-2">platform fee</span>
                </div>
                <div className="text-green-600 font-semibold mb-4">You keep 90%</div>
                <CardDescription className="text-gray-600">
                  Ideal for growing businesses scaling their API revenue.
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
                    Advanced analytics & insights
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Configurable escrow periods
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Priority support + SLA
                  </li>
                </ul>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                  <span className="text-4xl font-bold text-gray-900">5%</span>
                  <span className="text-gray-500 ml-2">platform fee</span>
                </div>
                <div className="text-green-600 font-semibold mb-4">You keep 95%</div>
                <CardDescription className="text-gray-600">
                  For large-scale operations requiring custom features.
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
                    Custom analytics & reporting
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Dedicated infrastructure
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    24/7 dedicated support
                  </li>
                </ul>
                <Button 
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  data-testid="button-enterprise-plan"
                >
                  Contact Sales
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
              How it works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in minutes with our simple integration process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect Your API</h3>
              <p className="text-gray-600">
                Register your API endpoints and set pricing in USDC. Configure target URLs and supported networks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Route Traffic</h3>
              <p className="text-gray-600">
                Direct API calls through our proxy. Unpaid requests receive HTTP 402 with payment instructions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Paid</h3>
              <p className="text-gray-600">
                Receive USDC payments directly to your wallet. Track revenue in real-time on your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to monetize your APIs?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join developers already earning revenue with PayGate x402. Start with our free tier and scale as you grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/auth"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
              data-testid="button-cta-start"
            >
              Get started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = "/directory"}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-medium"
              data-testid="button-cta-directory"
            >
              Explore Directory
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
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-blue-600 transition-colors" data-testid="link-terms">
                Terms of Service
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
            <p>&copy; {new Date().getFullYear()} PayGate x402. Built for the x402 protocol ecosystem.</p>
            <p className="mt-2">Contact: hello@paygate402.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
