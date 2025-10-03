import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Sparkles, Zap, Shield, Users, ChevronRight, Webhook, Key, Globe, Menu, X } from "lucide-react";

interface ReleaseData {
  id: string;
  version: string;
  date: string;
  title: string;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  };
  description: string;
  sections: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    items: string[];
  }[];
  highlight?: string;
}

const RELEASE_DATA: (ReleaseData | { id: string; type: 'roadmap' })[] = [
  {
    id: "v1.3.0",
    version: "1.3.0",
    date: "October 3, 2025",
    title: "x402 Public Directory",
    badge: {
      text: "Latest",
      variant: "secondary",
      className: "bg-green-500/20 text-green-300 border-green-500/30"
    },
    description: "🌐 Revolutionary public discovery platform - the \"Etherscan for x402\" - where developers and AI agents discover payment-enabled APIs",
    sections: [
      {
        title: "Public Service Discovery",
        icon: Globe,
        iconColor: "text-cyan-400",
        items: [
          "Public directory accessible to all developers and AI agents (no authentication required)",
          "Multi-source aggregation from Coinbase Bazaar and x402 Index",
          "Real-time quote collection from each service for live pricing",
          "Rich metadata: names, descriptions, categories, networks, response times",
          "Beautiful modern UI with gradient cards and responsive design"
        ]
      },
      {
        title: "Advanced Search & Filtering",
        icon: Zap,
        iconColor: "text-violet-400",
        items: [
          "Full-text search across service names and descriptions",
          "Category filtering (AI, Weather, Finance, Media, News, and more)",
          "Network filtering (Base, Ethereum, etc.)",
          "Active status indicators for service availability",
          "Sort and browse capabilities for easy discovery"
        ]
      },
      {
        title: "Automated Data Collection",
        icon: Sparkles,
        iconColor: "text-amber-400",
        items: [
          "Hourly automated scraper refreshes directory data",
          "Resilient multi-source fetching with timeout protection",
          "Per-service error tolerance ensures partial failures don't block updates",
          "URL deduplication across multiple sources",
          "JSONB metadata storage for flexible service information"
        ]
      }
    ],
    highlight: "Strategic Achievement: Establishes PayGate as the definitive x402 ecosystem hub - not just infrastructure for API providers, but the primary discovery platform where developers and AI agents find payment-enabled services. Positions PayGate as the \"Etherscan for x402\" while complementing Google AP2 and Stripe ACP."
  },
  {
    id: "v1.2.0",
    version: "1.2.0",
    date: "October 1, 2025",
    title: "Enterprise Provider Tools",
    badge: {
      text: "Stable",
      variant: "outline",
      className: "border-white/20 text-gray-300"
    },
    description: "🔧 Production-ready tools for API providers to manage and monetize their endpoints",
    sections: [
      {
        title: "Webhook System",
        icon: Webhook,
        iconColor: "text-purple-400",
        items: [
          "HMAC-SHA256 cryptographic signing for secure webhook verification",
          "Exponential backoff retry with 5 attempts (1s, 2s, 4s, 8s, 16s intervals)",
          "Event broadcasting on payment.confirmed, payment.failed, escrow.created",
          "Complete delivery tracking with success/failure logs",
          "One-click test webhook delivery for validation",
          "Multi-tenant organization-scoped webhook management"
        ]
      },
      {
        title: "API Key Management",
        icon: Key,
        iconColor: "text-amber-400",
        items: [
          "High-entropy key generation (pk_live_*) with 256-bit randomness",
          "SHA-256 hashing - keys stored securely, plaintext never persisted",
          "One-time display - full key shown only once at creation",
          "Prefix display showing first 12 characters for identification",
          "Instant revocation with timestamp tracking",
          "Cross-tenant protection with organization ownership validation",
          "Usage tracking with last used timestamps for audit"
        ]
      },
      {
        title: "Security Enhancements",
        icon: Shield,
        iconColor: "text-green-400",
        items: [
          "Organization ownership validation before webhook/key operations",
          "HMAC-SHA256 payload signing for webhooks",
          "SHA-256 hashing for API keys (no plaintext storage)",
          "Cross-tenant protection across all provider tools"
        ]
      }
    ],
    highlight: "Positions PayGate x402 as enterprise-grade infrastructure complementary to Google AP2 and Stripe ACP, enabling API providers to monetize endpoints that power AI agents through blockchain-based micropayments."
  },
  {
    id: "v1.1.0",
    version: "1.1.0",
    date: "September 21, 2025",
    title: "AP2 Agent Payments Protocol Compatibility",
    badge: {
      text: "Stable",
      variant: "outline",
      className: "border-white/20 text-gray-300"
    },
    description: "🤖 PayGate x402 now supports AI agent integrations through Google Cloud's Agent Payments Protocol",
    sections: [
      {
        title: "AP2 Agent Support",
        icon: Users,
        iconColor: "text-violet-400",
        items: [
          "Support for AP2-Agent-ID and AP2-Mandate-Hash headers",
          "Enhanced 402 Payment Required responses with agent-parseable metadata", 
          "Structured endpoint information for automated integration discovery"
        ]
      },
      {
        title: "Cost Estimation API",
        icon: Zap,
        iconColor: "text-cyan-400",
        items: [
          "GET /api/v1/pricing/estimate - Single endpoint cost estimation",
          "POST /api/v1/pricing/batch-estimate - Bulk cost estimation for agent planning",
          "Real-time pricing with network-aware cost calculations"
        ]
      },
      {
        title: "Platform Versioning & Capabilities",
        icon: Shield,
        iconColor: "text-green-400",
        items: [
          "GET /api/version - Comprehensive platform capability discovery",
          "Feature detection API with ap2Compatible: true",
          "Network support information (Base, Base Sepolia) for multi-chain operations"
        ]
      }
    ],
    highlight: "Strategic Impact: With Google Cloud's AP2 protocol and 60+ industry partners, PayGate x402 v1.1.0 is positioned at the intersection of the API Economy and Agent Economy, enabling seamless AI agent integration."
  },
  {
    id: "v1.0.0", 
    version: "1.0.0",
    date: "August 2025",
    title: "Initial Platform Release",
    badge: {
      text: "Stable",
      variant: "outline",
      className: "border-white/20 text-gray-300"
    },
    description: "🚀 Complete x402 payment protocol implementation with comprehensive SaaS platform",
    sections: [
      {
        title: "Core Features",
        icon: Shield,
        iconColor: "text-blue-400",
        items: [
          "x402 Payment Protocol Implementation",
          "Multi-tenant Organization Support", 
          "Endpoint Management & Configuration",
          "Real-time Usage Analytics"
        ]
      },
      {
        title: "Payment Features", 
        icon: Zap,
        iconColor: "text-green-400",
        items: [
          "Base Network USDC Integration",
          "Configurable Escrow System",
          "Free Tier Management", 
          "Compliance & Geo-blocking"
        ]
      }
    ]
  },
  {
    id: "roadmap",
    type: "roadmap" as const
  }
];

const ROADMAP_ITEMS = [
  "Sandbox Mode Enhancements - Mock payment simulator and test dashboard",
  "OpenAPI Import - Bulk endpoint creation from OpenAPI/Swagger specs",
  "Enhanced AI Agent Discovery Protocol integration",
  "Multi-chain payment support expansion (Ethereum, Polygon, Arbitrum)", 
  "Advanced analytics and reporting dashboard with custom metrics",
  "White-label deployment options for enterprise customers"
];

export default function ReleaseNotes() {
  const [selectedVersion, setSelectedVersion] = useState("v1.3.0");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // URL synchronization
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const versionParam = urlParams.get('v');
    if (versionParam && RELEASE_DATA.some(r => r.id === versionParam)) {
      setSelectedVersion(versionParam);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('v', selectedVersion);
    window.history.replaceState({}, '', url.toString());
  }, [selectedVersion]);

  const selectedData = RELEASE_DATA.find(r => r.id === selectedVersion);
  const isRoadmap = selectedData && 'type' in selectedData && selectedData.type === 'roadmap';
  const renderContent = () => {
    if (isRoadmap) {
      return (
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl text-white flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-violet-400" />
              Upcoming Features
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              Features planned for future releases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ROADMAP_ITEMS.map((item, index) => (
                <div key={index} className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-4 flex-shrink-0 mt-1"></span>
                  <span className="text-lg">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!selectedData || 'type' in selectedData) return null;
    const release = selectedData;

    return (
      <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm" data-testid={`release-${release.id}`}>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {release.badge && (
                <Badge 
                  variant={release.badge.variant}
                  className={release.badge.className}
                >
                  {release.badge.text === "Latest" && <Sparkles className="w-3 h-3 mr-1" />}
                  {release.badge.text}
                </Badge>
              )}
              <CardTitle className="text-3xl text-white">Version {release.version}</CardTitle>
            </div>
            <span className="text-sm text-gray-400">{release.date}</span>
          </div>
          <CardDescription className="text-lg text-gray-300">
            {release.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {release.sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                <section.icon className={`w-5 h-5 mr-3 ${section.iconColor}`} />
                {section.title}
              </h4>
              <ul className="space-y-3 ml-8">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className={`w-2 h-2 ${section.iconColor.replace('text-', 'bg-')} rounded-full mt-2 mr-4 flex-shrink-0`}></span>
                    <span className="text-gray-300 text-base leading-relaxed">
                      {item.includes('GET /') || item.includes('POST /') ? (
                        <>
                          <code className="bg-slate-800 px-2 py-1 rounded text-sm text-cyan-300">
                            {item.split(' - ')[0]}
                          </code>
                          {item.split(' - ')[1] && ` - ${item.split(' - ')[1]}`}
                        </>
                      ) : (
                        item
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {release.highlight && (
            <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-violet-500/20">
              <p className="text-base text-gray-300">
                <strong className="text-violet-300">Strategic Impact:</strong> {release.highlight.replace('Strategic Impact: ', '')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
              <p className="text-xs text-gray-400 font-medium hidden sm:block">Release Notes</p>
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
        <div className="container mx-auto px-6 py-12">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Release Notes
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Stay up to date with the latest PayGate x402 features, improvements, and updates
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="flex gap-8 max-w-7xl mx-auto">
            {/* Left Sidebar - Version Navigation */}
            <div className="w-80 flex-shrink-0">
              <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm sticky top-8 h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white">Versions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 p-4">
                      {RELEASE_DATA.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedVersion(item.id)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                            selectedVersion === item.id
                              ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 text-white'
                              : 'hover:bg-slate-800/50 text-gray-300 hover:text-white'
                          }`}
                          data-testid={`version-nav-${item.id}`}
                        >
                          <div>
                            {item.id === 'roadmap' ? (
                              <div>
                                <div className="font-medium">Roadmap</div>
                                <div className="text-xs text-gray-400">Upcoming Features</div>
                              </div>
                            ) : (
                              'type' in item ? null : (
                                <div>
                                  <div className="font-medium">v{(item as ReleaseData).version}</div>
                                  <div className="text-xs text-gray-400">{(item as ReleaseData).date}</div>
                                  {(item as ReleaseData).badge?.text === "Latest" && (
                                    <Badge 
                                      variant="secondary" 
                                      className="text-xs mt-1 bg-green-500/20 text-green-300 border-green-500/30"
                                    >
                                      {(item as ReleaseData).badge.text}
                                    </Badge>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            selectedVersion === item.id ? 'rotate-90' : 'group-hover:translate-x-1'
                          }`} />
                        </button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0">
              <div className="transition-all duration-300 ease-in-out">
                {renderContent()}
              </div>
              
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
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © 2025 PayGate x402. Built with HTTP 402 protocol.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Version 1.3.0
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}