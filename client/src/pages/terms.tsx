import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/use-seo";

export default function TermsOfService() {
  
  useSEO({
    title: 'Terms of Service - PayGate x402',
    description: 'PayGate x402 terms of service covering user responsibilities, payment terms, intellectual property rights, platform usage policies, liability limitations, and blockchain transaction terms.',
    path: '/terms',
    keywords: 'terms of service, user agreement, payment terms, platform policies, liability'
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicHeader />

      {/* Main Content */}
      <main className="relative">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-gray-500 mb-8">Last Updated: October 3, 2025</p>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or using PayGate x402 services, you agree to be bound by these Terms of Service. 
                If you disagree with any part of these terms, you may not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="mb-4">
                PayGate x402 provides:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>API payment proxy services implementing the x402 protocol</li>
                <li>Blockchain payment verification on the Base network</li>
                <li>Enterprise SaaS dashboard for API monetization management</li>
                <li>Public directory for discovering payment-enabled APIs</li>
                <li>Analytics, compliance, escrow, and webhook services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p className="mb-4">As a user of PayGate x402, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials and API keys</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the service for fraudulent or illegal activities</li>
                <li>Not attempt to bypass payment requirements or exploit vulnerabilities</li>
                <li>Not overload or disrupt the platform infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. API Provider Terms</h2>
              <p className="mb-4">
                If you use PayGate to monetize your APIs, you additionally agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintain uptime and service quality for your API endpoints</li>
                <li>Set reasonable and transparent pricing for your services</li>
                <li>Respond to disputes in a timely manner</li>
                <li>Provide accurate endpoint metadata and documentation</li>
                <li>Comply with data protection and privacy regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
              <p className="mb-4">
                All payments are processed in USDC on the Base blockchain. You acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Blockchain transactions are irreversible once confirmed</li>
                <li>You are responsible for network transaction fees (gas)</li>
                <li>PayGate charges a platform fee on each transaction</li>
                <li>Escrow terms are determined by individual API provider settings</li>
                <li>Refunds are subject to the API provider's refund policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p>
                PayGate x402 and its original content, features, and functionality are owned by PayGate and are 
                protected by international copyright, trademark, and other intellectual property laws. API providers 
                retain ownership of their API content and data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
              <p className="mb-4">
                We strive to provide reliable service but do not guarantee uninterrupted availability. 
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or discontinue services with reasonable notice</li>
                <li>Perform scheduled maintenance</li>
                <li>Suspend accounts for terms violations</li>
                <li>Update pricing and features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p>
                PayGate x402 shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages resulting from your use or inability to use the service. This includes but is not limited to 
                loss of profits, data, or blockchain transaction costs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Dispute Resolution</h2>
              <p>
                Disputes between API providers and consumers should first be resolved directly. PayGate may 
                provide mediation services but is not responsible for dispute outcomes. Our escrow system provides 
                protection mechanisms for both parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice, for conduct that we 
                believe violates these Terms or is harmful to other users, us, or third parties, or for any other 
                reason in our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of significant changes 
                via email or platform notification. Continued use of the service after changes constitutes acceptance 
                of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with applicable laws, without regard 
                to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please{" "}
                <a href="/contact" className="text-blue-600 hover:text-blue-700 underline">contact us</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
