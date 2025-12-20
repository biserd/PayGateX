import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Footer } from "@/components/Footer";
import { Coins, Zap, Shield, Users, ChevronRight, Webhook, Key, Globe, Menu, X } from "lucide-react";

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
      className: "bg-green-100 text-green-700 border-0"
    },
    description: "🌐 Revolutionary public discovery platform - the \"Etherscan for x402\" - where developers and AI agents discover payment-enabled APIs",
    sections: [
      {
        title: "Public Service Discovery",
        icon: Globe,
        iconColor: "text-blue-600",
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
        iconColor: "text-blue-600",
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
        icon: Zap,
        iconColor: "text-orange-600",
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
      className: "border-gray-300 text-gray-700"
    },
    description: "🔧 Production-ready tools for API providers to manage and monetize their endpoints",
    sections: [
      {
        title: "Webhook System",
        icon: Webhook,
        iconColor: "text-purple-600",
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
        iconColor: "text-amber-600",
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
        iconColor: "text-green-600",
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
      className: "border-gray-300 text-gray-700"
    },
    description: "🤖 PayGate x402 now supports AI agent integrations through Google Cloud's Agent Payments Protocol",
    sections: [
      {
        title: "AP2 Agent Support",
        icon: Users,
        iconColor: "text-blue-600",
        items: [
          "Support for AP2-Agent-ID and AP2-Mandate-Hash headers",
          "Enhanced 402 Payment Required responses with agent-parseable metadata", 
          "Structured endpoint information for automated integration discovery"
        ]
      },
      {
        title: "Cost Estimation API",
        icon: Zap,
        iconColor: "text-blue-600",
        items: [
          "GET /api/v1/pricing/estimate - Single endpoint cost estimation",
          "POST /api/v1/pricing/batch-estimate - Bulk cost estimation for agent planning",
          "Real-time pricing with network-aware cost calculations"
        ]
      },
      {
        title: "Platform Versioning & Capabilities",
        icon: Shield,
        iconColor: "text-green-600",
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
      className: "border-gray-300 text-gray-700"
    },
    description: "🚀 Complete x402 payment protocol implementation with comprehensive SaaS platform",
    sections: [
      {
        title: "Core Features",
        icon: Shield,
        iconColor: "text-blue-600",
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
        iconColor: "text-green-600",
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
  
  useSEO({
    title: 'Release Notes - Latest Updates & Features',
    description: 'View the latest PayGate x402 releases, features, and improvements. Track version history including x402 Directory, Provider Tools, AP2 compatibility, and more.',
    path: '/release-notes',
    keywords: 'release notes, changelog, updates, new features, PayGate roadmap, x402 protocol updates'
  });

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
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-3xl text-gray-900 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-blue-600" />
              Upcoming Features
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Features planned for future releases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ROADMAP_ITEMS.map((item, index) => (
                <div key={index} className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-4 flex-shrink-0 mt-1"></span>
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
      <Card className="bg-white border border-gray-200" data-testid={`release-${release.id}`}>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {release.badge && (
                <Badge 
                  variant={release.badge.variant}
                  className={release.badge.className}
                >
                  {release.badge.text === "Latest" && <Zap className="w-3 h-3 mr-1" />}
                  {release.badge.text}
                </Badge>
              )}
              <CardTitle className="text-3xl text-gray-900">Version {release.version}</CardTitle>
            </div>
            <span className="text-sm text-gray-500">{release.date}</span>
          </div>
          <CardDescription className="text-lg text-gray-600">
            {release.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {release.sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <section.icon className={`w-5 h-5 mr-3 ${section.iconColor}`} />
                {section.title}
              </h4>
              <ul className="space-y-3 ml-8">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className={`w-2 h-2 ${section.iconColor.replace('text-', 'bg-')} rounded-full mt-2 mr-4 flex-shrink-0`}></span>
                    <span className="text-gray-600 text-base leading-relaxed">
                      {item.includes('GET /') || item.includes('POST /') ? (
                        <>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-900 border border-gray-200">
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
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-base text-gray-600">
                <strong className="text-blue-700">Strategic Impact:</strong> {release.highlight.replace('Strategic Impact: ', '')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer" data-testid="logo-home">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PayGate x402</span>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-home">
              Home
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
              <a href="/docs" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-docs">Docs</a>
              <a href="/contact" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-contact">Contact</a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative">
        <div className="container mx-auto px-6 py-12">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
              Release Notes
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay up to date with the latest PayGate x402 features, improvements, and updates
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="flex gap-8 max-w-7xl mx-auto">
            {/* Left Sidebar - Version Navigation */}
            <div className="w-80 flex-shrink-0">
              <Card className="bg-white border border-gray-200 shadow-sm sticky top-8 h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-gray-900">Versions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 p-4">
                      {RELEASE_DATA.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedVersion(item.id)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                            selectedVersion === item.id
                              ? 'bg-blue-50 border border-blue-200 text-gray-900'
                              : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                          }`}
                          data-testid={`version-nav-${item.id}`}
                        >
                          <div>
                            {item.id === 'roadmap' ? (
                              <div>
                                <div className="font-medium">Roadmap</div>
                                <div className="text-xs text-gray-500">Upcoming Features</div>
                              </div>
                            ) : (
                              'type' in item ? null : (
                                <div>
                                  <div className="font-medium">v{(item as ReleaseData).version}</div>
                                  <div className="text-xs text-gray-500">{(item as ReleaseData).date}</div>
                                  {(item as ReleaseData).badge?.text === "Latest" && (
                                    <Badge 
                                      variant="secondary" 
                                      className="text-xs mt-1 bg-green-100 text-green-700 border-0"
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
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  data-testid="button-docs"
                >
                  ← Documentation
                </Button>
                <Button
                  onClick={() => window.location.href = "/contact"}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-contact"
                >
                  Contact Support →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer version="1.3.0" showVersion={true} />
    </div>
  );
}
