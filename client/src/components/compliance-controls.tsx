import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, X } from "lucide-react";

interface ComplianceControlsProps {
  onConfigure?: () => void;
}

export function ComplianceControls({ onConfigure }: ComplianceControlsProps) {
  const blockedCountries = [
    { code: "CN", name: "China", flag: "🇨🇳" },
    { code: "IR", name: "Iran", flag: "🇮🇷" },
    { code: "KP", name: "North Korea", flag: "🇰🇵" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-primary">Compliance Controls</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onConfigure}
          data-testid="configure-compliance"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geo-blocking */}
        <div>
          <h4 className="text-sm font-semibold text-primary mb-3">Geographic Restrictions</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Geo-blocking enabled</span>
              <Switch 
                defaultChecked 
                data-testid="geo-blocking-toggle"
              />
            </div>
            <div className="text-xs text-gray-500">
              <strong>{blockedCountries.length} countries blocked:</strong> {blockedCountries.map(c => c.code).join(", ")}
            </div>
            <div className="flex flex-wrap gap-2">
              {blockedCountries.map((country) => (
                <Badge 
                  key={country.code}
                  variant="destructive" 
                  className="inline-flex items-center gap-1"
                  data-testid={`blocked-country-${country.code}`}
                >
                  <span>{country.flag} {country.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 hover:bg-transparent"
                    data-testid={`remove-country-${country.code}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet Controls */}
        <div>
          <h4 className="text-sm font-semibold text-primary mb-3">Wallet Access Control</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Allow list active</span>
              <Switch data-testid="allow-list-toggle" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deny list active</span>
              <Switch 
                defaultChecked 
                data-testid="deny-list-toggle"
              />
            </div>
            <div className="text-xs text-gray-500">
              <strong>7 addresses</strong> on deny list
            </div>
            <div 
              className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-600 truncate"
              data-testid="deny-list-preview"
            >
              0x1234...abcd, 0x5678...efgh, +5 more
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
