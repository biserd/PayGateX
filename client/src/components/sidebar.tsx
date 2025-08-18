import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  ChartLine, 
  Plug, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Lock, 
  Settings,
  Coins,
  Wallet,
  FileText
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartLine },
  { name: "API Endpoints", href: "/endpoints", icon: Plug },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Compliance", href: "/compliance", icon: Shield },
  { name: "Escrow", href: "/escrow", icon: Lock },
  { name: "Transaction Audit", href: "/audit", icon: FileText },
  { name: "Wallet Test", href: "/wallet-test", icon: Wallet },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Generate initials from username
  const getInitials = (username: string) => {
    return username?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Coins className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">PayGate x402</span>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "sidebar-nav-item",
                  isActive && "active"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="px-6 py-4 border-t border-slate-700 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
            <span>{user ? getInitials(user.username) : "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || "No email provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
