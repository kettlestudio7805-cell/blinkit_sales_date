import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const salesData = pgTable("sales_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  item_id: integer("item_id").notNull(),
  item_name: text("item_name").notNull(),
  manufacturer_id: integer("manufacturer_id").notNull(),
  manufacturer_name: text("manufacturer_name").notNull(),
  city_id: integer("city_id").notNull(),
  city_name: text("city_name").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(), // Store as string to match CSV format
  qty_sold: integer("qty_sold").notNull(),
  mrp: decimal("mrp", { precision: 10, scale: 2 }).notNull(),
});

export const insertSalesDataSchema = createInsertSchema(salesData).omit({
  id: true,
});

export type InsertSalesData = z.infer<typeof insertSalesDataSchema>;
export type SalesData = typeof salesData.$inferSelect;

// Filter schemas
export const filtersSchema = z.object({
  dateRange: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  city: z.string().optional(),
  manufacturer: z.string().optional(),
  category: z.string().optional(),
  product: z.string().optional(),
  search: z.string().optional(),
});

export type Filters = z.infer<typeof filtersSchema>;

// Metrics schema
export const metricsSchema = z.object({
  totalRevenue: z.number(),
  totalQuantity: z.number(),
  topProduct: z.string(),
  topCity: z.string(),
  topProductQuantity: z.number(),
  topCityRevenue: z.number(),
});

export type Metrics = z.infer<typeof metricsSchema>;
