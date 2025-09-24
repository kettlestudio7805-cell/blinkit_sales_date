import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSalesDataSchema, filtersSchema } from "@shared/schema";
import * as XLSX from "xlsx";
import multer from "multer";
// no z import needed here

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const byMime = allowed.includes(file.mimetype);
    const byExt = /(\.csv|\.xlsx|\.xls)$/i.test(file.originalname);
    if (byMime || byExt) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV or Excel files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload CSV file and parse sales data
  app.post("/api/upload", upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let rows: any[] = [];
      let headers: string[] = [];
      const isExcel = /(\.xlsx|\.xls)$/i.test(req.file.originalname) || req.file.mimetype.includes('spreadsheet') || req.file.mimetype === 'application/vnd.ms-excel';

      if (isExcel) {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (json.length === 0) {
          return res.status(400).json({ error: "Excel file has no rows" });
        }
        const firstRow = json[0] as Record<string, any>;
        headers = Object.keys(firstRow).map(h => String(h).trim());
        rows = (json as Record<string, any>[]).map((row) => headers.map(h => String(row[h])));
      } else {
        const csvContent = req.file.buffer.toString('utf-8');
        const lines = csvContent.trim().split('\n');
        headers = lines[0].split(',').map(h => h.trim().replace(/\"/g, ''));
        rows = lines.slice(1).map(line => line.split(',').map(v => v.trim().replace(/\"/g, '')));
      }

      const salesRecords: any[] = [];

      for (const values of rows) {
        if (values.length !== headers.length) continue;

        const record = {
          item_id: parseInt(values[0]) || 0,
          item_name: values[1] || '',
          manufacturer_id: parseInt(values[2]) || 0,
          manufacturer_name: values[3] || '',
          city_id: parseInt(values[4]) || 0,
          city_name: values[5] || '',
          category: values[6] || '',
          date: values[7] || '',
          qty_sold: parseInt(values[8]) || 0,
          mrp: String(parseFloat(values[9]) || 0),
        };

        try {
          const validationResult = insertSalesDataSchema.safeParse(record);
          if (validationResult.success) {
            salesRecords.push(validationResult.data);
          } else {
            salesRecords.push(record);
          }
        } catch {
          salesRecords.push(record);
        }
      }

      if (salesRecords.length === 0) {
        return res.status(400).json({ error: "No valid records found in uploaded file", debug: { rows: rows.length, headers } });
      }

      // Clear existing data and insert new data
      await storage.clearSalesData();
      const insertedRecords = await storage.insertSalesData(salesRecords);
      
      res.json({ 
        message: `Successfully uploaded ${insertedRecords.length} records`,
        count: insertedRecords.length
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to upload CSV file" 
      });
    }
  });

  // Get all sales data with optional filters
  app.get("/api/sales", async (req, res) => {
    try {
      const filtersResult = filtersSchema.safeParse(req.query);
      const filters = filtersResult.success ? filtersResult.data : {};
      
      const data = await storage.getSalesDataWithFilters(filters);
      res.json(data);
    } catch (error) {
      console.error('Get sales data error:', error);
      res.status(500).json({ error: "Failed to fetch sales data" });
    }
  });

  // Get metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const filtersResult = filtersSchema.safeParse(req.query);
      const filters = filtersResult.success ? filtersResult.data : {};
      
      const metrics = await storage.getMetrics(filters);
      res.json(metrics);
    } catch (error) {
      console.error('Get metrics error:', error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Get filter options
  app.get("/api/filter-options", async (req, res) => {
    try {
      const [cities, manufacturers, categories, products] = await Promise.all([
        storage.getCities(),
        storage.getManufacturers(),
        storage.getCategories(),
        storage.getProducts(),
      ]);

      res.json({
        cities,
        manufacturers,
        categories,
        products,
      });
    } catch (error) {
      console.error('Get filter options error:', error);
      res.status(500).json({ error: "Failed to fetch filter options" });
    }
  });

  // Clear all data
  app.delete("/api/sales", async (req, res) => {
    try {
      await storage.clearSalesData();
      res.json({ message: "All sales data cleared successfully" });
    } catch (error) {
      console.error('Clear data error:', error);
      res.status(500).json({ error: "Failed to clear sales data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
