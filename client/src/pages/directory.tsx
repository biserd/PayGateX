import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Globe, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Zap,
  Menu,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { X402Service } from "@shared/schema";

export default function Directory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch all services
  const { data: services = [], isLoading: servicesLoading } = useQuery<X402Service[]>({
    queryKey: ["/api/public/directory"],
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/public/directory/categories"],
  });

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === "" || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesNetwork = selectedNetwork === "all" || service.network === selectedNetwork;
    
    return matchesSearch && matchesCategory && matchesNetwork && service.isActive;
  });

  // Get unique networks (filter out nulls and ensure type safety)
  const networks = Array.from(new Set(services.map(s => s.network).filter((n): n is string => Boolean(n))));

  const formatPrice = (price: string | null) => {
    if (!price) return "Free";
    const num = parseFloat(price);
    if (num === 0) return "Free";
    if (num < 0.01) return `$${num.toFixed(6)}`;
    return `$${num.toFixed(2)}`;
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-gray-500";
    const colors: Record<string, string> = {
      "AI": "bg-purple-500",
      "Weather": "bg-blue-500",
      "Finance": "bg-green-500",
      "Data": "bg-orange-500",
      "Media": "bg-pink-500",
      "News": "bg-red-500",
      "Other": "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
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
      <header className="relative border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl blur opacity-50 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                x402 Directory
              </h1>
              <p className="text-xs text-gray-400 font-medium hidden sm:block">Discover Payment-Enabled APIs</p>
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
              onClick={() => window.location.href = "/docs"}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              data-testid="nav-docs"
            >
              Docs
            </Button>
            <Button
              onClick={() => window.location.href = "/auth"}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
                onClick={() => { window.location.href = "/docs"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                data-testid="mobile-nav-docs"
              >
                Docs
              </button>
              <Button
                onClick={() => window.location.href = "/auth"}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600"
                data-testid="mobile-button-login"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative pt-12 pb-8 sm:pt-20 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="w-8 h-8 text-cyan-400" />
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
            Discover x402 APIs
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            The first public directory of payment-enabled APIs. Find, explore, and integrate blockchain-powered services.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{services.length}</div>
              <div className="text-sm text-gray-400">APIs Listed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{categories.length}</div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{networks.length}</div>
              <div className="text-sm text-gray-400">Networks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search APIs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-white/10 text-white"
                    data-testid="input-search"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white" data-testid="select-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Network Filter */}
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white" data-testid="select-network">
                    <SelectValue placeholder="All Networks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Networks</SelectItem>
                    {networks.map(net => (
                      <SelectItem key={net} value={net}>{net}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Services Grid */}
      <div className="relative pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {servicesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl p-12 text-center">
              <XCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No services found matching your criteria.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <Card 
                  key={service.id} 
                  className="bg-slate-900/50 border-white/10 backdrop-blur-xl hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10"
                  data-testid={`card-service-${service.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl text-white">{service.name}</CardTitle>
                      {service.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {service.category && (
                        <Badge className={`${getCategoryColor(service.category)} text-white`}>
                          {service.category}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-gray-300 border-gray-600">
                        {service.network || "base"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 mb-4 line-clamp-3">
                      {service.description || "No description available"}
                    </CardDescription>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Price per call:
                        </span>
                        <span className="text-white font-semibold">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                      
                      {service.responseTimeMs && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Response time:
                          </span>
                          <span className="text-white">{service.responseTimeMs}ms</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-white/10">
                        <Button
                          onClick={() => window.open(service.url, '_blank')}
                          className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
                          data-testid={`button-visit-${service.id}`}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit API
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-slate-900/50 backdrop-blur-xl py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-400">
            Part of the <span className="text-violet-400 font-semibold">PayGate x402</span> ecosystem
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Data refreshed hourly from Bazaar and x402 Index
          </p>
        </div>
      </footer>
    </div>
  );
}
