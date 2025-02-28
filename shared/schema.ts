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
  description: text("description").notNull(),
  amount: decimal("amount").notNull(),
  status: text("status").notNull(), // pending, paid, overdue
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
});

// Extend the insert schemas with proper validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    amount: z.number().positive("Amount must be greater than 0"),
    dueDate: z.string().transform((date) => new Date(date)),
  });

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({
    id: true,
  })
  .extend({
    amount: z.number().positive("Amount must be greater than 0"),
    date: z.string().transform((date) => new Date(date)),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type User = typeof users.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Expense = typeof expenses.$inferSelect;