import { type SalesData, type InsertSalesData, type Filters, type Metrics } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Sales data operations
  insertSalesData(data: InsertSalesData[]): Promise<SalesData[]>;
  getAllSalesData(): Promise<SalesData[]>;
  getSalesDataWithFilters(filters: Filters): Promise<SalesData[]>;
  clearSalesData(): Promise<void>;
  
  // Analytics operations
  getMetrics(filters?: Filters): Promise<Metrics>;
  getCities(): Promise<string[]>;
  getManufacturers(): Promise<string[]>;
  getCategories(): Promise<string[]>;
  getProducts(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private salesData: Map<string, SalesData>;

  constructor() {
    this.salesData = new Map();
         this.clearSalesData();

  }

  async insertSalesData(data: InsertSalesData[]): Promise<SalesData[]> {
    const result: SalesData[] = [];
    
    for (const item of data) {
      const id = randomUUID();
      const salesRecord: SalesData = { 
        ...item, 
        id,
        mrp: item.mrp.toString() // Convert to string for consistency
      };
      this.salesData.set(id, salesRecord);
      result.push(salesRecord);
    }
    
    return result;
  }

  async getAllSalesData(): Promise<SalesData[]> {
    return Array.from(this.salesData.values());
  }

  async getSalesDataWithFilters(filters: Filters): Promise<SalesData[]> {
    let data = Array.from(this.salesData.values());

    // Date range: supports preset and custom from/to (expects YYYY-MM-DD or similar)
    // Apply preset ranges (last7/last30) or custom dates if provided
    if (filters.dateRange && filters.dateRange !== 'all') {
      const parse = (d: string) => new Date(d).getTime();
      const within = (d: string, from: number, to: number) => {
        const t = parse(d);
        return !isNaN(t) && t >= from && t <= to;
      };

      if (filters.dateRange === 'last7' || filters.dateRange === 'last30') {
        const days = filters.dateRange === 'last7' ? 7 : 30;
        // use max date in dataset as reference
        const maxTime = data.reduce((m, it) => Math.max(m, parse(it.date)), 0);
        const to = maxTime || Date.now();
        const from = to - (days - 1) * 24 * 60 * 60 * 1000;
        data = data.filter(item => within(item.date, from, to));
      } else if (filters.dateRange === 'custom' && filters.dateFrom && filters.dateTo) {
        const from = parse(filters.dateFrom);
        const to = parse(filters.dateTo);
        if (!isNaN(from) && !isNaN(to)) {
          data = data.filter(item => within(item.date, from, to));
        }
      }
    }

    // Additionally, honor explicit dateFrom/dateTo even if dateRange not set to 'custom'
    if (filters.dateFrom || filters.dateTo) {
      const parse = (d: string) => new Date(d).getTime();
      let from = Number.NEGATIVE_INFINITY;
      let to = Number.POSITIVE_INFINITY;
      if (filters.dateFrom) {
        const t = parse(filters.dateFrom);
        if (!isNaN(t)) from = t;
      }
      if (filters.dateTo) {
        const t = parse(filters.dateTo);
        if (!isNaN(t)) {
          // include the entire end day by adding almost one day minus 1ms
          const endOfDay = new Date(t);
          endOfDay.setHours(23, 59, 59, 999);
          to = endOfDay.getTime();
        }
      }
      data = data.filter(item => {
        const t = parse(item.date);
        return !isNaN(t) && t >= from && t <= to;
      });
    }

    if (filters.city && filters.city !== 'All Cities') {
      data = data.filter(item => item.city_name === filters.city);
    }

    if (filters.manufacturer && filters.manufacturer !== 'All Manufacturers') {
      data = data.filter(item => item.manufacturer_name === filters.manufacturer);
    }

    if (filters.category && filters.category !== 'All Categories') {
      data = data.filter(item => item.category === filters.category);
    }

    if (filters.product && filters.product !== 'All Products') {
      data = data.filter(item => item.item_name.includes(filters.product!));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      data = data.filter(item => 
        item.item_name.toLowerCase().includes(searchLower) ||
        item.city_name.toLowerCase().includes(searchLower) ||
        item.manufacturer_name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

    return data;
  }

  async clearSalesData(): Promise<void> {
    this.salesData.clear();
  }

  async getMetrics(filters?: Filters): Promise<Metrics> {
    const data = filters ? await this.getSalesDataWithFilters(filters) : await this.getAllSalesData();
    
    if (data.length === 0) {
      return {
        totalRevenue: 0,
        totalQuantity: 0,
        topProduct: '',
        topCity: '',
        topProductQuantity: 0,
        topCityRevenue: 0,
      };
    }

    const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.mrp), 0);
    const totalQuantity = data.reduce((sum, item) => sum + item.qty_sold, 0);

    // Calculate top product
    const productSales = data.reduce((acc, item) => {
      acc[item.item_name] = (acc[item.item_name] || 0) + item.qty_sold;
      return acc;
    }, {} as Record<string, number>);

    const topProductEntry = Object.entries(productSales).reduce((max, [name, qty]) => 
      qty > max[1] ? [name, qty] : max, ['', 0]);

    // Calculate top city
    const citySales = data.reduce((acc, item) => {
      acc[item.city_name] = (acc[item.city_name] || 0) + parseFloat(item.mrp);
      return acc;
    }, {} as Record<string, number>);

    const topCityEntry = Object.entries(citySales).reduce((max, [name, revenue]) => 
      revenue > max[1] ? [name, revenue] : max, ['', 0]);

    return {
      totalRevenue,
      totalQuantity,
      topProduct: topProductEntry[0],
      topCity: topCityEntry[0],
      topProductQuantity: topProductEntry[1],
      topCityRevenue: topCityEntry[1],
    };
  }

  async getCities(): Promise<string[]> {
    const data = await this.getAllSalesData();
    return Array.from(new Set(data.map(item => item.city_name)));
  }

  async getManufacturers(): Promise<string[]> {
    const data = await this.getAllSalesData();
    return Array.from(new Set(data.map(item => item.manufacturer_name)));
  }

  async getCategories(): Promise<string[]> {
    const data = await this.getAllSalesData();
    return Array.from(new Set(data.map(item => item.category)));
  }

  async getProducts(): Promise<string[]> {
    const data = await this.getAllSalesData();
    return Array.from(new Set(data.map(item => item.item_name)));
  }
}

export const storage = new MemStorage();
