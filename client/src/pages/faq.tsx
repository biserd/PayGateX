import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <p className="text-xs text-gray-400 font-medium hidden sm:block">FAQ</p>
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
            Frequently Asked Questions
          </h1>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-slate-900/50 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300">
                  What is PayGate x402?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  PayGate x402 is a payment proxy platform that implements the x402 protocol, enabling API providers to monetize their endpoints through blockchain-based micropayments on the Base network. We also operate the x402 Public Directory, a discovery platform where developers and AI agents can find payment-enabled APIs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-slate-900/50 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300">
                  How does the x402 protocol work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  When a request is made to a payment-protected API endpoint, PayGate returns an HTTP 402 "Payment Required" response with payment details. The client submits a blockchain payment (USDC on Base), and once verified, PayGate forwards the request to the actual API and returns the response. This all happens automatically without manual intervention.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-slate-900/50 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300">
                  What cryptocurrencies are supported?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Currently, PayGate supports USDC (USD Coin) on the Base blockchain. Base offers fast transaction times and low fees, making it ideal for API micropayments. We plan to expand to other networks like Ethereum, Polygon, and Arbitrum in the future.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-slate-900/50 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300">
                  What is the x402 Public Directory?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  The x402 Public Directory is a discovery platform—the "Etherscan for x402"—where anyone can browse and search payment-enabled APIs. It aggregates services from multiple sources including Coinbase Bazaar and the x402 Index, providing real-time pricing, categories, and metadata. No authentication required.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-slate-900/50 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300">
                  How much does PayGate cost?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  PayGate uses a pay-as-you-go model. API providers set their own endpoint prices in USDC. PayGate takes a small platform fee on each transaction to cover infrastructure costs. Free tier usage is available for testing and development purposes. Contact us for enterprise pricing options.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-slate-900/50 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300">
                  Is PayGate compatible with AI agents?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Yes! PayGate supports Google's Agent Payments Protocol (AP2), enabling seamless integration with AI agents. Our platform provides structured endpoint discovery, cost estimation APIs, and agent-parseable payment metadata. This positions PayGate at the intersection of the API Economy and the emerging Agent Economy.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="bg-slate-900/50 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300">
                  What security features does PayGate offer?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  PayGate implements enterprise-grade security including SHA-256 API key hashing, HMAC-SHA256 webhook signing, geographic restrictions, wallet allow/deny lists, compliance enforcement, and encrypted data storage. We also provide detailed audit logs for all transactions and platform activities.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="bg-slate-900/50 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300">
                  How do I get started as an API provider?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Sign up for an account, configure your organization, add your API endpoints with pricing, and PayGate generates a unique proxy URL. Point your users to this URL instead of your direct endpoint. PayGate handles all payment verification and forwards authenticated requests to your API. Check our documentation for detailed setup instructions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="bg-slate-900/50 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300">
                  Can I test PayGate before going live?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Absolutely! PayGate supports sandbox mode with Base Sepolia testnet for risk-free testing. You can simulate payments, test your integration, and verify the complete flow before switching to production with real USDC on Base Mainnet. Free tier limits also allow for production testing with minimal costs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="bg-slate-900/50 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-gray-300">
                  Where can I get help?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  We offer comprehensive documentation at /docs, and you can reach our support team through the contact page. For technical questions, check our GitHub repository or join our community Discord. Enterprise customers receive dedicated support with priority response times.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-12 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-lg p-8 text-center">
            <p className="text-lg text-white mb-4">Still have questions?</p>
            <p className="text-gray-300 mb-6">Our team is here to help you get started with PayGate x402.</p>
            <Button
              onClick={() => window.location.href = "/contact"}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
              data-testid="button-contact"
            >
              Contact Support
            </Button>
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
