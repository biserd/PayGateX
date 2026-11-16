import { PublicHeader } from "@/components/public-header";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { 
  Search, 
  Filter, 
  Globe, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  ExternalLink,
  Zap,
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
  
  useSEO({
    title: 'Published x402 tools',
    description: 'Browse published PayGate402 tools and check their inputs, price, and connection details before making a call.',
    path: '/directory',
    keywords: 'x402 tools, payment-enabled APIs, USDC pricing, Base Sepolia, MCP'
  });

  // Fetch all services
  const { data: services = [], isLoading: servicesLoading, isError: servicesError, refetch: refetchServices } = useQuery<X402Service[]>({
    queryKey: ["/api/public/directory"],
    staleTime: 30_000,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/public/directory/categories"],
  });

  // Filter services
  const publishedServices = services.filter(service => service.isActive);
  const filteredServices = publishedServices.filter(service => {
    const matchesSearch = searchTerm === "" || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesNetwork = selectedNetwork === "all" || service.network === selectedNetwork;
    
    return matchesSearch && matchesCategory && matchesNetwork;
  });

  // Get unique networks (filter out nulls and ensure type safety)
  const networks = Array.from(new Set(services.map(s => s.network).filter((n): n is string => Boolean(n))));

  const formatPrice = (price: string | null) => {
    return price && Number(price) > 0 ? `${price} USDC` : "Free";
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
    <div className="min-h-screen bg-white text-gray-900">
      <PublicHeader />

      {/* Hero Section */}
      <div className="pt-12 pb-8 sm:pt-20 sm:pb-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="w-8 h-8 text-blue-600" />
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-gray-900">Published x402 tools</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Explore published tools and check their inputs and prices before you call them.
          </p>

          {/* Stats */}
          {publishedServices.length > 0 && <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{publishedServices.length}</div>
              <div className="text-sm text-gray-500">APIs Listed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{categories.length}</div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{networks.length}</div>
              <div className="text-sm text-gray-500">Networks</div>
            </div>
          </div>}
        </div>
      </div>

      {/* Search and Filters */}
      {publishedServices.length > 0 && <div className="pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search APIs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 text-gray-900"
                    data-testid="input-search"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 text-gray-900" data-testid="select-category">
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
                  <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 text-gray-900" data-testid="select-network">
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
      </div>}

      {/* Services Grid */}
      <div className="pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {servicesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading services...</p>
            </div>
          ) : servicesError && publishedServices.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-sm p-8 text-center">
              <h2 className="text-xl font-semibold">Couldn’t load published tools</h2>
              <Button className="mt-4" variant="outline" onClick={() => void refetchServices()}>Try again</Button>
            </Card>
          ) : publishedServices.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-sm p-8 text-center">
              <h2 className="text-xl font-semibold">No published tools yet</h2>
              <p className="mt-2 text-gray-600">The payment guide shows how to check a price, pay for a call, and get a receipt.</p>
              <Button asChild className="mt-4 bg-blue-700 hover:bg-blue-800"><a href="/docs/seller/buyer-payments">Read the payment guide</a></Button>
            </Card>
          ) : filteredServices.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-sm p-12 text-center">
              <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No services found matching your criteria.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <Card 
                  key={service.id} 
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
                  data-testid={`card-service-${service.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl text-gray-900">{service.name}</CardTitle>
                      {service.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
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
                      <Badge variant="outline" className="text-gray-600 border-gray-300">
                        {service.network || "base"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                      {service.description || "No description available"}
                    </CardDescription>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Price per call:
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                      
                      {service.responseTimeMs && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Response time:
                          </span>
                          <span className="text-gray-900">{service.responseTimeMs}ms</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-200">
                        <Button
                          asChild
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                          data-testid={`button-visit-${service.id}`}
                        >
                          <a href={service.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
                            Inspect API
                          </a>
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

      <Footer showAbout={true} footerText="Built with HTTP 402 protocol." version="1.3.0" showVersion={true} />
    </div>
  );
}
