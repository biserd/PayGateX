import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, LogOut, User, Settings } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">PayGate 402</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <User className="w-3 h-3 mr-1" />
              {user?.email || user?.username || 'User'}
            </Badge>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" data-testid="button-dashboard">
                Dashboard
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="sm" data-testid="button-settings">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your API monetization platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/dashboard">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="card-dashboard">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                  Dashboard
                </CardTitle>
                <CardDescription>
                  View analytics, revenue metrics, and recent transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Monitor your API performance</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/endpoints">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="card-endpoints">
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  Manage your monetized API endpoints and pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Configure endpoints and rates</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/analytics">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="card-analytics">
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Deep dive into usage patterns and revenue trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Advanced reporting tools</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/escrow">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="card-escrow">
              <CardHeader>
                <CardTitle>Escrow</CardTitle>
                <CardDescription>
                  Manage pending payments and escrow holdings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Track payment releases</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/compliance">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="card-compliance">
              <CardHeader>
                <CardTitle>Compliance</CardTitle>
                <CardDescription>
                  Set up geo-blocking, IP filters, and wallet controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Regulatory compliance tools</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/settings">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid="card-settings">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure your account and platform preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Account management</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}