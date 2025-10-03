import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";

export default function PrivacyPolicy() {
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
              <p className="text-xs text-gray-400 font-medium hidden sm:block">Privacy Policy</p>
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
            Privacy Policy
          </h1>
          <p className="text-gray-400 mb-8">Last Updated: October 3, 2025</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
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
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
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
              <h2 className="text-2xl font-semibold text-white mb-4">3. Data Sharing and Disclosure</h2>
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
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
              <p>
                We implement industry-standard security measures including encryption, secure key storage with SHA-256 hashing, and HMAC-SHA256 webhook signing. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
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
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies for authentication, analytics, and platform functionality. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
              <p>
                For privacy-related questions or to exercise your rights, contact us at{" "}
                <a href="/contact" className="text-cyan-400 hover:text-cyan-300 underline">our contact page</a>.
              </p>
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
