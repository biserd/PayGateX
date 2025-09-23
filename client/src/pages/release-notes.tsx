import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Sparkles, Zap, Shield, Users, ChevronRight } from "lucide-react";

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
    id: "v1.1.0",
    version: "1.1.0",
    date: "September 21, 2025",
    title: "AP2 Agent Payments Protocol Compatibility",
    badge: {
      text: "Latest",
      variant: "secondary",
      className: "bg-green-500/20 text-green-300 border-green-500/30"
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
  "Enhanced AI Agent Discovery Protocol integration",
  "Multi-chain payment support expansion", 
  "Advanced analytics and reporting dashboard",
  "White-label deployment options"
];

export default function ReleaseNotes() {
  const [selectedVersion, setSelectedVersion] = useState("v1.1.0");

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
          <div className="flex gap-8 max-w-7xl mx-auto h-[calc(100vh-400px)]">
            {/* Left Sidebar - Version Navigation */}
            <div className="w-80 flex-shrink-0">
              <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm sticky top-8 h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white">Versions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-80">
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
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0 h-full flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="transition-all duration-300 ease-in-out pb-8">
                  {renderContent()}
                </div>
              </ScrollArea>
              
              {/* Navigation Links */}
              <div className="flex justify-center space-x-4 pt-6 pb-2">
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
    </div>
  );
}