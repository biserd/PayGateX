import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { ComplianceControls } from "@/components/compliance-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Globe, Wallet, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Compliance() {
  const [isAddRuleDialogOpen, setIsAddRuleDialogOpen] = useState(false);
  const [newRuleType, setNewRuleType] = useState<string>("");
  const [newRuleData, setNewRuleData] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: complianceRules, isLoading } = useQuery({
    queryKey: ["/api/compliance/rules"],
  });

  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: { type: string; rules: any; isActive: boolean }) => {
      const response = await apiRequest("POST", "/api/compliance/rules", ruleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/rules"] });
      setIsAddRuleDialogOpen(false);
      setNewRuleType("");
      setNewRuleData("");
      toast({
        title: "Success",
        description: "Compliance rule created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create compliance rule",
        variant: "destructive",
      });
    },
  });

  const handleCreateRule = () => {
    if (!newRuleType || !newRuleData) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    let rules;
    try {
      if (newRuleType === "geo_block") {
        rules = { countries: newRuleData.split(",").map(c => c.trim()) };
      } else if (newRuleType === "wallet_allow" || newRuleType === "wallet_deny") {
        rules = { addresses: newRuleData.split(",").map(a => a.trim()) };
      } else {
        rules = JSON.parse(newRuleData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid rule data format",
        variant: "destructive",
      });
      return;
    }

    createRuleMutation.mutate({
      type: newRuleType,
      rules,
      isActive: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
            <div className="space-y-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
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
            title="Compliance"
            description="Manage access controls and regulatory compliance"
            actionButton={{
              text: "Add Rule",
              onClick: () => setIsAddRuleDialogOpen(true),
              icon: <Plus className="w-4 h-4 mr-2" />,
            }}
          />
        </div>

        <Dialog open={isAddRuleDialogOpen} onOpenChange={setIsAddRuleDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Compliance Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-type">Rule Type</Label>
                    <Select value={newRuleType} onValueChange={setNewRuleType}>
                      <SelectTrigger data-testid="rule-type-select">
                        <SelectValue placeholder="Select rule type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geo_block">Geographic Blocking</SelectItem>
                        <SelectItem value="wallet_allow">Wallet Allow List</SelectItem>
                        <SelectItem value="wallet_deny">Wallet Deny List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rule-data">Rule Data</Label>
                    <Textarea
                      id="rule-data"
                      placeholder={
                        newRuleType === "geo_block" 
                          ? "Enter country codes separated by commas (e.g., CN, IR, KP)"
                          : newRuleType.includes("wallet")
                          ? "Enter wallet addresses separated by commas"
                          : "Enter rule configuration"
                      }
                      value={newRuleData}
                      onChange={(e) => setNewRuleData(e.target.value)}
                      data-testid="rule-data-input"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddRuleDialogOpen(false)}
                      className="flex-1"
                      data-testid="cancel-add-rule"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateRule}
                      disabled={createRuleMutation.isPending}
                      className="flex-1"
                      data-testid="submit-add-rule"
                    >
                      {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

        <main className="p-6 space-y-6">
          {/* Compliance Controls */}
          <ComplianceControls onConfigure={() => {
            toast({
              title: "Compliance Settings",
              description: "Opening compliance configuration panel",
            });
          }} />

          {/* Compliance Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Compliance Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!complianceRules || complianceRules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No compliance rules configured</p>
                  <p className="text-sm">Add rules to control access to your APIs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complianceRules.map((rule: any) => (
                    <div 
                      key={rule.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`compliance-rule-${rule.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          {rule.type === "geo_block" && <Globe className="w-4 h-4 text-primary" />}
                          {rule.type.includes("wallet") && <Wallet className="w-4 h-4 text-primary" />}
                        </div>
                        <div>
                          <div className="font-medium capitalize">
                            {rule.type.replace("_", " ")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {rule.type === "geo_block" && rule.rules.countries && 
                              `Blocked countries: ${rule.rules.countries.join(", ")}`}
                            {rule.type.includes("wallet") && rule.rules.addresses &&
                              `${rule.rules.addresses.length} addresses configured`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={rule.isActive ? "default" : "secondary"}
                          className={rule.isActive ? "status-badge success" : "status-badge warning"}
                        >
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`delete-rule-${rule.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Blocked Requests (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive" data-testid="blocked-requests-count">
                  47
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +23% vs yesterday
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success" data-testid="compliance-rate">
                  99.8%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All requests processed within rules
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary" data-testid="active-rules-count">
                  {complianceRules?.filter((rule: any) => rule.isActive).length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monitoring all endpoints
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Compliance Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Compliance Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg" data-testid="compliance-event-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">Geo-blocking triggered</div>
                      <div className="text-xs text-muted-foreground">Request from China blocked</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">2 mins ago</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg" data-testid="compliance-event-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">Wallet deny list hit</div>
                      <div className="text-xs text-muted-foreground">Known bad actor wallet detected</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">15 mins ago</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg" data-testid="compliance-event-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">Rule updated</div>
                      <div className="text-xs text-muted-foreground">Geo-blocking rules refreshed</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">1 hour ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
