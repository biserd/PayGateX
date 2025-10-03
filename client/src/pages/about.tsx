import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, Zap, Shield, Globe, Users } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

export default function About() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useSEO({
    title: 'About Us - Our Mission',
    description: 'Learn about PayGate x402 mission to revolutionize API monetization with blockchain payments. Discover our technology, vision, and the team behind the x402 protocol.',
    path: '/about'
  });

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-blue-950/10 to-cyan-950/20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%), 
                           radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.15) 0%, transparent 50%)`
        }} />
      </div>
      
      {/* Header */}
      <header className="relative border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl blur opacity-50 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">PayGate x402</h1>
              <p className="text-xs text-gray-400 font-medium hidden sm:block">About</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/"}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              data-testid="nav-home"
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/directory"}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              data-testid="nav-directory"
            >
              🌐 Directory
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/docs"}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              data-testid="nav-docs"
            >
              Documentation
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/contact"}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              data-testid="nav-contact"
            >
              Contact
            </Button>
            <Button 
              onClick={() => window.location.href = "/auth"}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 border-0 px-6 py-2.5 font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/25"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button
              onClick={() => window.location.href = "/auth"}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 px-3 py-2 text-sm"
              data-testid="mobile-button-login-top"
            >
              Sign In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white hover:bg-white/10 p-2"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <button
                onClick={() => { window.location.href = "/"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              <button
                onClick={() => { window.location.href = "/directory"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                data-testid="mobile-nav-directory"
              >
                🌐 Directory
              </button>
              <button
                onClick={() => { window.location.href = "/docs"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                data-testid="mobile-nav-docs"
              >
                Documentation
              </button>
              <button
                onClick={() => { window.location.href = "/contact"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                data-testid="mobile-nav-contact"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            About PayGate x402
          </h1>

          <div className="space-y-8 text-gray-300">
            <section>
              <p className="text-lg leading-relaxed">
                PayGate x402 is pioneering the future of API monetization through blockchain-based micropayments. 
                We implement the x402 payment protocol, enabling developers to monetize their APIs with automated, 
                trustless payment verification on the Base blockchain.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
              <p className="leading-relaxed">
                To empower API providers with enterprise-grade infrastructure that makes blockchain payments as simple 
                as traditional authentication, while creating the definitive discovery platform for payment-enabled APIs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">What We Do</h2>
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                  <Zap className="w-8 h-8 text-violet-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Enterprise SaaS Platform</h3>
                  <p className="text-sm">
                    Comprehensive dashboard for API providers to manage endpoints, track analytics, enforce compliance, 
                    and configure escrow—complementing infrastructure like Google AP2 and Stripe ACP.
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                  <Globe className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">x402 Public Directory</h3>
                  <p className="text-sm">
                    The "Etherscan for x402"—a public discovery platform where developers and AI agents find 
                    payment-enabled APIs, aggregating services from multiple sources.
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                  <Shield className="w-8 h-8 text-green-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Payment Proxy</h3>
                  <p className="text-sm">
                    Acts as a payment gateway, intercepting API calls, verifying blockchain payments, and forwarding 
                    requests upon successful payment verification.
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                  <Users className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">AI Agent Ready</h3>
                  <p className="text-sm">
                    Full compatibility with Google's AP2 protocol and structured endpoint discovery, enabling 
                    seamless integration with AI agents that power the Agent Economy.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Technology Stack</h2>
              <p className="mb-4">Built with modern, reliable technologies:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Base blockchain for fast, low-cost USDC transactions</li>
                <li>PostgreSQL with Drizzle ORM for type-safe data operations</li>
                <li>React and TypeScript for a robust frontend experience</li>
                <li>Express.js backend with service-oriented architecture</li>
                <li>Multi-source data aggregation from Coinbase Bazaar and x402 Index</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Why x402?</h2>
              <p className="leading-relaxed">
                The HTTP 402 status code was reserved for "Payment Required" but rarely implemented. We're bringing 
                it to life with blockchain technology, creating a new paradigm for API monetization that's transparent, 
                automated, and trustless. Whether you're an API provider seeking revenue or a developer discovering 
                payment-enabled services, PayGate x402 is your gateway to the future of the API Economy.
              </p>
            </section>

            <section className="pt-6">
              <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-lg p-6">
                <p className="text-lg text-center">
                  Ready to monetize your APIs or discover payment-enabled services?
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    onClick={() => window.location.href = "/auth"}
                    className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
                    data-testid="button-get-started"
                  >
                    Get Started
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/directory"}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    data-testid="button-directory"
                  >
                    Browse Directory
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                PayGate x402
              </span>
            </div>
            <div className="text-center md:text-right space-y-2">
              <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors" data-testid="link-privacy">
                  Privacy Policy
                </a>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors" data-testid="link-about">
                  About
                </a>
                <a href="/faq" className="text-gray-400 hover:text-white transition-colors" data-testid="link-faq">
                  FAQ
                </a>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors" data-testid="link-terms">
                  Terms of Service
                </a>
              </div>
              <p className="text-gray-400">
                © 2025 PayGate x402. Built with HTTP 402 protocol.
              </p>
              <p className="text-sm text-gray-500">
                Version 1.3.0
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
