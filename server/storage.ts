import { type User, type Invoice, type Expense, type InsertUser, type InsertInvoice, type InsertExpense } from "@shared/schema";
import { db } from "./db";
import { users, invoices, expenses } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User as DrizzleUser, Invoice as DrizzleInvoice, Expense as DrizzleExpense, InsertUser as DrizzleInsertUser, InsertInvoice as DrizzleInsertInvoice, InsertExpense as DrizzleInsertExpense } from "@shared/schema";


export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice>;

  // Expense operations
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpensesByUserId(userId: number): Promise<Expense[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values({ ...insertInvoice, createdAt: new Date() })
      .returning();
    return invoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.userId, userId));
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ status })
      .where(eq(invoices.id, id))
      .returning();

    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.userId, userId));
  }
}

export const storage = new DatabaseStorage();