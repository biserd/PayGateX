import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  ChartLine, 
  Plug, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Lock, 
  Settings,
  Coins
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartLine },
  { name: "API Endpoints", href: "/endpoints", icon: Plug },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Compliance", href: "/compliance", icon: Shield },
  { name: "Escrow", href: "/escrow", icon: Lock },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Coins className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold">PayGate 402</span>
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
      
      <div className="px-6 py-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center text-sm font-medium">
            <span>DM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">David Miller</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">david@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
