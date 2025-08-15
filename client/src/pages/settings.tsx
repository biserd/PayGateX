import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  };
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Mock settings data - in production this would come from the API
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    initialData: {
      id: "user_123",
      name: "David Miller",
      email: "david@example.com",
      company: "TechCorp Inc.",
      timezone: "America/New_York",
      notifications: {
        email: true,
        webhook: false,
        sms: false
      },
      security: {
        twoFactorEnabled: false,
        apiKeyRotationDays: 90
      },
      payment: {
        defaultNetwork: "base",
        escrowPeriodHours: 24,
        minimumPayment: "0.01"
      }
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<UserSettings>) => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (!response.ok) throw new Error("Update failed");
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
        ...settings?.notifications,
        [type]: enabled
      }
    });
  };

  const handleSecurityChange = (setting: string, value: any) => {
    updateSettingsMutation.mutate({
      security: {
        ...settings?.security,
        [setting]: value
      }
    });
  };

  const handlePaymentChange = (setting: string, value: any) => {
    updateSettingsMutation.mutate({
      payment: {
        ...settings?.payment,
        [setting]: value
      }
    });
  };

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your PayGate 402 account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            Security
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
                      defaultValue={settings?.name}
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={settings?.email}
                      data-testid="input-email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={settings?.company}
                    data-testid="input-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select name="timezone" defaultValue={settings?.timezone}>
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
                  checked={settings?.notifications.email}
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
                  checked={settings?.notifications.webhook}
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
                  checked={settings?.notifications.sms}
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
                  checked={settings?.security.twoFactorEnabled}
                  onCheckedChange={(checked) => handleSecurityChange("twoFactorEnabled", checked)}
                  data-testid="switch-2fa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-rotation">API Key Rotation (Days)</Label>
                <Select 
                  value={settings?.security.apiKeyRotationDays.toString()} 
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
                  value={settings?.payment.defaultNetwork} 
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
                  value={settings?.payment.escrowPeriodHours.toString()} 
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
                  value={settings?.payment.minimumPayment}
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
  );
}