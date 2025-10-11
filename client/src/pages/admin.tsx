import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { MetricsCard } from "@/components/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, Globe, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { format } from "date-fns";

export default function AdminDashboard() {
  useSEO({
    title: "Admin Dashboard | PayGate x402",
    description: "Administrative dashboard for PayGate x402 platform monitoring and user management"
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/admin/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-background-light">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-6"></div>
            <div className="grid grid-cols-4 gap-6 mb-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <DashboardHeader
            title="Admin Dashboard"
            description="Platform-wide metrics and user activity monitoring"
          />
        </div>

        <main className="p-6 space-y-6">
          {/* User Metrics */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-user-metrics">User Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricsCard
                title="Total Users"
                value={metrics?.users.total.toString() || "0"}
                icon={<Users className="w-5 h-5" />}
                data-testid="card-total-users"
              />
              <MetricsCard
                title="New Users (7 days)"
                value={metrics?.users.newLast7Days.toString() || "0"}
                icon={<Users className="w-5 h-5" />}
                data-testid="card-new-users-7d"
              />
              <MetricsCard
                title="New Users (30 days)"
                value={metrics?.users.newLast30Days.toString() || "0"}
                icon={<Users className="w-5 h-5" />}
                data-testid="card-new-users-30d"
              />
            </div>
          </div>

          {/* Service & Endpoint Metrics */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-service-metrics">Service & Endpoint Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricsCard
                title="Total Services"
                value={`${metrics?.services.active || 0} / ${metrics?.services.total || 0}`}
                subtitle="Active / Total"
                icon={<Server className="w-5 h-5" />}
                data-testid="card-total-services"
              />
              <MetricsCard
                title="Total Endpoints"
                value={`${metrics?.endpoints.active || 0} / ${metrics?.endpoints.total || 0}`}
                subtitle="Active / Total"
                icon={<Globe className="w-5 h-5" />}
                data-testid="card-total-endpoints"
              />
              <MetricsCard
                title="New Services (7d)"
                value={metrics?.services.newLast7Days.toString() || "0"}
                icon={<Server className="w-5 h-5" />}
                data-testid="card-new-services-7d"
              />
              <MetricsCard
                title="New Endpoints (7d)"
                value={metrics?.endpoints.newLast7Days.toString() || "0"}
                icon={<Globe className="w-5 h-5" />}
                data-testid="card-new-endpoints-7d"
              />
            </div>
          </div>

          {/* Usage Metrics */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-usage-metrics">API Usage Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricsCard
                title="Total Requests"
                value={metrics?.usage.totalRequests.toLocaleString() || "0"}
                icon={<DollarSign className="w-5 h-5" />}
                data-testid="card-total-requests"
              />
              <MetricsCard
                title="Paid Requests"
                value={metrics?.usage.paidRequests.toLocaleString() || "0"}
                icon={<CheckCircle className="w-5 h-5" />}
                changeType="positive"
                data-testid="card-paid-requests"
              />
              <MetricsCard
                title="Free Requests"
                value={metrics?.usage.freeRequests.toLocaleString() || "0"}
                icon={<CheckCircle className="w-5 h-5" />}
                data-testid="card-free-requests"
              />
              <MetricsCard
                title="Total Revenue"
                value={`$${metrics?.usage.totalRevenue.toFixed(6) || "0.000000"}`}
                icon={<DollarSign className="w-5 h-5" />}
                changeType="positive"
                data-testid="card-total-revenue"
              />
            </div>
          </div>

          {/* User Activity Table */}
          <Card data-testid="card-user-activity">
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Registered users and their platform engagement</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        User
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Registered
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Services
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Endpoints
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        API Calls
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Last Activity
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {metrics?.userActivity && metrics.userActivity.length > 0 ? (
                      metrics.userActivity.map((user: any) => (
                        <tr key={user.email} data-testid={`user-row-${user.username}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-testid={`user-name-${user.username}`}>
                            {user.username}
                            {user.role === 'admin' && (
                              <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                                Admin
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-testid={`user-email-${user.username}`}>
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-testid={`user-registered-${user.username}`}>
                            {user.registeredAt ? format(new Date(user.registeredAt), 'MMM d, yyyy') : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-testid={`user-services-${user.username}`}>
                            {user.servicesCreated}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-testid={`user-endpoints-${user.username}`}>
                            {user.endpointsCreated}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-testid={`user-api-calls-${user.username}`}>
                            {user.totalApiCalls} <span className="text-gray-400 dark:text-gray-500">({user.paidRequests} paid)</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-testid={`user-last-activity-${user.username}`}>
                            {user.lastActivity ? format(new Date(user.lastActivity), 'MMM d, yyyy HH:mm') : 'Never'}
                          </td>
                          <td className="px-4 py-3 text-sm" data-testid={`user-status-${user.username}`}>
                            {user.isActive ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No users registered yet
                        </td>
                      </tr>
                    )}
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
