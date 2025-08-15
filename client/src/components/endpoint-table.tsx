import { Endpoint } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, BarChart3, Settings, Plug, Bot, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface EndpointWithAnalytics extends Endpoint {
  metrics: {
    requestsToday: number;
    totalRevenue: string;
    conversionRate: string;
    status: string;
  };
  pricing: {
    price: string;
    currency: string;
    network: string;
  } | null;
}

interface EndpointTableProps {
  endpoints: EndpointWithAnalytics[];
  onEdit?: (endpoint: EndpointWithAnalytics) => void;
  onViewAnalytics?: (endpoint: EndpointWithAnalytics) => void;
  onSettings?: (endpoint: EndpointWithAnalytics) => void;
}

export function EndpointTable({ endpoints, onEdit, onViewAnalytics, onSettings }: EndpointTableProps) {
  const getEndpointIcon = (path: string) => {
    if (path.includes("ai") || path.includes("chat")) return Bot;
    if (path.includes("translate")) return Pause;
    return Plug;
  };

  const getIconColor = (isActive: boolean) => {
    if (!isActive) return "text-warning bg-warning/10";
    return "text-success bg-success/10";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">API Endpoints</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search endpoints..." 
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:border-transparent"
                data-testid="search-endpoints"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            <Button variant="outline" size="sm" data-testid="filter-endpoints">
              Filter
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endpoint
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requests (24h)
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {endpoints.map((endpoint) => {
              const IconComponent = getEndpointIcon(endpoint.path);
              return (
                <tr 
                  key={endpoint.id} 
                  className="hover:bg-gray-50 transition-colors"
                  data-testid={`endpoint-row-${endpoint.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                        getIconColor(endpoint.isActive)
                      )}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-primary" data-testid={`endpoint-path-${endpoint.id}`}>
                          {endpoint.path}
                        </div>
                        <div className="text-xs text-gray-500">{endpoint.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-medium text-primary" data-testid={`endpoint-price-${endpoint.id}`}>
                      ${endpoint.pricing?.price || '0.001'}
                    </span>
                    <div className="text-xs text-gray-500">per request</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-primary" data-testid={`endpoint-requests-${endpoint.id}`}>
                      {endpoint.metrics.requestsToday}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-primary" data-testid={`endpoint-revenue-${endpoint.id}`}>
                      ${endpoint.metrics.totalRevenue}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={endpoint.isActive ? "default" : "secondary"}
                      className={cn(
                        "status-badge",
                        endpoint.isActive ? "success" : "warning"
                      )}
                      data-testid={`endpoint-status-${endpoint.id}`}
                    >
                      {endpoint.isActive ? "Active" : "Paused"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(endpoint)}
                        data-testid={`edit-endpoint-${endpoint.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewAnalytics?.(endpoint)}
                        data-testid={`analytics-endpoint-${endpoint.id}`}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSettings?.(endpoint)}
                        data-testid={`settings-endpoint-${endpoint.id}`}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
