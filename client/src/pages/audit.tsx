import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  ExternalLink, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Filter,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionRecord {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  payerAddress: string;
  amount: string;
  currency: string;
  txHash: string;
  networkId: string;
  status: "paid" | "unpaid" | "pending" | "failed";
  latency: number;
  userAgent: string;
  ipAddress: string;
  responseCode: number;
  facilitator: string;
  blockNumber?: string;
  gasUsed?: string;
  gasFee?: string;
}

export default function Audit() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [networkFilter, setNetworkFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRecord | null>(null);

  // Get audit records
  const { data: auditData, isLoading } = useQuery({
    queryKey: [`/api/audit/transactions?days=${dateRange}&status=${statusFilter}&network=${networkFilter}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get network status
  const { data: networkData } = useQuery({
    queryKey: ["/api/organization/sandbox"],
  });

  const transactions: TransactionRecord[] = auditData?.transactions || [];
  const summary = auditData?.summary || {
    totalTransactions: 0,
    paidTransactions: 0,
    totalRevenue: "0.000000",
    averageLatency: 0
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = searchTerm === "" || 
      tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.payerAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchesNetwork = networkFilter === "all" || tx.networkId === networkFilter;
    
    return matchesSearch && matchesStatus && matchesNetwork;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "failed":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getExplorerUrl = (txHash: string, networkId: string) => {
    if (networkId === "84532") {
      return `https://sepolia.basescan.org/tx/${txHash}`;
    } else if (networkId === "8453") {
      return `https://basescan.org/tx/${txHash}`;
    }
    return `https://etherscan.io/tx/${txHash}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`
    });
  };

  const exportData = () => {
    const csvData = filteredTransactions.map(tx => ({
      timestamp: tx.timestamp,
      endpoint: tx.endpoint,
      method: tx.method,
      payer_address: tx.payerAddress,
      amount: tx.amount,
      currency: tx.currency,
      tx_hash: tx.txHash,
      network_id: tx.networkId,
      status: tx.status,
      latency_ms: tx.latency,
      response_code: tx.responseCode,
      ip_address: tx.ipAddress,
      user_agent: tx.userAgent
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paygate-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Audit data exported to CSV file"
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
              <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
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

  return (
    <div className="min-h-screen flex bg-background-light">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <DashboardHeader
            title="Transaction Audit"
            description="Inspect and verify all payment transactions with blockchain receipts"
            actionButton={{
              text: "Export Data",
              onClick: exportData,
              icon: <Download className="w-4 h-4 mr-2" />,
              variant: "outline"
            }}
          />
        </div>

        <main className="p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Search className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="total-transactions">
                  {summary.totalTransactions}
                </div>
                <p className="text-xs text-muted-foreground">
                  All recorded requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Transactions</CardTitle>
                <CheckCircle className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success" data-testid="paid-transactions">
                  {summary.paidTransactions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Verified payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <ExternalLink className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary" data-testid="total-revenue">
                  ${summary.totalRevenue}
                </div>
                <p className="text-xs text-muted-foreground">
                  USDC collected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                <Clock className="w-4 h-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning" data-testid="avg-latency">
                  {summary.averageLatency}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Response time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Transaction Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="TX hash, address, endpoint..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="search-transactions"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="network-filter">Network</Label>
                  <Select value={networkFilter} onValueChange={setNetworkFilter}>
                    <SelectTrigger data-testid="network-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Networks</SelectItem>
                      <SelectItem value="8453">Base Mainnet</SelectItem>
                      <SelectItem value="84532">Base Sepolia</SelectItem>
                      <SelectItem value="1">Ethereum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger data-testid="date-range-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Last 24 hours</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Records</CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredTransactions.length} transactions found
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Payer Address</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>TX Hash</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No transactions found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <TableRow key={tx.id} data-testid={`transaction-row-${tx.id}`}>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(tx.timestamp).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">
                              {tx.method} {tx.endpoint}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {tx.payerAddress.slice(0, 6)}...{tx.payerAddress.slice(-4)}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(tx.payerAddress, "Address")}
                                data-testid={`copy-address-${tx.id}`}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {tx.amount} {tx.currency}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(tx.txHash, "TX Hash")}
                                data-testid={`copy-txhash-${tx.id}`}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {tx.networkId === "8453" ? "Base" : 
                               tx.networkId === "84532" ? "Base Sepolia" : 
                               `Chain ${tx.networkId}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(tx.status)}
                              <Badge variant={getStatusVariant(tx.status)}>
                                {tx.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {tx.latency}ms
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedTransaction(tx)}
                                    data-testid={`inspect-${tx.id}`}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Inspect
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Transaction Details</DialogTitle>
                                  </DialogHeader>
                                  {selectedTransaction && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium">Transaction Hash</Label>
                                          <div className="flex items-center gap-2 mt-1">
                                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                                              {selectedTransaction.txHash}
                                            </code>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => copyToClipboard(selectedTransaction.txHash, "TX Hash")}
                                            >
                                              <Copy className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Payer Address</Label>
                                          <div className="flex items-center gap-2 mt-1">
                                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                                              {selectedTransaction.payerAddress}
                                            </code>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => copyToClipboard(selectedTransaction.payerAddress, "Address")}
                                            >
                                              <Copy className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Amount</Label>
                                          <div className="text-sm font-mono mt-1">
                                            {selectedTransaction.amount} {selectedTransaction.currency}
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Network</Label>
                                          <div className="text-sm mt-1">
                                            {selectedTransaction.networkId === "8453" ? "Base Mainnet" : 
                                             selectedTransaction.networkId === "84532" ? "Base Sepolia" : 
                                             `Chain ${selectedTransaction.networkId}`}
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Status</Label>
                                          <div className="flex items-center gap-2 mt-1">
                                            {getStatusIcon(selectedTransaction.status)}
                                            <Badge variant={getStatusVariant(selectedTransaction.status)}>
                                              {selectedTransaction.status}
                                            </Badge>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Response Code</Label>
                                          <div className="text-sm mt-1">
                                            {selectedTransaction.responseCode}
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Latency</Label>
                                          <div className="text-sm mt-1">
                                            {selectedTransaction.latency}ms
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Facilitator</Label>
                                          <div className="text-sm mt-1">
                                            {selectedTransaction.facilitator}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-sm font-medium">Request Details</Label>
                                        <div className="mt-2 space-y-2">
                                          <div className="text-sm">
                                            <span className="font-medium">Endpoint:</span> {selectedTransaction.method} {selectedTransaction.endpoint}
                                          </div>
                                          <div className="text-sm">
                                            <span className="font-medium">IP Address:</span> {selectedTransaction.ipAddress}
                                          </div>
                                          <div className="text-sm">
                                            <span className="font-medium">User Agent:</span> {selectedTransaction.userAgent}
                                          </div>
                                        </div>
                                      </div>

                                      {selectedTransaction.blockNumber && (
                                        <div>
                                          <Label className="text-sm font-medium">Blockchain Details</Label>
                                          <div className="mt-2 space-y-2">
                                            <div className="text-sm">
                                              <span className="font-medium">Block Number:</span> {selectedTransaction.blockNumber}
                                            </div>
                                            {selectedTransaction.gasUsed && (
                                              <div className="text-sm">
                                                <span className="font-medium">Gas Used:</span> {selectedTransaction.gasUsed}
                                              </div>
                                            )}
                                            {selectedTransaction.gasFee && (
                                              <div className="text-sm">
                                                <span className="font-medium">Gas Fee:</span> {selectedTransaction.gasFee} ETH
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="flex gap-2 pt-4">
                                        <Button
                                          variant="outline"
                                          onClick={() => window.open(getExplorerUrl(selectedTransaction.txHash, selectedTransaction.networkId), '_blank')}
                                          data-testid="view-on-explorer"
                                        >
                                          <ExternalLink className="w-4 h-4 mr-2" />
                                          View on Explorer
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              {tx.txHash && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(getExplorerUrl(tx.txHash, tx.networkId), '_blank')}
                                  data-testid={`explorer-${tx.id}`}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}