import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { EndpointTable } from "@/components/endpoint-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEndpointSchema } from "@shared/schema";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const endpointFormSchema = insertEndpointSchema.omit({ serviceId: true });
type EndpointFormData = z.infer<typeof endpointFormSchema>;

export default function Endpoints() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<any>(null);

  const editForm = useForm<EndpointFormData>({
    resolver: zodResolver(endpointFormSchema),
    defaultValues: {
      path: "",
      method: "GET",
      targetUrl: "",
      description: "",
      priceAmount: "0.001",
      supportedNetworks: ["base"],
      isActive: true,
    },
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: endpoints, isLoading } = useQuery({
    queryKey: ["/api/endpoints"],
  });

  const createEndpointMutation = useMutation({
    mutationFn: async (data: EndpointFormData) => {
      const response = await apiRequest("POST", "/api/endpoints", data);
      return response.json();
    },
    onSuccess: (newEndpoint) => {
      // Invalidate and refetch the endpoints list
      queryClient.invalidateQueries({ queryKey: ["/api/endpoints"] });
      
      // Optionally update the cache optimistically
      queryClient.setQueryData(["/api/endpoints"], (oldData: any) => {
        if (oldData && Array.isArray(oldData)) {
          return [newEndpoint, ...oldData];
        }
        return [newEndpoint];
      });
      
      // Reset form and close dialog
      form.reset();
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "API endpoint created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create API endpoint",
        variant: "destructive",
      });
    },
  });

  const editEndpointMutation = useMutation({
    mutationFn: async (data: EndpointFormData) => {
      if (!editingEndpoint?.id) throw new Error("No endpoint ID");
      const response = await apiRequest("PUT", `/api/endpoints/${editingEndpoint.id}`, data);
      return response.json();
    },
    onSuccess: (updatedEndpoint) => {
      queryClient.invalidateQueries({ queryKey: ["/api/endpoints"] });
      setIsEditDialogOpen(false);
      setEditingEndpoint(null);
      editForm.reset();
      toast({
        title: "Endpoint updated",
        description: `Successfully updated ${updatedEndpoint.path}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<EndpointFormData>({
    resolver: zodResolver(endpointFormSchema),
    defaultValues: {
      path: "",
      method: "GET",
      targetUrl: "",
      description: "",
      isActive: true,
      supportedNetworks: ["base"],
    },
  });

  const onSubmit = (data: EndpointFormData) => {
    createEndpointMutation.mutate(data);
  };

  const handleEditEndpoint = (data: EndpointFormData) => {
    editEndpointMutation.mutate(data);
  };

  // Reset edit form when editing endpoint changes
  const handleEditClick = (endpoint: any) => {
    setEditingEndpoint(endpoint);
    editForm.reset({
      path: endpoint.path,
      method: endpoint.method,
      targetUrl: endpoint.targetUrl || "",
      description: endpoint.description || "",
      priceAmount: endpoint.priceAmount || "0.001",
      supportedNetworks: endpoint.supportedNetworks || ["base"],
      isActive: endpoint.isActive,
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
            title="API Endpoints"
            description="Manage and configure your monetized API endpoints"
            actionButton={{
              text: "Create Endpoint",
              onClick: () => setIsCreateDialogOpen(true),
              icon: <Plus className="w-4 h-4 mr-2" />,
            }}
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create API Endpoint</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Real-time weather data API" 
                              value={field.value || ""} 
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              data-testid="endpoint-description-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="path"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Path</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="/api/v1/weather" 
                              {...field} 
                              data-testid="endpoint-path-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HTTP Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="endpoint-method-select">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="supportedNetworks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Network</FormLabel>
                            <Select onValueChange={(value) => field.onChange([value])} defaultValue={Array.isArray(field.value) ? field.value[0] : "base"}>
                              <FormControl>
                                <SelectTrigger data-testid="endpoint-network-select">
                                  <SelectValue placeholder="Select network" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="base">Base</SelectItem>
                                <SelectItem value="ethereum">Ethereum</SelectItem>
                                <SelectItem value="polygon">Polygon</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="targetUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://api.example.com/weather" 
                              {...field} 
                              data-testid="endpoint-target-url-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    

                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Enable this endpoint for payments
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="endpoint-active-switch"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="flex-1"
                        data-testid="cancel-create-endpoint"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={createEndpointMutation.isPending}
                        data-testid="submit-create-endpoint"
                      >
                        {createEndpointMutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {/* Edit Endpoint Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Endpoint</DialogTitle>
                  <DialogDescription>
                    Update the endpoint configuration
                  </DialogDescription>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(handleEditEndpoint)} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Real-time weather data API" 
                              {...field}
                              data-testid="edit-endpoint-description-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="path"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Path</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="/api/weather" 
                              {...field}
                              data-testid="edit-endpoint-path-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HTTP Method</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="edit-endpoint-method-select">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="supportedNetworks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Network</FormLabel>
                            <Select onValueChange={(value) => field.onChange([value])} value={Array.isArray(field.value) ? field.value[0] : "base"}>
                              <FormControl>
                                <SelectTrigger data-testid="edit-endpoint-network-select">
                                  <SelectValue placeholder="Select network" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="base">Base</SelectItem>
                                <SelectItem value="ethereum">Ethereum</SelectItem>
                                <SelectItem value="polygon">Polygon</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={editForm.control}
                      name="targetUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://api.example.com/weather" 
                              {...field} 
                              data-testid="edit-endpoint-target-url-input"
                            />
                          </FormControl>
                          <FormDescription>
                            The actual API endpoint URL to forward requests to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="priceAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USDC)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.0001"
                              placeholder="0.001" 
                              {...field}
                              data-testid="edit-endpoint-price-input"
                            />
                          </FormControl>
                          <FormDescription>
                            Price in USDC per API call
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Enable this endpoint for payments
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="edit-endpoint-active-switch"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditDialogOpen(false);
                          setEditingEndpoint(null);
                          editForm.reset();
                        }}
                        className="flex-1"
                        data-testid="cancel-edit-endpoint"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={editEndpointMutation.isPending}
                        data-testid="submit-edit-endpoint"
                      >
                        {editEndpointMutation.isPending ? "Updating..." : "Update Endpoint"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

        <main className="p-6">
          <EndpointTable 
            endpoints={(endpoints as any[]) || []}
            onEdit={handleEditClick}
            onViewAnalytics={(endpoint) => {
              toast({
                title: "Analytics",
                description: `Viewing analytics for ${endpoint.path}`,
              });
            }}
            onSettings={(endpoint) => {
              toast({
                title: "Settings",
                description: `Settings for ${endpoint.path}`,
              });
            }}
          />
        </main>
      </div>
    </div>
  );
}
