import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateInvoiceDescription, categorizeExpense } from "./openai";
import { insertInvoiceSchema, insertExpenseSchema, insertBusinessSettingsSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  })
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  await fs.mkdir("./uploads", { recursive: true });

  app.post("/api/invoices", async (req, res) => {
    try {
      const data = insertInvoiceSchema.parse(req.body);

      // If no description is provided for any line item, try to generate one
      data.lineItems = data.lineItems.map(item => {
        if (!item.description) {
          item.description = `Professional services for ${data.clientName}`;
        }
        return item;
      });

      const invoice = await storage.createInvoice(data);
      res.json(invoice);
    } catch (error: any) {
      console.error("Invoice creation error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/invoices/:userId", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByUserId(Number(req.params.userId));
      res.json(invoices);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      await storage.deleteInvoice(Number(req.params.id));
      res.json({ message: "Invoice deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);

      // Auto-categorize expense if category not provided
      if (!data.category) {
        data.category = await categorizeExpense(data.description);
      }

      const expense = await storage.createExpense(data);
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/expenses/:userId", async (req, res) => {
    try {
      const expenses = await storage.getExpensesByUserId(Number(req.params.userId));
      res.json(expenses);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/business-settings/:userId", async (req, res) => {
    try {
      const settings = await storage.getBusinessSettings(Number(req.params.userId));
      res.json(settings || {});
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/business-settings", async (req, res) => {
    try {
      const data = insertBusinessSettingsSchema.parse(req.body);
      const settings = await storage.updateBusinessSettings(data);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/upload-logo", upload.single("logo"), async (req, res) => {
    try {
      if (!req.file) {
        throw new Error("No file uploaded");
      }

      // In a real application, you would upload this to a proper storage service
      // For now, we'll serve it directly from the uploads directory
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}