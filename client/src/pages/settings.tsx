import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Globe, 
  Key,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface UserSettings {
  id: string;
  name: string;
  email: string;
  company?: string;
  timezone: string;
  notifications: {
    email: boolean;
    webhook: boolean;
    sms: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    apiKeyRotationDays: number;
  };
  payment: {
    defaultNetwork: string;
    escrowPeriodHours: number;
    minimumPayment: string;
    payoutWalletMainnet?: string;
    payoutWalletTestnet?: string;
  };
}

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Get real user settings from API with default values
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Provide default values to prevent TypeScript errors
  const safeSettings: UserSettings = {
    id: settings?.id || "",
    name: settings?.name || user?.username || "",
    email: settings?.email || user?.email || "",
    company: settings?.company || "",
    timezone: settings?.timezone || "America/New_York",
    notifications: {
      email: settings?.notifications?.email ?? true,
      webhook: settings?.notifications?.webhook ?? false,
      sms: settings?.notifications?.sms ?? false,
    },
    security: {
      twoFactorEnabled: settings?.security?.twoFactorEnabled ?? false,
      apiKeyRotationDays: settings?.security?.apiKeyRotationDays ?? 30,
    },
    payment: {
      defaultNetwork: settings?.payment?.defaultNetwork ?? "base",
      escrowPeriodHours: settings?.payment?.escrowPeriodHours ?? 24,
      minimumPayment: settings?.payment?.minimumPayment ?? "0.01",
      payoutWalletMainnet: settings?.payment?.payoutWalletMainnet ?? "",
      payoutWalletTestnet: settings?.payment?.payoutWalletTestnet ?? "",
    }
  };

  // Get sandbox mode from organization API
  const { data: sandboxData, isLoading: sandboxLoading } = useQuery({
    queryKey: ["/api/organization/sandbox"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<UserSettings>) => {
      console.log("Sending settings update:", updatedSettings);
      const response = await apiRequest("PATCH", "/api/settings", updatedSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully."
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Sandbox mode mutation
  const updateSandboxMutation = useMutation({
    mutationFn: async (sandboxMode: boolean) => {
      const response = await apiRequest("PUT", "/api/organization/sandbox", { sandboxMode });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization/sandbox"] });
      toast({
        title: "Sandbox mode updated",
        description: `Switched to ${data.sandboxMode ? 'testing' : 'production'} mode successfully.`
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update sandbox mode. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const profileData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      timezone: formData.get("timezone") as string,
    };
    updateSettingsMutation.mutate(profileData);
  };

  const handleNotificationChange = (type: string, enabled: boolean) => {
    updateSettingsMutation.mutate({
      notifications: {
        ...safeSettings.notifications,
        [type]: enabled
      }
    });
  };

  const handleSecurityChange = (setting: string, value: any) => {
    updateSettingsMutation.mutate({
      security: {
        ...safeSettings.security,
        [setting]: value
      }
    });
  };

  const handlePaymentChange = (setting: string, value: any) => {
    updateSettingsMutation.mutate({
      payment: {
        ...safeSettings.payment,
        [setting]: value
      }
    });
  };

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen flex bg-background-light">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your PayGate x402 account settings and preferences
            </p>
          </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization" data-testid="tab-organization">
            <Globe className="w-4 h-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">
            <Key className="w-4 h-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="payment" data-testid="tab-payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={user?.username || ""}
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={user?.email || ""}
                      data-testid="input-email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={safeSettings.company}
                    placeholder="Company name (optional)"
                    data-testid="input-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select name="timezone" defaultValue={safeSettings.timezone}>
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  disabled={updateSettingsMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization details and billing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    defaultValue="Demo Organization"
                    data-testid="input-org-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-slug">Organization ID</Label>
                  <Input
                    id="org-slug"
                    defaultValue="demo-org-1"
                    disabled
                    data-testid="input-org-slug"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="org-description">Description</Label>
                <Textarea
                  id="org-description"
                  placeholder="Brief description of your organization"
                  defaultValue="Demo organization for API monetization platform"
                  data-testid="input-org-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="free-tier-limit">Free Tier Limit</Label>
                  <Input
                    id="free-tier-limit"
                    type="number"
                    defaultValue="100"
                    data-testid="input-free-tier-limit"
                  />
                  <p className="text-xs text-gray-500">Requests per month per endpoint</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escrow-period">Escrow Period (hours)</Label>
                  <Input
                    id="escrow-period"
                    type="number"
                    defaultValue="24"
                    data-testid="input-escrow-period"
                  />
                  <p className="text-xs text-gray-500">Payment hold period</p>
                </div>
              </div>

              <Button data-testid="button-save-organization">
                Save Organization Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization's operational settings and environment configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Sandbox Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      {(sandboxData?.sandboxMode ?? true)
                        ? "Currently in testing mode - using simulated payments for development"
                        : "Currently in production mode - processing real blockchain transactions"
                      }
                    </p>
                  </div>
                  <Switch
                    checked={sandboxData?.sandboxMode ?? true}
                    onCheckedChange={(checked) => updateSandboxMutation.mutate(checked)}
                    disabled={updateSandboxMutation.isPending || sandboxLoading}
                    data-testid="sandbox-toggle"
                  />
                </div>
                
                <Alert className={(sandboxData?.sandboxMode ?? true) ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {(sandboxData?.sandboxMode ?? true) ? (
                      <span>
                        <strong>Testing Mode:</strong> All payments are simulated. Use the payment simulation endpoint to generate test transactions. Perfect for development and testing.
                      </span>
                    ) : (
                      <span>
                        <strong>Production Mode:</strong> Real USDC transactions on Base network are required. Users must make actual blockchain payments to access your APIs.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Configuration</CardTitle>
              <CardDescription>
                Manage your API services and their settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Demo Service</h4>
                    <p className="text-sm text-gray-500">Primary API service</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-name">Service Name</Label>
                    <Input
                      id="service-name"
                      defaultValue="Demo Service"
                      data-testid="input-service-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-slug">Service Slug</Label>
                    <Input
                      id="service-slug"
                      defaultValue="demo-service-1"
                      disabled
                      data-testid="input-service-slug"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input
                    id="base-url"
                    placeholder="https://api.example.com"
                    defaultValue="https://httpbin.org"
                    data-testid="input-base-url"
                  />
                  <p className="text-xs text-gray-500">Default base URL for this service's endpoints</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="health-check">Health Check Path</Label>
                  <Input
                    id="health-check"
                    placeholder="/health"
                    defaultValue="/status"
                    data-testid="input-health-check"
                  />
                  <p className="text-xs text-gray-500">Path for monitoring service health</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="service-active" defaultChecked data-testid="switch-service-active" />
                  <Label htmlFor="service-active">Service Active</Label>
                </div>
              </div>

              <Button data-testid="button-save-service">
                Save Service Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive payment alerts and system updates via email
                  </p>
                </div>
                <Switch
                  checked={safeSettings.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                  data-testid="switch-email-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Webhook Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send real-time notifications to your webhook endpoint
                  </p>
                </div>
                <Switch
                  checked={safeSettings.notifications.webhook}
                  onCheckedChange={(checked) => handleNotificationChange("webhook", checked)}
                  data-testid="switch-webhook-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get critical alerts via SMS (charges may apply)
                  </p>
                </div>
                <Switch
                  checked={safeSettings.notifications.sms}
                  onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                  data-testid="switch-sms-notifications"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure webhook endpoints for real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-api.com/webhooks/paygate"
                  data-testid="input-webhook-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Webhook Secret</Label>
                <Input
                  id="webhook-secret"
                  type="password"
                  placeholder="Enter a secret key for webhook verification"
                  data-testid="input-webhook-secret"
                />
              </div>
              <Button data-testid="button-test-webhook">Test Webhook</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and API access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={safeSettings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => handleSecurityChange("twoFactorEnabled", checked)}
                  data-testid="switch-2fa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-rotation">API Key Rotation (Days)</Label>
                <Select 
                  value={safeSettings.security.apiKeyRotationDays.toString()} 
                  onValueChange={(value) => handleSecurityChange("apiKeyRotationDays", parseInt(value))}
                >
                  <SelectTrigger data-testid="select-api-rotation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Automatically rotate API keys for enhanced security
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your PayGate 402 API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Key className="w-4 h-4" />
                <AlertDescription>
                  Keep your API keys secure. Never share them publicly or commit them to version control.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label>Production API Key</Label>
                <div className="flex space-x-2">
                  <Input 
                    value="pg_live_••••••••••••••••••••••••••••••••••••••••"
                    readOnly
                    data-testid="input-api-key-prod"
                  />
                  <Button variant="outline" data-testid="button-regenerate-prod">Regenerate</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Test API Key</Label>
                <div className="flex space-x-2">
                  <Input 
                    value="pg_test_••••••••••••••••••••••••••••••••••••••••"
                    readOnly
                    data-testid="input-api-key-test"
                  />
                  <Button variant="outline" data-testid="button-regenerate-test">Regenerate</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
              <CardDescription>
                Configure payment processing and escrow settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-network">Default Payment Network</Label>
                <Select 
                  value={safeSettings.payment.defaultNetwork} 
                  onValueChange={(value) => handlePaymentChange("defaultNetwork", value)}
                >
                  <SelectTrigger data-testid="select-payment-network">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base">Base (Recommended)</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Default network for new API endpoints
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escrow-period">Escrow Period (Hours)</Label>
                <Select 
                  value={safeSettings.payment.escrowPeriodHours.toString()} 
                  onValueChange={(value) => handlePaymentChange("escrowPeriodHours", parseInt(value))}
                >
                  <SelectTrigger data-testid="select-escrow-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="24">24 hours (Recommended)</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long to hold payments in escrow before release
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum-payment">Minimum Payment (USDC)</Label>
                <Input
                  id="minimum-payment"
                  value={safeSettings.payment.minimumPayment}
                  onChange={(e) => handlePaymentChange("minimumPayment", e.target.value)}
                  data-testid="input-minimum-payment"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum amount required for API access
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Payout Wallets</CardTitle>
              <CardDescription>
                Configure where you want to receive your API revenue payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CreditCard className="w-4 h-4" />
                <AlertDescription>
                  PayGate automatically distributes your API revenue (85-95% share) to these wallet addresses after the escrow period.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="payout-wallet-mainnet">Production Payout Wallet (Base Mainnet)</Label>
                <Input
                  id="payout-wallet-mainnet"
                  placeholder="0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0"
                  value={safeSettings.payment.payoutWalletMainnet || ""}
                  onChange={(e) => handlePaymentChange("payoutWalletMainnet", e.target.value)}
                  data-testid="input-payout-wallet-mainnet"
                />
                <p className="text-sm text-muted-foreground">
                  Your USDC will be sent here for production API calls (Base mainnet)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payout-wallet-testnet">Sandbox Payout Wallet (Base Sepolia)</Label>
                <Input
                  id="payout-wallet-testnet"
                  placeholder="0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0"
                  value={safeSettings.payment.payoutWalletTestnet || ""}
                  onChange={(e) => handlePaymentChange("payoutWalletTestnet", e.target.value)}
                  data-testid="input-payout-wallet-testnet"
                />
                <p className="text-sm text-muted-foreground">
                  Test USDC will be sent here for sandbox API calls (Base Sepolia testnet)
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How Payouts Work:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• PayGate collects payments from API users</li>
                  <li>• Revenue is held in escrow for 24 hours (configurable above)</li>
                  <li>• After escrow period, 85-95% is automatically sent to your wallet</li>
                  <li>• PayGate keeps 5-15% as platform fee</li>
                  <li>• All transactions are recorded in the analytics dashboard</li>
                </ul>
              </div>
              
              <Button data-testid="button-save-payout-wallets">Save Payout Configuration</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coinbase Integration</CardTitle>
              <CardDescription>
                Configure your Coinbase facilitator settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coinbase-key">Coinbase API Key</Label>
                <Input
                  id="coinbase-key"
                  type="password"
                  placeholder="Enter your Coinbase API key"
                  data-testid="input-coinbase-key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facilitator-url">Facilitator URL</Label>
                <Input
                  id="facilitator-url"
                  defaultValue="https://facilitator.coinbase.com"
                  data-testid="input-facilitator-url"
                />
              </div>
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  Currently using mock payment processor for development. Switch to production mode to enable real payments.
                </AlertDescription>
              </Alert>
              <Button data-testid="button-test-connection">Test Connection</Button>
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}