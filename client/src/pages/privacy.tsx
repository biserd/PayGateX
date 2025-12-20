import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Coins, Menu, X } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

export default function PrivacyPolicy() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useSEO({
    title: 'Privacy Policy - PayGate x402',
    description: 'PayGate x402 privacy policy. Learn how we collect, use, store, and protect your personal data and blockchain wallet information. GDPR compliant and transparent data practices.',
    path: '/privacy',
    keywords: 'privacy policy, data protection, blockchain privacy, GDPR, data security'
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
            <a href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-home">
              Home
            </a>
            <a href="/directory" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-directory">
              Directory
            </a>
            <a href="/docs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-docs">
              Docs
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
              <a href="/" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-home">Home</a>
              <a href="/directory" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-directory">Directory</a>
              <a href="/docs" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-docs">Docs</a>
              <a href="/contact" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-contact">Contact</a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-500 mb-8">Last Updated: October 3, 2025</p>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                PayGate x402 collects information necessary to provide our API monetization and payment proxy services. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (organization name, email address)</li>
                <li>API usage data and analytics</li>
                <li>Payment transaction records</li>
                <li>Blockchain wallet addresses for payment processing</li>
                <li>Technical information (IP addresses, browser type, request logs)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use collected information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our payment proxy services</li>
                <li>Process blockchain payments through the x402 protocol</li>
                <li>Generate analytics and usage reports</li>
                <li>Enforce compliance rules and detect fraud</li>
                <li>Improve our platform and develop new features</li>
                <li>Communicate with you about your account and services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Sharing and Disclosure</h2>
              <p className="mb-4">
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Blockchain networks (Base, Ethereum) for payment verification</li>
                <li>Third-party payment facilitators (Coinbase) for transaction processing</li>
                <li>Service providers who assist in platform operations</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p>
                We implement industry-standard security measures including encryption, secure key storage with SHA-256 hashing, and HMAC-SHA256 webhook signing. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Request data correction or deletion</li>
                <li>Export your data</li>
                <li>Opt-out of certain data collection</li>
                <li>Close your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies for authentication, analytics, and platform functionality. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
              <p>
                For privacy-related questions or to exercise your rights, contact us at{" "}
                <a href="/contact" className="text-blue-600 hover:text-blue-700 underline">our contact page</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PayGate x402</span>
            </div>
            <div className="text-center md:text-right space-y-2">
              <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
                <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="link-privacy">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="link-terms">
                  Terms of Service
                </a>
              </div>
              <p className="text-gray-500">
                © 2025 PayGate x402. API monetization made simple.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
