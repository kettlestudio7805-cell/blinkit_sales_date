import { TrendingUp, Package, Star, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Metrics } from "@shared/schema";
import type { ActiveFilters } from "@/types/dashboard";

interface MetricsOverviewProps {
  filters: ActiveFilters;
}

export function MetricsOverview({ filters }: MetricsOverviewProps) {
  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ['/api/metrics', filters],
  });

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                <div className="h-6 bg-muted rounded w-16 animate-pulse" />
                <div className="h-3 bg-muted rounded w-24 animate-pulse" />
              </div>
              <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Revenue",
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      change: "+12.5% from last month",
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      testId: "metric-total-revenue"
    },
    {
      title: "Quantity Sold",
      value: `${metrics.totalQuantity} units`,
      change: "+8.3% from last month",
      icon: Package,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      testId: "metric-total-quantity"
    },
    {
      title: "Top Product",
      value: metrics.topProduct || "No data",
      change: `${metrics.topProductQuantity} units sold`,
      icon: Star,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      testId: "metric-top-product"
    },
    {
      title: "Top City",
      value: metrics.topCity || "No data",
      change: `₹${metrics.topCityRevenue.toLocaleString()} revenue`,
      icon: MapPin,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      testId: "metric-top-city"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metricCards.map((card) => (
        <div
          key={card.title}
          className="bg-card rounded-lg border border-border p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          data-testid={card.testId}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold text-foreground" data-testid={`${card.testId}-value`}>
                {card.value}
              </p>
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                {card.change}
              </p>
            </div>
            <div className={`w-12 h-12 ${card.iconBg} rounded-full flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
