import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { MetricsCard } from "@/components/metrics-card";
import { TransactionList } from "@/components/transaction-list";
import { ComplianceControls } from "@/components/compliance-controls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  BarChart3, 
  CreditCard, 
  Server, 
  Plus,
  Activity,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/summary"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    totalRevenue = "0",
    totalRequests = 0,
    totalPaidRequests = 0,
    activeEndpoints = 0,
    escrow = { pendingAmount: "0", releasedToday: "0", totalRefunds: "0" },
    recentTransactions = []
  } = dashboardData || {};

  const paymentRate = totalRequests > 0 ? ((totalPaidRequests / totalRequests) * 100).toFixed(1) : "0";
  const escrowReleaseRate = parseFloat(escrow.releasedToday) > 0 ? 89.3 : 0;

  return (
    <div className="min-h-screen flex bg-background-light">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your API monetization performance</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* x402 Protocol Status */}
              <div className="flex items-center space-x-2 bg-success/10 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm font-medium text-success">x402 Active</span>
              </div>
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
              <Button data-testid="add-endpoint-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Endpoint
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="Total Revenue"
              value={`$${totalRevenue}`}
              change="+12.3% vs last month"
              changeType="positive"
              icon={DollarSign}
              iconColor="success"
            />
            <MetricsCard
              title="API Requests"
              value={totalRequests.toLocaleString()}
              change="+8.7% vs last month"
              changeType="positive"
              icon={BarChart3}
              iconColor="secondary"
            />
            <MetricsCard
              title="Paid Requests"
              value={totalPaidRequests.toLocaleString()}
              change={`${paymentRate}% payment rate`}
              changeType="positive"
              icon={CreditCard}
              iconColor="primary"
            />
            <MetricsCard
              title="Active Endpoints"
              value={activeEndpoints}
              change="All operational"
              changeType="neutral"
              icon={Server}
              iconColor="warning"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Revenue Overview</h3>
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-secondary focus:border-transparent">
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <div className="h-64 bg-gradient-to-br from-secondary/5 to-success/5 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Revenue chart visualization</p>
                </div>
              </div>
            </div>

            {/* Request Analytics */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Request Analytics</h3>
                <div className="flex space-x-2">
                  <Badge variant="default">Paid</Badge>
                  <Badge variant="outline">All</Badge>
                </div>
              </div>
              <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Request analytics visualization</p>
                </div>
              </div>
            </div>
          </div>

          {/* x402 Protocol & Escrow Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* x402 Integration Status */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">x402 Protocol Status</h3>
                <div className="flex items-center space-x-2 bg-success/10 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium text-success">Connected</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Facilitator Server</span>
                  <span className="text-sm font-medium text-primary">Coinbase CDP</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Network</span>
                  <span className="text-sm font-medium text-primary">Base Mainnet</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Payment Asset</span>
                  <span className="text-sm font-medium text-primary">USDC</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Settlement Time</span>
                  <span className="text-sm font-medium text-success">~2 seconds</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Proxy Endpoint</div>
                  <code className="text-xs font-mono text-primary bg-white px-2 py-1 rounded border">
                    https://proxy.paygate402.com/your-api
                  </code>
                </div>
              </div>
            </div>

            {/* Escrow System */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Escrow System</h3>
                <span className="text-sm text-gray-500">24h auto-release</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Escrow</span>
                  <span className="text-sm font-bold text-warning" data-testid="pending-escrow">
                    ${escrow.pendingAmount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Released Today</span>
                  <span className="text-sm font-medium text-success" data-testid="released-today">
                    ${escrow.releasedToday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Refunds</span>
                  <span className="text-sm font-medium text-gray-500" data-testid="total-refunds">
                    ${escrow.totalRefunds}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Escrow Balance</span>
                  <span>{escrowReleaseRate}% released</span>
                </div>
                <Progress value={escrowReleaseRate} className="h-2" />
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4" 
                size="sm"
                data-testid="view-escrow-details"
              >
                View Escrow Details
              </Button>
            </div>
          </div>

          {/* Compliance Controls */}
          <ComplianceControls />

          {/* Recent Transactions */}
          <TransactionList transactions={recentTransactions} />
        </main>
      </div>
    </div>
  );
}
