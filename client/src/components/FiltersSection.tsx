import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { FilterOptions, ActiveFilters } from "@/types/dashboard";

interface FiltersSectionProps {
  onFiltersChange: (filters: ActiveFilters) => void;
  activeFilters: ActiveFilters;
}

export function FiltersSection({ onFiltersChange, activeFilters }: FiltersSectionProps) {
  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ['/api/filter-options'],
  });

  const handleFilterChange = (key: keyof ActiveFilters, value: string | undefined) => {
    const newFilters = {
      ...activeFilters,
      [key]: value === 'all' || !value ? undefined : value,
    };
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const removeFilter = (key: keyof ActiveFilters) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-primary hover:text-primary/80"
            data-testid="button-clear-filters"
          >
            Clear All ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Date Range</label>
          <Select
            value={activeFilters.dateRange || 'all'}
            onValueChange={(value) => handleFilterChange('dateRange', value)}
          >
            <SelectTrigger data-testid="select-date-range">
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {activeFilters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From</label>
                <input
                  type="date"
                  value={activeFilters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                  data-testid="input-date-from"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To</label>
                <input
                  type="date"
                  value={activeFilters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                  data-testid="input-date-to"
                />
              </div>
            </div>
          )}
        </div>

        {/* City Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">City</label>
          <Select
            value={activeFilters.city || 'all'}
            onValueChange={(value) => handleFilterChange('city', value)}
          >
            <SelectTrigger data-testid="select-city">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {filterOptions?.cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Manufacturer Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Manufacturer</label>
          <Select
            value={activeFilters.manufacturer || 'all'}
            onValueChange={(value) => handleFilterChange('manufacturer', value)}
          >
            <SelectTrigger data-testid="select-manufacturer">
              <SelectValue placeholder="All Manufacturers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {filterOptions?.manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Category</label>
          <Select
            value={activeFilters.category || 'all'}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {filterOptions?.categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Product</label>
          <Select
            value={activeFilters.product || 'all'}
            onValueChange={(value) => handleFilterChange('product', value)}
          >
            <SelectTrigger data-testid="select-product">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {filterOptions?.products.map((product) => (
                <SelectItem key={product} value={product}>
                  {product}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Apply Filters Button */}
        <div className="flex items-end">
          <Button
            className="w-full"
            onClick={() => {/* Filters are applied automatically */}}
            data-testid="button-apply-filters"
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary animate-in slide-in-from-left-2"
                data-testid={`badge-filter-${key}`}
              >
                {value}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:text-primary/80"
                  onClick={() => removeFilter(key as keyof ActiveFilters)}
                  data-testid={`button-remove-filter-${key}`}
                >
                  <X className="w-3 h-3" />
                </Button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
