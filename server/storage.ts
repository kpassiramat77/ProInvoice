import { type User, type Invoice, type Expense, type BusinessSettings, type InsertUser, type InsertInvoice, type InsertExpense, type InsertBusinessSettings } from "@shared/schema";
import { db } from "./db";
import { users, invoices, expenses, businessSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

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

  // Business Settings operations
  getBusinessSettings(userId: number): Promise<BusinessSettings | undefined>;
  updateBusinessSettings(settings: InsertBusinessSettings): Promise<BusinessSettings>;
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
      .values({
        ...insertInvoice,
        amount: insertInvoice.amount.toString(),
        createdAt: new Date()
      })
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
      .values({
        ...insertExpense,
        amount: insertExpense.amount.toString()
      })
      .returning();
    return expense;
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.userId, userId));
  }

  async getBusinessSettings(userId: number): Promise<BusinessSettings | undefined> {
    const [settings] = await db
      .select()
      .from(businessSettings)
      .where(eq(businessSettings.userId, userId));
    return settings;
  }

  async updateBusinessSettings(settings: InsertBusinessSettings): Promise<BusinessSettings> {
    const [existing] = await db
      .select()
      .from(businessSettings)
      .where(eq(businessSettings.userId, settings.userId));

    if (existing) {
      const [updated] = await db
        .update(businessSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(businessSettings.userId, settings.userId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(businessSettings)
      .values({ ...settings, updatedAt: new Date() })
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();