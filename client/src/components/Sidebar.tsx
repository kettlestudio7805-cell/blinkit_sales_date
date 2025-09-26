import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Upload, 
  TrendingUp, 
  Table, 
  Download,
  Menu,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // clearData function
  const clearData = async () => {
    try {
      await fetch("/api/sales", {
        method: "DELETE",
      });
      queryClient.invalidateQueries(); // refreshes cached queries
      alert("All data cleared. Please upload a new file.");
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  const navigationItems = [
    { icon: TrendingUp, label: "Dashboard", href: "#", active: true },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 text-muted-foreground hover:text-foreground bg-card rounded-md border border-border"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mobile-menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "sidebar w-64 bg-card border-r border-border flex-shrink-0 overflow-y-auto transition-transform duration-300 ease-in-out",
          "fixed md:static inset-y-0 left-0 z-40",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="text-primary-foreground w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Blinkit Analytics
              </h1>
              <p className="text-xs text-muted-foreground">
                Powered by KettleStudio
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setIsOpen(false)}
                data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </a>
            ))}

            {/* Clear Data Button */}
            <button
              onClick={clearData}
              className="flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-red-500 hover:bg-accent hover:text-accent-foreground w-full mt-4"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Data</span>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}

