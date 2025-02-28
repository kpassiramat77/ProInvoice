import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateInvoiceDescription, categorizeExpense } from "./openai";
import { insertInvoiceSchema, insertExpenseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/invoices", async (req, res) => {
    try {
      const data = insertInvoiceSchema.parse(req.body);
      
      // Generate AI description if not provided
      if (!data.description) {
        data.description = await generateInvoiceDescription({
          clientName: data.clientName,
          amount: Number(data.amount),
          services: req.body.services || [],
        });
      }
      
      const invoice = await storage.createInvoice(data);
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/invoices/:userId", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByUserId(Number(req.params.userId));
      res.json(invoices);
    } catch (error) {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/expenses/:userId", async (req, res) => {
    try {
      const expenses = await storage.getExpensesByUserId(Number(req.params.userId));
      res.json(expenses);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
