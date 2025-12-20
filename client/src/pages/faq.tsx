import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Coins, Menu, X } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useSEO({
    title: 'PayGate x402 FAQ - API Monetization & x402 Protocol Questions',
    description: 'Comprehensive FAQ covering PayGate x402 features, x402 protocol implementation, blockchain payments, USDC pricing, sandbox testing, AI agent compatibility, security features, and getting started guides.',
    path: '/faq',
    keywords: 'x402 FAQ, API monetization questions, blockchain payment FAQ, USDC pricing, sandbox mode, AI agents, x402 protocol',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is PayGate x402?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PayGate x402 is a payment proxy platform implementing the x402 protocol, enabling API providers to monetize endpoints through blockchain micropayments on Base network.'
          }
        },
        {
          '@type': 'Question',
          name: 'How does the x402 protocol work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'When a request hits a payment-protected endpoint, PayGate returns HTTP 402 with payment details. Client submits USDC payment on Base, PayGate verifies and forwards request.'
          }
        },
        {
          '@type': 'Question',
          name: 'What cryptocurrencies are supported?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Currently USDC (USD Coin) on Base blockchain. Plans to expand to Ethereum, Polygon, and Arbitrum.'
          }
        }
      ]
    }
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-opacity" data-testid="logo-home">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">PayGate x402</h1>
              <p className="text-xs text-gray-500 font-medium hidden sm:block">FAQ</p>
            </div>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/"}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              data-testid="nav-home"
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/directory"}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              data-testid="nav-directory"
            >
              🌐 Directory
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/docs"}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              data-testid="nav-docs"
            >
              Documentation
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/contact"}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              data-testid="nav-contact"
            >
              Contact
            </Button>
            <Button 
              onClick={() => window.location.href = "/auth"}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button
              onClick={() => window.location.href = "/auth"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium"
              data-testid="mobile-button-login-top"
            >
              Sign In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <button
                onClick={() => { window.location.href = "/"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              <button
                onClick={() => { window.location.href = "/directory"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                data-testid="mobile-nav-directory"
              >
                🌐 Directory
              </button>
              <button
                onClick={() => { window.location.href = "/docs"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                data-testid="mobile-nav-docs"
              >
                Documentation
              </button>
              <button
                onClick={() => { window.location.href = "/contact"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                data-testid="mobile-nav-contact"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
            Frequently Asked Questions
          </h1>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm">
                <AccordionTrigger className="text-gray-900 hover:text-blue-600">
                  What is PayGate x402?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  PayGate x402 is a payment proxy platform that implements the x402 protocol, enabling API providers to monetize their endpoints through blockchain-based micropayments on the Base network. We also operate the x402 Public Directory, a discovery platform where developers and AI agents can find payment-enabled APIs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm">
                <AccordionTrigger className="text-gray-900 hover:text-blue-600">
                  How does the x402 protocol work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  When a request is made to a payment-protected API endpoint, PayGate returns an HTTP 402 "Payment Required" response with payment details. The client submits a blockchain payment (USDC on Base), and once verified, PayGate forwards the request to the actual API and returns the response. This all happens automatically without manual intervention.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm">
                <AccordionTrigger className="text-gray-900 hover:text-blue-600">
                  What cryptocurrencies are supported?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Currently, PayGate supports USDC (USD Coin) on the Base blockchain. Base offers fast transaction times and low fees, making it ideal for API micropayments. We plan to expand to other networks like Ethereum, Polygon, and Arbitrum in the future.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm">
                <AccordionTrigger className="text-gray-900 hover:text-blue-600">
                  What is the x402 Public Directory?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  The x402 Public Directory is a discovery platform—the "Etherscan for x402"—where anyone can browse and search payment-enabled APIs. It aggregates services from multiple sources including Coinbase Bazaar and the x402 Index, providing real-time pricing, categories, and metadata. No authentication required.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm">
                <AccordionTrigger className="text-gray-900 hover:text-blue-600">
                  How much does PayGate cost?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  PayGate uses a pay-as-you-go model. API providers set their own endpoint prices in USDC. PayGate takes a small platform fee on each transaction to cover infrastructure costs. Free tier usage is available for testing and development purposes. Contact us for enterprise pricing options.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm">
                <AccordionTrigger className="text-gray-900 hover:text-blue-600">
                  Is PayGate compatible with AI agents?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Yes! PayGate supports Google's Agent Payments Protocol (AP2), enabling seamless integration with AI agents. Our platform provides structured endpoint discovery, cost estimation APIs, and agent-parseable payment metadata. This positions PayGate at the intersection of the API Economy and the emerging Agent Economy.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm">
                <AccordionTrigger className="text-gray-900 hover:text-blue-600">
                  What security features does PayGate offer?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  PayGate implements enterprise-grade security including SHA-256 API key hashing, HMAC-SHA256 webhook signing, geographic restrictions, wallet allow/deny lists, compliance enforcement, and encrypted data storage. We also provide detailed audit logs for all transactions and platform activities.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm">
                <AccordionTrigger className="text-gray-900 hover:text-blue-600">
                  How do I get started as an API provider?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Sign up for an account, configure your organization, add your API endpoints with pricing, and PayGate generates a unique proxy URL. Point your users to this URL instead of your direct endpoint. PayGate handles all payment verification and forwards authenticated requests to your API. Check our documentation for detailed setup instructions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm">
                <AccordionTrigger className="text-gray-900 hover:text-blue-600">
                  Can I test PayGate before going live?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Absolutely! PayGate supports sandbox mode with Base Sepolia testnet for risk-free testing. You can simulate payments, test your integration, and verify the complete flow before switching to production with real USDC on Base Mainnet. Free tier limits also allow for production testing with minimal costs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm">
                <AccordionTrigger className="text-gray-900 hover:text-blue-600">
                  Where can I get help?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  We offer comprehensive documentation at /docs, and you can reach our support team through the contact page. For technical questions, check our GitHub repository or join our community Discord. Enterprise customers receive dedicated support with priority response times.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-lg text-gray-900 font-medium mb-4">Still have questions?</p>
            <p className="text-gray-600 mb-6">Our team is here to help you get started with PayGate x402.</p>
            <Button
              onClick={() => window.location.href = "/contact"}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              data-testid="button-contact"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </main>

      <Footer showAbout={true} footerText="Built with HTTP 402 protocol." version="1.3.0" showVersion={true} />
    </div>
  );
}
