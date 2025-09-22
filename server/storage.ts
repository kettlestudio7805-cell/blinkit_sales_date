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
