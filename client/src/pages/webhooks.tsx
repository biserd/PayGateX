import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Webhook,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Copy,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  lastDelivery: string | null;
  failureCount: number;
  createdAt: string;
}

export default function Webhooks() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [newWebhook, setNewWebhook] = useState({
    url: "",
    events: ["payment.confirmed"]
  });

  const { data: webhooks = [], isLoading } = useQuery<WebhookEndpoint[]>({
    queryKey: ["/api/webhooks"],
  });

  const createMutation = useMutation({
    mutationFn: (webhook: { url: string; events: string[] }) =>
      apiRequest("POST", "/api/webhooks", webhook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsDialogOpen(false);
      setNewWebhook({ url: "", events: ["payment.confirmed"] });
      toast({
        title: "Webhook Created",
        description: "Your webhook endpoint has been successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/webhooks/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({
        title: "Webhook Updated",
        description: "Webhook status has been updated",
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/webhooks/${id}/test`, {});
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: data.success ? "Test Successful" : "Test Failed",
        description: data.success
          ? `Webhook delivered successfully (${data.attemptCount} ${data.attemptCount === 1 ? 'attempt' : 'attempts'})`
          : `Failed after ${data.attemptCount} attempts: ${data.error}`,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Webhook Test Failed",
        description: error.message || "Failed to send test webhook",
        variant: "destructive",
      });
    },
  });

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Copied!",
      description: "Webhook secret copied to clipboard",
    });
  };

  const availableEvents = [
    { value: "payment.confirmed", label: "Payment Confirmed" },
    { value: "payment.failed", label: "Payment Failed" },
    { value: "escrow.released", label: "Escrow Released" },
    { value: "escrow.refunded", label: "Escrow Refunded" },
    { value: "dispute.created", label: "Dispute Created" },
    { value: "dispute.resolved", label: "Dispute Resolved" },
  ];

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <DashboardHeader
            title="Webhooks"
            description="Manage webhook endpoints to receive real-time payment notifications"
            actionButton={{
              text: "Add Webhook",
              onClick: () => setIsDialogOpen(true),
              icon: <Plus className="w-4 h-4 mr-2" />,
            }}
          />

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading webhooks...</p>
            </div>
          ) : webhooks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Webhooks Configured</h3>
                <p className="text-gray-600 mb-4">
                  Add your first webhook endpoint to receive real-time payment notifications
                </p>
                <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-webhook">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                            {webhook.url}
                          </code>
                          {webhook.isActive ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Last delivery: {formatDate(webhook.lastDelivery)}
                          </span>
                          {webhook.failureCount > 0 && (
                            <Badge variant="destructive">
                              {webhook.failureCount} failures
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={webhook.isActive}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: webhook.id, isActive: checked })
                          }
                          data-testid={`switch-webhook-${webhook.id}`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Events</Label>
                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">Signing Secret</Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm bg-slate-100 px-3 py-2 rounded font-mono">
                            {showSecret[webhook.id] ? webhook.secret : "••••••••••••••••••••••••"}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setShowSecret((prev) => ({
                                ...prev,
                                [webhook.id]: !prev[webhook.id],
                              }))
                            }
                            data-testid={`button-toggle-secret-${webhook.id}`}
                          >
                            {showSecret[webhook.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copySecret(webhook.secret)}
                            data-testid={`button-copy-secret-${webhook.id}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testMutation.mutate(webhook.id)}
                          disabled={testMutation.isPending}
                          data-testid={`button-test-webhook-${webhook.id}`}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {testMutation.isPending ? "Sending..." : "Send Test Event"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent data-testid="dialog-create-webhook">
              <DialogHeader>
                <DialogTitle>Add Webhook Endpoint</DialogTitle>
                <DialogDescription>
                  Configure a new webhook endpoint to receive real-time event notifications
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="webhook-url">Endpoint URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://api.example.com/webhooks/paygate"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    data-testid="input-webhook-url"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The URL where webhook events will be sent
                  </p>
                </div>

                <div>
                  <Label className="mb-2 block">Events to Subscribe</Label>
                  <div className="space-y-2">
                    {availableEvents.map((event) => (
                      <div key={event.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={event.value}
                          checked={newWebhook.events.includes(event.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhook({
                                ...newWebhook,
                                events: [...newWebhook.events, event.value],
                              });
                            } else {
                              setNewWebhook({
                                ...newWebhook,
                                events: newWebhook.events.filter((e) => e !== event.value),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={event.value} className="font-normal cursor-pointer">
                          {event.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createMutation.mutate(newWebhook)}
                  disabled={!newWebhook.url || newWebhook.events.length === 0 || createMutation.isPending}
                  data-testid="button-create-webhook"
                >
                  {createMutation.isPending ? "Creating..." : "Create Webhook"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
