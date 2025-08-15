import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lock, 
  Clock, 
  DollarSign, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

export default function Escrow() {
  const { data: escrowData, isLoading } = useQuery({
    queryKey: ["/api/escrow"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { holdings = [], summary = { pendingAmount: "0", releasedToday: "0", totalRefunds: "0" } } = escrowData || {};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "released":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "refunded":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "released":
        return "success";
      case "refunded":
        return "error";
      default:
        return "warning";
    }
  };

  const formatTimeRemaining = (releaseAt: string | null) => {
    if (!releaseAt) return "N/A";
    const now = new Date();
    const release = new Date(releaseAt);
    const diffInHours = Math.max(0, Math.floor((release.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    if (diffInHours === 0) return "Ready for release";
    if (diffInHours < 24) return `${diffInHours}h remaining`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ${diffInHours % 24}h remaining`;
  };

  const totalPending = parseFloat(summary.pendingAmount);
  const totalReleased = parseFloat(summary.releasedToday);
  const totalRefunds = parseFloat(summary.totalRefunds);
  const totalEscrow = totalPending + totalReleased + totalRefunds;
  const releasePercentage = totalEscrow > 0 ? ((totalReleased / totalEscrow) * 100) : 0;

  return (
    <div className="min-h-screen flex bg-background-light">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Escrow System</h1>
              <p className="text-gray-600 mt-1">Manage payment escrow and automatic releases</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-success/10 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm font-medium text-success">24h Auto-Release</span>
              </div>
              <Button variant="outline" data-testid="force-release-button">
                <RefreshCw className="w-4 h-4 mr-2" />
                Force Release
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Escrow</CardTitle>
                <Lock className="w-4 h-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning" data-testid="pending-escrow-amount">
                  ${summary.pendingAmount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting 24h release window
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Released Today</CardTitle>
                <CheckCircle className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success" data-testid="released-today-amount">
                  ${summary.releasedToday}
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatically released funds
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
                <XCircle className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive" data-testid="total-refunds-amount">
                  ${summary.totalRefunds}
                </div>
                <p className="text-xs text-muted-foreground">
                  Failed transaction refunds
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Escrow Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Escrow Overview
                <div className="text-sm font-normal text-muted-foreground">
                  {releasePercentage.toFixed(1)}% released
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={releasePercentage} className="h-3" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <div className="text-lg font-semibold text-warning">${summary.pendingAmount}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Released</div>
                  <div className="text-lg font-semibold text-success">${summary.releasedToday}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Refunded</div>
                  <div className="text-lg font-semibold text-destructive">${summary.totalRefunds}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Holdings */}
          <Card>
            <CardHeader>
              <CardTitle>Escrow Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {holdings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No escrow holdings found</p>
                  <p className="text-sm">Funds will appear here when payments are processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {holdings.map((holding: any) => (
                    <div 
                      key={holding.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      data-testid={`escrow-holding-${holding.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                          {getStatusIcon(holding.status)}
                        </div>
                        <div>
                          <div className="font-medium" data-testid={`holding-amount-${holding.id}`}>
                            ${holding.amount} {holding.currency}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Created {new Date(holding.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <Badge 
                          variant={holding.status === "released" ? "default" : "secondary"}
                          className={`status-badge ${getStatusColor(holding.status)}`}
                          data-testid={`holding-status-${holding.id}`}
                        >
                          {holding.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeRemaining(holding.releaseAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Escrow Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Escrow Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-Release Period</div>
                  <div className="text-sm text-muted-foreground">
                    Time before funds are automatically released
                  </div>
                </div>
                <div className="text-sm font-medium">24 hours</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Manual Release</div>
                  <div className="text-sm text-muted-foreground">
                    Allow manual release before 24h period
                  </div>
                </div>
                <Button variant="outline" size="sm" data-testid="manual-release-toggle">
                  Enabled
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Refund Policy</div>
                  <div className="text-sm text-muted-foreground">
                    Automatic refunds for failed transactions
                  </div>
                </div>
                <div className="text-sm font-medium">Enabled</div>
              </div>
            </CardContent>
          </Card>

          {/* Escrow History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Escrow Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg" data-testid="escrow-activity-1">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <div>
                      <div className="text-sm font-medium">$127.45 USDC released</div>
                      <div className="text-xs text-muted-foreground">24-hour auto-release completed</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg" data-testid="escrow-activity-2">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-warning" />
                    <div>
                      <div className="text-sm font-medium">$89.23 USDC in escrow</div>
                      <div className="text-xs text-muted-foreground">Pending release in 18 hours</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">6 hours ago</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg" data-testid="escrow-activity-3">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <div>
                      <div className="text-sm font-medium">$5.67 USDC refunded</div>
                      <div className="text-xs text-muted-foreground">Transaction verification failed</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">1 day ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
