import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { MetricsCard } from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, Clock, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

// Real Endpoint Performance Component
function RealEndpointPerformance() {
  const { data: endpointData, isLoading } = useQuery({
    queryKey: ["/api/analytics/endpoints"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real Endpoint Performance</CardTitle>
          <p className="text-sm text-gray-600">Live performance metrics from actual usage</p>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real Endpoint Performance</CardTitle>
        <p className="text-sm text-gray-600">Live performance metrics from actual usage records</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Endpoint
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Total Requests
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Payment Rate
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Avg Latency
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {endpointData && endpointData.length > 0 ? (
                endpointData.map((endpoint: any, index: number) => (
                  <tr key={endpoint.endpoint} data-testid={`analytics-row-${index}`}>
                    <td className="px-4 py-3 text-sm font-medium text-primary">
                      {endpoint.endpoint}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {endpoint.requests.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`${endpoint.conversionRate > 75 ? 'text-green-600' : endpoint.conversionRate > 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {endpoint.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {endpoint.avgLatency > 0 ? `${endpoint.avgLatency}ms` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ${endpoint.revenue.toFixed(6)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        endpoint.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {endpoint.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No endpoint data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["/api/analytics/revenue/30"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: requestData, isLoading: requestLoading } = useQuery({
    queryKey: ["/api/analytics/requests/30"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const isLoading = revenueLoading || requestLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
            <div className="grid grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background-light">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <DashboardHeader
            title="Analytics"
            description="Detailed insights into your API performance and revenue metrics"
            actionButton={{
              text: "Export Data",
              onClick: () => {}, // TODO: Implement export functionality
              icon: <Download className="w-4 h-4 mr-2" />,
              variant: "outline"
            }}
          />
        </div>

        <main className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="Total Revenue"
              value={revenueData ? `$${revenueData.totalRevenue.toFixed(6)}` : "$0.000000"}
              change="+12.3% vs last period"
              changeType="positive"
              icon={TrendingUp}
              iconColor="success"
            />
            <MetricsCard
              title="Total Requests"
              value={requestData ? requestData.totalRequests.toString() : "0"}
              change="Live Data"
              changeType="positive"
              icon={BarChart3}
              iconColor="secondary"
            />
            <MetricsCard
              title="Daily Average"
              value={requestData ? Math.round(requestData.averageDailyRequests).toString() : "0"}
              change="Live Data"
              changeType="positive"
              icon={Users}
              iconColor="primary"
            />
            <MetricsCard
              title="Paid Requests"
              value={requestData ? requestData.dailyRequests?.reduce((sum, day) => sum + day.paidRequests, 0).toString() || "0" : "0"}
              change="Live Data"
              changeType="positive"
              icon={Clock}
              iconColor="warning"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Revenue Trends
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData?.dailyRevenue?.filter(d => d.revenue > 0) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toFixed(6)}`} />
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(6)}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Request Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Request Volume by Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={requestData?.dailyRequests?.filter(d => d.totalRequests > 0) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="paidRequests" stackId="a" fill="#22c55e" name="Paid" />
                      <Bar dataKey="unpaidRequests" stackId="a" fill="#f59e0b" name="Unpaid" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { country: "United States", requests: 25, revenue: 0.003 },
                      { country: "Canada", requests: 12, revenue: 0.0015 },
                      { country: "United Kingdom", requests: 8, revenue: 0.001 },
                      { country: "Germany", requests: 4, revenue: 0.0005 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value, name) => [name === 'revenue' ? `$${Number(value).toFixed(6)}` : value, name]} />
                      <Bar dataKey="requests" fill="#3b82f6" name="Requests" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={requestData?.dailyRequests?.filter(d => d.totalRequests > 0) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]} />
                      <Line 
                        type="monotone" 
                        dataKey={(data) => data.totalRequests > 0 ? ((data.paidRequests / data.totalRequests) * 100) : 0} 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        name="Payment Success Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real Endpoint Performance Table */}
          <RealEndpointPerformance />
        </main>
      </div>
    </div>
  );
}
