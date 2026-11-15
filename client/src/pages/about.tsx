import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Zap, Shield, Globe, Users } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

export default function About() {
  
  useSEO({
    title: 'About PayGate x402 - Revolutionizing API Monetization',
    description: 'PayGate x402 is building the infrastructure for the API economy and agent economy. Learn about our mission, vision, technology stack, and why we chose the x402 protocol for seamless API monetization.',
    path: '/about',
    keywords: 'PayGate x402, API economy, blockchain payments, x402 protocol, payment infrastructure, API monetization platform'
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicHeader />

      {/* Main Content */}
      <main className="bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
            About PayGate x402
          </h1>

          <div className="space-y-8 text-gray-600">
            <section>
              <p className="text-lg leading-relaxed">
                PayGate x402 is pioneering the future of API monetization through blockchain-based micropayments. 
                We implement the x402 payment protocol, enabling developers to monetize their APIs with automated, 
                trustless payment verification on the Base blockchain.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="leading-relaxed">
                To empower API providers with enterprise-grade infrastructure that makes blockchain payments as simple 
                as traditional authentication, while creating the definitive discovery platform for payment-enabled APIs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <Zap className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise SaaS Platform</h3>
                  <p className="text-sm text-gray-600">
                    Comprehensive dashboard for API providers to manage endpoints, track analytics, enforce compliance, 
                    and configure escrow—complementing infrastructure like Google AP2 and Stripe ACP.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <Globe className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">x402 Public Directory</h3>
                  <p className="text-sm text-gray-600">
                    The "Etherscan for x402"—a public discovery platform where developers and AI agents find 
                    payment-enabled APIs, aggregating services from multiple sources.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <Shield className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Proxy</h3>
                  <p className="text-sm text-gray-600">
                    Acts as a payment gateway, intercepting API calls, verifying blockchain payments, and forwarding 
                    requests upon successful payment verification.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <Users className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Agent Ready</h3>
                  <p className="text-sm text-gray-600">
                    Full compatibility with Google's AP2 protocol and structured endpoint discovery, enabling 
                    seamless integration with AI agents that power the Agent Economy.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
              <p className="mb-4 text-gray-600">Built with modern, reliable technologies:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-600">
                <li>Base blockchain for fast, low-cost USDC transactions</li>
                <li>PostgreSQL with Drizzle ORM for type-safe data operations</li>
                <li>React and TypeScript for a robust frontend experience</li>
                <li>Express.js backend with service-oriented architecture</li>
                <li>Multi-source data aggregation from Coinbase Bazaar and x402 Index</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why x402?</h2>
              <p className="leading-relaxed text-gray-600">
                The HTTP 402 status code was reserved for "Payment Required" but rarely implemented. We're bringing 
                it to life with blockchain technology, creating a new paradigm for API monetization that's transparent, 
                automated, and trustless. Whether you're an API provider seeking revenue or a developer discovering 
                payment-enabled services, PayGate x402 is your gateway to the future of the API Economy.
              </p>
            </section>

            <section className="pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-lg text-center text-gray-900 font-medium">
                  Ready to monetize your APIs or discover payment-enabled services?
                </p>
                <div className="flex justify-center gap-4 mt-6 flex-wrap">
                  <Button
                    onClick={() => window.location.href = "/auth"}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    data-testid="button-get-started"
                  >
                    Get Started
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/directory"}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
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

      <Footer showAbout={true} footerText="Built with HTTP 402 protocol." version="1.3.0" showVersion={true} />
    </div>
  );
}
