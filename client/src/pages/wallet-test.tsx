import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  RefreshCw 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function WalletTest() {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState("/api/v1/cats");

  // Get current sandbox mode
  const { data: sandboxData } = useQuery({
    queryKey: ["/api/organization/sandbox"],
  });

  // Get available endpoints
  const { data: endpoints } = useQuery({
    queryKey: ["/api/endpoints"],
  });

  const [quote, setQuote] = useState<any>(null);

  // Get payment quote
  const getQuoteMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      const response = await fetch(`/proxy/demo-org/demo-service${endpoint}`);
      if (response.status === 402) {
        return response.json();
      }
      throw new Error(`Expected 402, got ${response.status}`);
    },
    onSuccess: (data) => {
      setQuote(data);
      toast({
        title: "Quote retrieved",
        description: "Ready for Base Sepolia payment testing"
      });
    },
    onError: () => {
      toast({
        title: "Failed to get quote",
        description: "Could not retrieve payment quote",
        variant: "destructive"
      });
    }
  });

  // Test payment
  const testPaymentMutation = useMutation({
    mutationFn: async ({ endpoint, txHash, walletAddress }: { 
      endpoint: string; 
      txHash: string; 
      walletAddress: string; 
    }) => {
      const response = await fetch(`/proxy/demo-org/demo-service${endpoint}`, {
        headers: {
          "X-Payment": txHash,
          "X-Payer-Address": walletAddress
        }
      });
      
      if (response.ok) {
        return { success: true, data: await response.json() };
      } else {
        return { success: false, error: await response.text() };
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Payment accepted!",
          description: "Base Sepolia transaction verified successfully"
        });
      } else {
        toast({
          title: "Payment rejected",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard"
    });
  };

  const networkConfig = sandboxData?.sandboxMode ? {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    faucet: "https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
  } : {
    name: "Base Mainnet",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    faucet: null
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Base Sepolia Wallet Testing</h1>
            <p className="text-muted-foreground">
              Test x402 payments with real USDC on Base Sepolia testnet
            </p>
          </div>

          {/* Network Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Network Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Current Network</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={sandboxData?.sandboxMode ? "secondary" : "default"}>
                      {networkConfig.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Chain ID: {networkConfig.chainId}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">USDC Contract</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {networkConfig.usdcAddress}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(networkConfig.usdcAddress)}
                      data-testid="copy-usdc-address"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {sandboxData?.sandboxMode && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Testnet Mode:</strong> You can get free Base Sepolia ETH and USDC from faucets.
                    <a 
                      href={networkConfig.faucet} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-500 hover:underline inline-flex items-center gap-1"
                    >
                      Get Test ETH <ExternalLink className="w-3 h-3" />
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Step 1: Get Quote */}
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Get Payment Quote</CardTitle>
              <CardDescription>
                Request a payment quote for Base Sepolia testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint">Select Endpoint</Label>
                <select 
                  id="endpoint"
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  data-testid="select-endpoint"
                >
                  <option value="/api/v1/cats">CATs API - 0.0005 USDC</option>
                  <option value="/ai/chat">AI Chat - 0.001 USDC</option>
                  <option value="/data/analytics">Analytics - 0.0005 USDC</option>
                </select>
              </div>

              <Button 
                onClick={() => getQuoteMutation.mutate(selectedEndpoint)}
                disabled={getQuoteMutation.isPending}
                className="w-full"
                data-testid="get-quote-button"
              >
                {getQuoteMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Getting Quote...
                  </>
                ) : (
                  "Get Payment Quote"
                )}
              </Button>

              {quote && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Payment Quote</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Amount:</strong> {quote.accepts?.[0]?.maxAmountRequired} USDC 
                      ({(parseInt(quote.accepts?.[0]?.maxAmountRequired || "0") / 1000000).toFixed(6)} USDC)
                    </div>
                    <div>
                      <strong>Network:</strong> {quote.accepts?.[0]?.network}
                    </div>
                    <div>
                      <strong>Pay To:</strong> {quote.accepts?.[0]?.payTo}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(quote.accepts?.[0]?.payTo)}
                        className="ml-2"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Wallet Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Configure Wallet</CardTitle>
              <CardDescription>
                Enter your wallet address for payment tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Your Wallet Address</Label>
                <Input
                  id="wallet"
                  placeholder="0x742d35Cc6639C443695aA7bf4A0A5dEe25Ae54B0"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  data-testid="input-wallet-address"
                />
                <p className="text-xs text-muted-foreground">
                  This address will be used to identify your payments
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Payment Testing */}
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Test Payment</CardTitle>
              <CardDescription>
                After sending USDC, enter the transaction hash to test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="txhash">Transaction Hash</Label>
                <Input
                  id="txhash"
                  placeholder="0xabcdef1234567890..."
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  data-testid="input-tx-hash"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the transaction hash from your USDC transfer on Base Sepolia
                </p>
              </div>

              <Button 
                onClick={() => testPaymentMutation.mutate({
                  endpoint: selectedEndpoint,
                  txHash,
                  walletAddress
                })}
                disabled={!txHash || !walletAddress || testPaymentMutation.isPending}
                className="w-full"
                data-testid="test-payment-button"
              >
                {testPaymentMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying Payment...
                  </>
                ) : (
                  "Test API Access"
                )}
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`${networkConfig.explorer}/tx/${txHash}`, '_blank')}
                  disabled={!txHash}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}