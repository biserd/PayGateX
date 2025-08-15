import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { MetricsCard } from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";

export default function Analytics() {
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["/api/analytics/revenue", "30"],
  });

  const { data: requestData, isLoading: requestLoading } = useQuery({
    queryKey: ["/api/analytics/requests", "30"],
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
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Analytics</h1>
              <p className="text-gray-600 mt-1">Detailed insights into your API performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select defaultValue="30">
                <SelectTrigger className="w-40" data-testid="time-period-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="Total Revenue"
              value="$2,847.32"
              change="+12.3% vs last period"
              changeType="positive"
              icon={TrendingUp}
              iconColor="success"
            />
            <MetricsCard
              title="Requests/Day"
              value="4,151"
              change="+8.7% vs last period"
              changeType="positive"
              icon={BarChart3}
              iconColor="secondary"
            />
            <MetricsCard
              title="Unique Clients"
              value="1,234"
              change="+15.2% vs last period"
              changeType="positive"
              icon={Users}
              iconColor="primary"
            />
            <MetricsCard
              title="Avg Response Time"
              value="145ms"
              change="-5.3% vs last period"
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
                <div className="h-80 bg-gradient-to-br from-success/5 to-secondary/5 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Revenue trend chart</p>
                    <p className="text-xs text-gray-400 mt-1">Implementation: Line chart with daily revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Request Volume by Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-primary/5 to-warning/5 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Request volume chart</p>
                    <p className="text-xs text-gray-400 mt-1">Implementation: Bar chart by endpoint</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-chart-1/5 to-chart-2/5 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Geographic heatmap</p>
                    <p className="text-xs text-gray-400 mt-1">Implementation: World map with request density</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-chart-3/5 to-chart-4/5 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Payment success metrics</p>
                    <p className="text-xs text-gray-400 mt-1">Implementation: Donut chart with success/failure rates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Performance</CardTitle>
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
                        Success Rate
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Avg Response Time
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr data-testid="analytics-row-weather">
                      <td className="px-4 py-3 text-sm font-medium text-primary">/api/v1/weather</td>
                      <td className="px-4 py-3 text-sm">45,234</td>
                      <td className="px-4 py-3 text-sm text-success">98.7%</td>
                      <td className="px-4 py-3 text-sm">123ms</td>
                      <td className="px-4 py-3 text-sm font-medium">$45.23</td>
                    </tr>
                    <tr data-testid="analytics-row-ai-chat">
                      <td className="px-4 py-3 text-sm font-medium text-primary">/api/v1/ai-chat</td>
                      <td className="px-4 py-3 text-sm">23,567</td>
                      <td className="px-4 py-3 text-sm text-success">97.2%</td>
                      <td className="px-4 py-3 text-sm">1,247ms</td>
                      <td className="px-4 py-3 text-sm font-medium">$235.67</td>
                    </tr>
                    <tr data-testid="analytics-row-translate">
                      <td className="px-4 py-3 text-sm font-medium text-primary">/api/v1/translate</td>
                      <td className="px-4 py-3 text-sm">12,345</td>
                      <td className="px-4 py-3 text-sm text-warning">89.3%</td>
                      <td className="px-4 py-3 text-sm">567ms</td>
                      <td className="px-4 py-3 text-sm font-medium">$61.73</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
