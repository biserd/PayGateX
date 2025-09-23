import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Zap, Shield, Users } from "lucide-react";

export default function ReleaseNotes() {
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
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => window.location.href = "/"}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
                <Sparkles className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl blur opacity-50 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">PayGate x402</h1>
                <p className="text-xs text-gray-400 font-medium">Release Notes</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = "/auth"}
            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 border-0 px-6 py-2.5 font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/25"
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Release Notes
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Stay up to date with the latest PayGate x402 features, improvements, and updates
            </p>
          </div>

          {/* Release v1.1.0 - AP2 Compatibility */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm mb-8" data-testid="release-v1-1-0">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Latest
                  </Badge>
                  <CardTitle className="text-3xl text-white">Version 1.1.0</CardTitle>
                </div>
                <span className="text-sm text-gray-400">September 21, 2025</span>
              </div>
              <CardDescription className="text-lg text-gray-300">
                🤖 <strong>AP2 Agent Payments Protocol Compatibility</strong> - PayGate x402 now supports AI agent integrations through Google Cloud's Agent Payments Protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AP2 Features */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-violet-400" />
                  AP2 Agent Support
                </h4>
                <ul className="space-y-2 text-gray-300 ml-7">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-violet-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Support for <code className="bg-slate-800 px-2 py-1 rounded text-sm">AP2-Agent-ID</code> and <code className="bg-slate-800 px-2 py-1 rounded text-sm">AP2-Mandate-Hash</code> headers
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-violet-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Enhanced 402 Payment Required responses with agent-parseable metadata
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-violet-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Structured endpoint information for automated integration discovery
                  </li>
                </ul>
              </div>

              {/* Cost Estimation API */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                  Cost Estimation API
                </h4>
                <ul className="space-y-2 text-gray-300 ml-7">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <code className="bg-slate-800 px-2 py-1 rounded text-sm">GET /api/v1/pricing/estimate</code> - Single endpoint cost estimation
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <code className="bg-slate-800 px-2 py-1 rounded text-sm">POST /api/v1/pricing/batch-estimate</code> - Bulk cost estimation for agent planning
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Real-time pricing with network-aware cost calculations
                  </li>
                </ul>
              </div>

              {/* Platform Versioning */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-400" />
                  Platform Versioning & Capabilities
                </h4>
                <ul className="space-y-2 text-gray-300 ml-7">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <code className="bg-slate-800 px-2 py-1 rounded text-sm">GET /api/version</code> - Comprehensive platform capability discovery
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Feature detection API with <code className="bg-slate-800 px-2 py-1 rounded text-sm">ap2Compatible: true</code>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Network support information (Base, Base Sepolia) for multi-chain operations
                  </li>
                </ul>
              </div>

              {/* Technical Improvements */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-3">🔧 Technical Improvements</h4>
                <ul className="space-y-2 text-gray-300 ml-7">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Fixed payment target consistency for proper settlement verification
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Enhanced AP2 metadata semantics with proper mandate handling
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Improved network consistency across sandbox and production modes
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-violet-500/20">
                <p className="text-sm text-gray-300">
                  <strong className="text-violet-300">Strategic Impact:</strong> With Google Cloud's AP2 protocol and 60+ industry partners, PayGate x402 v1.1.0 is positioned at the intersection of the API Economy and Agent Economy, enabling seamless AI agent integration.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Release v1.0.0 - Initial Release */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm mb-8" data-testid="release-v1-0-0">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="border-white/20 text-gray-300">
                    Stable
                  </Badge>
                  <CardTitle className="text-3xl text-white">Version 1.0.0</CardTitle>
                </div>
                <span className="text-sm text-gray-400">August 2025</span>
              </div>
              <CardDescription className="text-lg text-gray-300">
                🚀 <strong>Initial Platform Release</strong> - Complete x402 payment protocol implementation with comprehensive SaaS platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-white mb-2">Core Features</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• x402 Payment Protocol Implementation</li>
                    <li>• Multi-tenant Organization Support</li>
                    <li>• Endpoint Management & Configuration</li>
                    <li>• Real-time Usage Analytics</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-white mb-2">Payment Features</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Base Network USDC Integration</li>
                    <li>• Configurable Escrow System</li>
                    <li>• Free Tier Management</li>
                    <li>• Compliance & Geo-blocking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roadmap Section */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-violet-400" />
                Upcoming Features
              </CardTitle>
              <CardDescription className="text-gray-300">
                Features planned for future releases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  <span>Enhanced AI Agent Discovery Protocol integration</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  <span>Multi-chain payment support expansion</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  <span>Advanced analytics and reporting dashboard</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  <span>White-label deployment options</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <div className="flex justify-center space-x-4 mt-12">
            <Button
              onClick={() => window.location.href = "/docs"}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              data-testid="button-docs"
            >
              View Documentation
            </Button>
            <Button
              onClick={() => window.location.href = "/auth"}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}