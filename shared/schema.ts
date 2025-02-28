import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientName: text("client_name").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  description: text("description"),
  status: text("status").notNull(), // pending, paid, overdue
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  template: text("template").notNull().default("modern"),
});

export const lineItems = pgTable("line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity").notNull(),
  unitPrice: decimal("unit_price").notNull(),
  amount: decimal("amount").notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
});

export const businessSettings = pgTable("business_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  businessName: text("business_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  email: text("email"),
  logo: text("logo_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Line item schema
export const insertLineItemSchema = createInsertSchema(lineItems)
  .omit({
    id: true,
    invoiceId: true,
  })
  .extend({
    quantity: z.number().positive("Quantity must be greater than 0"),
    unitPrice: z.number().positive("Unit price must be greater than 0"),
    amount: z.number().positive("Amount must be greater than 0"),
  });

// Invoice schema with line items
export const insertInvoiceSchema = createInsertSchema(invoices)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    lineItems: z.array(insertLineItemSchema),
    dueDate: z.string().transform((date) => new Date(date)),
    template: z.enum(["modern", "professional", "creative"]).default("modern"),
  });

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({
    id: true,
  })
  .extend({
    amount: z.number().positive("Amount must be greater than 0"),
    date: z.string().transform((date) => new Date(date)),
  });

export const insertBusinessSettingsSchema = createInsertSchema(businessSettings)
  .omit({
    id: true,
    updatedAt: true,
  })
  .extend({
    logo: z.string().optional(),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertLineItem = z.infer<typeof insertLineItemSchema>;
export type User = typeof users.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type LineItem = typeof lineItems.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type BusinessSettings = typeof businessSettings.$inferSelect;
export type InsertBusinessSettings = z.infer<typeof insertBusinessSettingsSchema>;