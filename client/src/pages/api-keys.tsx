import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Key, Copy, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { ApiKey } from "@shared/schema";

export default function ApiKeys() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const { data: keys = [], isLoading } = useQuery<(ApiKey & { key?: string })[]>({
    queryKey: ["/api/keys"],
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/keys", { name });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      setCreatedKey(data.key);
      setNewKeyName("");
      toast({
        title: "API Key Created",
        description: "Make sure to copy your key now. You won't be able to see it again!",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/keys/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API Key Revoked",
        description: "The API key has been revoked successfully",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Key copied to clipboard",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a key name",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newKeyName);
  };

  const closeCreatedKeyDialog = () => {
    setCreatedKey(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">API Key Management</h1>
              <p className="text-muted-foreground">
                Manage API keys for authenticating requests to your endpoints
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-key">
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Enter a name to identify this API key
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="e.g., Production Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    data-testid="input-key-name"
                  />
                  <Button 
                    onClick={handleCreateKey} 
                    disabled={createMutation.isPending}
                    className="w-full"
                    data-testid="button-submit-key"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Key"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {createdKey && (
            <Dialog open={!!createdKey} onOpenChange={closeCreatedKeyDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Your New API Key</DialogTitle>
                  <DialogDescription>
                    Make sure to copy this key now. You won't be able to see it again!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-muted p-4 rounded-md font-mono text-sm break-all">
                    {createdKey}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(createdKey)}
                    className="w-full"
                    data-testid="button-copy-new-key"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button
                    onClick={closeCreatedKeyDialog}
                    variant="outline"
                    className="w-full"
                    data-testid="button-close-key-dialog"
                  >
                    I've Saved My Key
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Card className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No API keys created yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium" data-testid={`text-key-name-${key.id}`}>
                        {key.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm" data-testid={`text-key-prefix-${key.id}`}>
                            {visibleKeys.has(key.id) ? key.prefix + '••••••••' : key.prefix + '••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(key.id)}
                            data-testid={`button-toggle-visibility-${key.id}`}
                          >
                            {visibleKeys.has(key.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-key-created-${key.id}`}>
                        {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell data-testid={`text-key-last-used-${key.id}`}>
                        {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(key.prefix)}
                            data-testid={`button-copy-${key.id}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => revokeMutation.mutate(key.id)}
                            disabled={revokeMutation.isPending}
                            data-testid={`button-revoke-${key.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
