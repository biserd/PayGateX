import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Zap, DollarSign, Globe, Users, ArrowRight, Sparkles, Coins, TrendingUp, Lock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">
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
            <div className="relative w-10 h-10 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
              <Sparkles className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl blur opacity-50 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">PayGate x402</h1>
              <p className="text-xs text-gray-400 font-medium">API Monetization Platform</p>
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

      {/* Hero Section */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto text-center">
          <Badge className="mb-8 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 text-violet-300 backdrop-blur-sm px-4 py-2">
            <Coins className="w-4 h-4 mr-2" />
            Built on x402 Protocol
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Monetize APIs
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Instantly
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Transform any API into a <span className="text-violet-400 font-semibold">revenue stream</span> with automated micropayments. 
            PayGate handles payment verification, escrow management, and compliance while you focus on building.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/auth"}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 border-0 px-10 py-4 text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/30 hover:scale-105"
              data-testid="button-get-started"
            >
              <Sparkles className="mr-3 w-5 h-5" />
              Start Building
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400 px-10 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300"
              data-testid="button-view-demo"
            >
              <TrendingUp className="mr-2 w-5 h-5" />
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400 mb-2">$2M+</div>
              <div className="text-gray-400 text-sm">Revenue Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">99.9%</div>
              <div className="text-gray-400 text-sm">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">50ms</div>
              <div className="text-gray-400 text-sm">Avg Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 text-cyan-300 backdrop-blur-sm">
              <Lock className="w-4 h-4 mr-2" />
              Enterprise-Grade Infrastructure
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything You Need
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                to Monetize APIs
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Complete payment infrastructure for API providers, from request interception to revenue analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-900/50 border border-violet-500/20 backdrop-blur-xl hover:bg-slate-900/70 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 group">
              <CardHeader className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-violet-500/25">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-2xl mb-4 group-hover:text-violet-300 transition-colors">
                  Automated Payment Enforcement
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg leading-relaxed">
                  x402 proxy intercepts requests and enforces payment before forwarding to your APIs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border border-emerald-500/20 backdrop-blur-xl hover:bg-slate-900/70 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 group">
              <CardHeader className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-emerald-500/25">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-2xl mb-4 group-hover:text-emerald-300 transition-colors">
                  Escrow & Refunds
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg leading-relaxed">
                  Built-in escrow system with configurable hold periods and automated dispute resolution
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border border-cyan-500/20 backdrop-blur-xl hover:bg-slate-900/70 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 group">
              <CardHeader className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-cyan-500/25">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-2xl mb-4 group-hover:text-cyan-300 transition-colors">
                  Real-time Analytics
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg leading-relaxed">
                  Track revenue, conversion rates, usage patterns and performance metrics in real-time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border border-orange-500/20 backdrop-blur-xl hover:bg-slate-900/70 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 group">
              <CardHeader className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-orange-500/25">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-2xl mb-4 group-hover:text-orange-300 transition-colors">
                  Compliance Controls
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg leading-relaxed">
                  Geo-blocking, IP filtering, wallet restrictions and regulatory compliance tools
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border border-indigo-500/20 backdrop-blur-xl hover:bg-slate-900/70 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 group">
              <CardHeader className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-indigo-500/25">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-2xl mb-4 group-hover:text-indigo-300 transition-colors">
                  Multi-Network Support
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg leading-relaxed">
                  Accept USDC payments on Base, Ethereum and other supported blockchain networks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border border-pink-500/20 backdrop-blur-xl hover:bg-slate-900/70 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 group">
              <CardHeader className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-pink-500/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-2xl mb-4 group-hover:text-pink-300 transition-colors">
                  Developer-Friendly
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg leading-relaxed">
                  Simple integration with comprehensive API documentation and webhook support
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three simple steps to start monetizing your APIs with automated micropayments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center group">
              <div className="relative w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-violet-500/30">
                1
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl blur opacity-50 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-violet-300 transition-colors">Connect Your API</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Register your API endpoints and set pricing in USDC. Configure target URLs and supported networks.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-cyan-500/30">
                2
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl blur opacity-50 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-cyan-300 transition-colors">Route Traffic</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Direct API calls through our proxy. Unpaid requests receive HTTP 402 with payment instructions.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-emerald-500/30">
                3
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl blur opacity-50 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-emerald-300 transition-colors">Get Paid</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Payments are verified and held in escrow. Funds are released automatically after the hold period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-cyan-600/20" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Ready to
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Monetize Your APIs?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join developers already earning revenue with PayGate x402. Start with our free tier and scale as you grow.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = "/auth"}
            className="bg-gradient-to-r from-white to-gray-100 text-slate-900 hover:from-gray-100 hover:to-white px-12 py-6 text-xl font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:scale-105"
            data-testid="button-start-earning"
          >
            <DollarSign className="mr-3 w-6 h-6" />
            Start Earning Today
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
        </div>
      </section>

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
            <p className="text-gray-400">
              © 2025 PayGate x402. Built with HTTP 402 protocol.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}