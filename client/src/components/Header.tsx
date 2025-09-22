import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="ml-12 md:ml-0"> {/* Account for mobile menu button */}
            <h2 className="text-2xl font-semibold text-foreground">Sales Dashboard</h2>
            <p className="text-sm text-muted-foreground">Monitor your Blinkit sales performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-muted-foreground hover:text-foreground"
            data-testid="button-notifications"
          >
            <Bell className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-muted-foreground hover:text-foreground"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="text-primary-foreground w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
