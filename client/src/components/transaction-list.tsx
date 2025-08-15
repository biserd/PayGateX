import { Transaction } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionWithEndpoint extends Transaction {
  endpoint: {
    name: string;
    path: string;
  } | null;
}

interface TransactionListProps {
  transactions: TransactionWithEndpoint[];
  title?: string;
  showViewAll?: boolean;
}

export function TransactionList({ 
  transactions, 
  title = "Recent Transactions", 
  showViewAll = true 
}: TransactionListProps) {
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-success" />;
      case "failed":
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      default:
        return "warning";
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
                    transaction.status === "completed" ? "bg-success/10" : 
                    transaction.status === "failed" ? "bg-destructive/10" : "bg-warning/10"
                  )}>
                    {getStatusIcon(transaction.status)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-primary" data-testid={`transaction-endpoint-${transaction.id}`}>
                      {transaction.endpoint?.path || "Unknown endpoint"}
                    </div>
                    <div className="text-xs text-gray-500 font-mono" data-testid={`transaction-payer-${transaction.id}`}>
                      {transaction.payerAddress.slice(0, 6)}...{transaction.payerAddress.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary" data-testid={`transaction-amount-${transaction.id}`}>
                    {transaction.status === "completed" ? `$${transaction.amount}` : 
                     transaction.status === "failed" ? "Failed" : "Pending"}
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
