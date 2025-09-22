import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SalesData } from "@shared/schema";
import type { ActiveFilters } from "@/types/dashboard";

interface ChartsSectionProps {
  filters: ActiveFilters;
}

type ChartType = 'bar' | 'line' | 'area';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export function ChartsSection({ filters }: ChartsSectionProps) {
  const [productChartType, setProductChartType] = useState<ChartType>('bar');

  const { data: salesData, isLoading } = useQuery<SalesData[]>({
    queryKey: ['/api/sales', filters],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6">
              <div className="h-6 bg-muted rounded w-32 mb-4 animate-pulse" />
              <div className="h-64 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
            <div className="h-6 bg-muted rounded w-40 mb-4 animate-pulse" />
            <div className="h-80 bg-muted rounded animate-pulse" />
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="h-6 bg-muted rounded w-48 mb-4 animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!salesData || salesData.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">No data available. Please upload a CSV file to see charts.</p>
      </div>
    );
  }

  // Process data for revenue trend chart
  const revenueTrendData = salesData.reduce((acc, item) => {
    const date = item.date;
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.revenue += parseFloat(item.mrp);
    } else {
      acc.push({ date, revenue: parseFloat(item.mrp) });
    }
    return acc;
  }, [] as { date: string; revenue: number }[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Process data for city-wise sales
  const cityWiseData = salesData.reduce((acc, item) => {
    const city = item.city_name;
    const existing = acc.find(d => d.city === city);
    if (existing) {
      existing.revenue += parseFloat(item.mrp);
      existing.quantity += item.qty_sold;
    } else {
      acc.push({ city, revenue: parseFloat(item.mrp), quantity: item.qty_sold });
    }
    return acc;
  }, [] as { city: string; revenue: number; quantity: number }[]).sort((a, b) => b.revenue - a.revenue);

  // Process data for product performance
  const productData = salesData.reduce((acc, item) => {
    const product = item.item_name;
    const existing = acc.find(d => d.product === product);
    if (existing) {
      existing.revenue += parseFloat(item.mrp);
      existing.quantity += item.qty_sold;
    } else {
      acc.push({ product, revenue: parseFloat(item.mrp), quantity: item.qty_sold });
    }
    return acc;
  }, [] as { product: string; revenue: number; quantity: number }[]).sort((a, b) => b.revenue - a.revenue);

  // Process data for manufacturer distribution
  const manufacturerData = salesData.reduce((acc, item) => {
    const manufacturer = item.manufacturer_name;
    const existing = acc.find(d => d.name === manufacturer);
    if (existing) {
      existing.value += parseFloat(item.mrp);
    } else {
      acc.push({ name: manufacturer, value: parseFloat(item.mrp) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const renderProductChart = () => {
    const commonProps = {
      data: productData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (productChartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip formatter={(value, name) => [
              name === 'revenue' ? `₹${Number(value).toLocaleString()}` : value,
              name === 'revenue' ? 'Revenue' : 'Quantity'
            ]} />
            <Legend />
            <Line type="monotone" dataKey="quantity" stroke="#3b82f6" name="Quantity" />
            <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" name="Revenue" />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip formatter={(value, name) => [
              name === 'revenue' ? `₹${Number(value).toLocaleString()}` : value,
              name === 'revenue' ? 'Revenue' : 'Quantity'
            ]} />
            <Legend />
            <Area type="monotone" dataKey="quantity" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Quantity" />
            <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Revenue" />
          </AreaChart>
        );
      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip formatter={(value, name) => [
              name === 'revenue' ? `₹${Number(value).toLocaleString()}` : value,
              name === 'revenue' ? 'Revenue' : 'Quantity'
            ]} />
            <Legend />
            <Bar dataKey="quantity" fill="#3b82f6" name="Quantity" />
            <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
          </BarChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* First Row - Revenue Trend and City Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Revenue Trend</h3>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-64" data-testid="chart-revenue-trend">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City-wise Sales Chart */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">City-wise Sales</h3>
            <div className="flex space-x-2">
              <Button size="sm" className="text-xs">Revenue</Button>
              <Button size="sm" variant="outline" className="text-xs">Quantity</Button>
            </div>
          </div>
          <div className="h-64" data-testid="chart-city-sales">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityWiseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue">
                  {cityWiseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row - Product Performance and Manufacturer Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Performance Chart */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Product Performance</h3>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={productChartType === 'bar' ? 'default' : 'outline'}
                onClick={() => setProductChartType('bar')}
                className="text-xs"
                data-testid="button-chart-bar"
              >
                Bar
              </Button>
              <Button
                size="sm"
                variant={productChartType === 'line' ? 'default' : 'outline'}
                onClick={() => setProductChartType('line')}
                className="text-xs"
                data-testid="button-chart-line"
              >
                Line
              </Button>
              <Button
                size="sm"
                variant={productChartType === 'area' ? 'default' : 'outline'}
                onClick={() => setProductChartType('area')}
                className="text-xs"
                data-testid="button-chart-area"
              >
                Area
              </Button>
            </div>
          </div>
          <div className="h-80" data-testid="chart-product-performance">
            <ResponsiveContainer width="100%" height="100%">
              {renderProductChart()}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manufacturer Distribution */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Manufacturer Distribution</h3>
          <div className="h-64" data-testid="chart-manufacturer-distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={manufacturerData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {manufacturerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {manufacturerData.map((manufacturer, index) => {
              const percentage = ((manufacturer.value / manufacturerData.reduce((sum, m) => sum + m.value, 0)) * 100).toFixed(1);
              return (
                <div key={manufacturer.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{manufacturer.name}</span>
                  </div>
                  <span className="font-medium" data-testid={`text-manufacturer-percentage-${index}`}>
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
