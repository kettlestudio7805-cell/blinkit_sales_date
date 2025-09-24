export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface FilterOptions {
  cities: string[];
  manufacturers: string[];
  categories: string[];
  products: string[];
}

export interface ActiveFilters {
  dateRange?: string;
  dateFrom?: string;
  dateTo?: string;
  city?: string;
  manufacturer?: string;
  category?: string;
  product?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}
