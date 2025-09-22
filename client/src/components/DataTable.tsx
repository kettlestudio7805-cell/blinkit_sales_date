import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import type { SalesData } from "@shared/schema";
import type { ActiveFilters, PaginationState, SortState } from "@/types/dashboard";

interface DataTableProps {
  filters: ActiveFilters;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function DataTable({ filters }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortState, setSortState] = useState<SortState>({
    field: "",
    direction: "asc",
  });

  const { data: salesData, isLoading } = useQuery<SalesData[]>({
    queryKey: ['/api/sales', { ...filters, search: searchQuery }],
  });

  // Process and filter data
  const processedData = useMemo(() => {
    if (!salesData) return [];

    let filtered = [...salesData];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(query) ||
        item.city_name.toLowerCase().includes(query) ||
        item.manufacturer_name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortState.field) {
      filtered.sort((a, b) => {
        const aVal = a[sortState.field as keyof SalesData];
        const bVal = b[sortState.field as keyof SalesData];
        
        let comparison = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        }

        return sortState.direction === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [salesData, searchQuery, sortState]);

  // Update pagination total when data changes
  useMemo(() => {
    setPagination(prev => ({ ...prev, total: processedData.length }));
  }, [processedData.length]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, pagination.page, pagination.pageSize]);

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  const handleSort = (field: string) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  const exportToCSV = () => {
    if (!processedData.length) return;

    const headers = ['Product', 'City', 'Manufacturer', 'Category', 'Date', 'Quantity', 'Revenue'];
    const csvContent = [
      headers.join(','),
      ...processedData.map(row => [
        row.item_name,
        row.city_name,
        row.manufacturer_name,
        row.category,
        row.date,
        row.qty_sold,
        row.mrp
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blinkit-sales-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            <div className="h-10 bg-muted rounded w-48 animate-pulse" />
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    { key: 'item_name', label: 'Product', sortable: true },
    { key: 'city_name', label: 'City', sortable: true },
    { key: 'manufacturer_name', label: 'Manufacturer', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'qty_sold', label: 'Quantity', sortable: true },
    { key: 'mrp', label: 'Revenue', sortable: true },
  ];

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Sales Data</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                data-testid="input-search-table"
              />
              <Button variant="ghost" size="sm" data-testid="button-search">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={exportToCSV} data-testid="button-export-csv">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="px-6 py-3">
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => handleSort(column.key)}
                        data-testid={`button-sort-${column.key}`}
                      >
                        <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery ? "No results found for your search." : "No data available. Please upload a CSV file."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow 
                  key={row.id} 
                  className="transition-colors hover:bg-muted/50"
                  data-testid={`row-sales-data-${index}`}
                >
                  <TableCell className="px-6 py-4 font-medium">{row.item_name}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{row.city_name}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{row.manufacturer_name}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{row.category}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{row.date}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{row.qty_sold}</TableCell>
                  <TableCell className="px-6 py-4 font-medium">₹{parseFloat(row.mrp).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
            </div>
            <select
              value={pagination.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="text-sm border border-input rounded px-2 py-1 bg-background"
              data-testid="select-page-size"
            >
              {ITEMS_PER_PAGE_OPTIONS.map(size => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              data-testid="button-previous-page"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  data-testid={`button-page-${page}`}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
