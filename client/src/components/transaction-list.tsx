import { Transaction } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageRecord {
  id: string;
  endpointId: string;
  orgId: string;
  payerAddress: string;
  ipAddress: string;
  price: string;
  currency: string;
  network: string;
  status: string;
  responseStatus?: number;
  createdAt: Date | string | null;
  endpoint?: {
    path: string;
    method: string;
  } | null;
}

interface TransactionListProps {
  transactions: UsageRecord[];
  title?: string;
  showViewAll?: boolean;
}

export function TransactionList({ 
  transactions, 
  title = "Recent Transactions", 
  showViewAll = true 
}: TransactionListProps) {
  
  const getStatusIcon = (status: string, responseStatus?: number) => {
    // Use response status if available for more accurate status display
    if (responseStatus) {
      if (responseStatus >= 200 && responseStatus < 300) {
        return <Check className="w-4 h-4 text-success" />;
      } else if (responseStatus >= 400) {
        return <X className="w-4 h-4 text-destructive" />;
      }
    }
    
    switch (status) {
      case "paid":
      case "completed":
        return <Check className="w-4 h-4 text-success" />;
      case "failed":
        return <X className="w-4 h-4 text-destructive" />;
      case "unpaid":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string, responseStatus?: number) => {
    // Use response status if available
    if (responseStatus) {
      if (responseStatus >= 200 && responseStatus < 300) {
        return "success";
      } else if (responseStatus >= 400) {
        return "error";
      }
    }

    switch (status) {
      case "paid":
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "unpaid":
        return "warning";
      default:
        return "warning";
    }
  };

  const getDisplayStatus = (status: string, responseStatus?: number) => {
    if (responseStatus) {
      if (responseStatus === 200) return "Success";
      if (responseStatus === 402) return "Payment Required";
      if (responseStatus >= 400) return "Error";
    }
    
    switch (status) {
      case "paid": return "Paid";
      case "unpaid": return "Unpaid";
      case "failed": return "Failed";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return "N/A";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "N/A";
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          {showViewAll && (
            <a href="#" className="text-sm text-secondary hover:text-secondary/80 font-medium">
              View all
            </a>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {transactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>No transactions found</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
              data-testid={`transaction-${transaction.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    getStatusColor(transaction.status, transaction.responseStatus) === "success" ? "bg-success/10" : 
                    getStatusColor(transaction.status, transaction.responseStatus) === "error" ? "bg-destructive/10" : "bg-warning/10"
                  )}>
                    {getStatusIcon(transaction.status, transaction.responseStatus)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-primary" data-testid={`transaction-endpoint-${transaction.id}`}>
                      {transaction.endpoint ? `${transaction.endpoint.method} ${transaction.endpoint.path}` : "Unknown endpoint"}
                    </div>
                    <div className="text-xs text-gray-500 font-mono" data-testid={`transaction-payer-${transaction.id}`}>
                      {transaction.payerAddress.slice(0, 6)}...{transaction.payerAddress.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Badge variant={getStatusColor(transaction.status, transaction.responseStatus) === "success" ? "default" : 
                                   getStatusColor(transaction.status, transaction.responseStatus) === "error" ? "destructive" : "secondary"}>
                      {getDisplayStatus(transaction.status, transaction.responseStatus)}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-primary mt-1" data-testid={`transaction-amount-${transaction.id}`}>
                    {transaction.status === "paid" ? `$${parseFloat(transaction.price).toFixed(6)}` : 
                     transaction.responseStatus === 402 ? "Payment Required" : 
                     transaction.status === "failed" ? "Failed" : `$${parseFloat(transaction.price).toFixed(6)}`}
                  </div>
                  <div className="text-xs text-gray-500" data-testid={`transaction-time-${transaction.id}`}>
                    {formatTimeAgo(transaction.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
