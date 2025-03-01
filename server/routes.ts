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

  app.get("/api/invoices/edit/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(Number(req.params.id));
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/invoices/:id", async (req, res) => {
    try {
      const data = insertInvoiceSchema.parse(req.body);
      const updatedInvoice = await storage.updateInvoice(Number(req.params.id), data);
      res.json(updatedInvoice);
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

  // Add AI categorization endpoint
  app.post("/api/expenses/categorize", async (req, res) => {
    try {
      const { description } = req.body;
      const category = await categorizeExpense(description);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update expense creation endpoint
  app.post("/api/expenses", async (req, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);

      // If no category is provided, try to auto-categorize
      if (!data.category) {
        const category = await categorizeExpense(data.description);
        data.category = category.mainCategory;
        data.subCategory = category.subCategory;
        data.confidence = category.confidence;
        data.categoryExplanation = category.explanation;
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

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const updatedExpense = await storage.updateExpense(Number(req.params.id), data);
      res.json(updatedExpense);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      await storage.deleteExpense(Number(req.params.id));
      res.json({ message: "Expense deleted successfully" });
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

  app.patch("/api/invoices/:id/status", async (req, res) => {
    try {
      const updatedInvoice = await storage.updateInvoiceStatus(Number(req.params.id), req.body.status);
      res.json(updatedInvoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}