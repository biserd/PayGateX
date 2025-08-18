import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DashboardHeaderProps {
  title: string;
  description: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  actionButton?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  };
}

export function DashboardHeader({ title, description, badge, actionButton }: DashboardHeaderProps) {
  const { logoutMutation } = useAuth();

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-primary" data-testid="page-title">
            {title}
          </h1>
          {badge && (
            <Badge variant={badge.variant || "default"} data-testid="page-badge">
              {badge.text}
            </Badge>
          )}
        </div>
        <p className="text-gray-600" data-testid="page-description">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {actionButton && (
          <Button
            variant={actionButton.variant || "default"}
            onClick={actionButton.onClick}
            data-testid="header-action-button"
          >
            {actionButton.icon}
            {actionButton.text}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}