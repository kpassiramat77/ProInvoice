import { type User, type Invoice, type Expense, type BusinessSettings, type InsertUser, type InsertInvoice, type InsertExpense, type InsertBusinessSettings, type LineItem } from "@shared/schema";
import { db } from "./db";
import { users, invoices, expenses, businessSettings, lineItems } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice & { lineItems: LineItem[] }>;
  getInvoice(id: number): Promise<(Invoice & { lineItems: LineItem[] }) | undefined>;
  getInvoicesByUserId(userId: number): Promise<(Invoice & { lineItems: LineItem[] })[]>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice>;
  updateInvoice(id: number, invoice: InsertInvoice): Promise<Invoice & { lineItems: LineItem[] }>;
  deleteInvoice(id: number): Promise<void>;

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

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice & { lineItems: LineItem[] }> {
    // Start a transaction to insert both invoice and line items
    return await db.transaction(async (tx) => {
      // Insert the invoice first
      const [invoice] = await tx
        .insert(invoices)
        .values({
          userId: insertInvoice.userId,
          clientName: insertInvoice.clientName,
          invoiceNumber: insertInvoice.invoiceNumber,
          description: insertInvoice.description,
          status: insertInvoice.status,
          dueDate: insertInvoice.dueDate,
          template: insertInvoice.template,
          createdAt: new Date(),
        })
        .returning();

      // Insert line items with the new invoice ID
      const items = await Promise.all(
        insertInvoice.lineItems.map(async (item) => {
          const [lineItem] = await tx
            .insert(lineItems)
            .values({
              invoiceId: invoice.id,
              description: item.description,
              quantity: item.quantity.toString(),
              unitPrice: item.unitPrice.toString(),
              amount: item.amount.toString(),
            })
            .returning();
          return lineItem;
        })
      );

      return { ...invoice, lineItems: items };
    });
  }

  async getInvoice(id: number): Promise<(Invoice & { lineItems: LineItem[] }) | undefined> {
    const invoice = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (!invoice.length) return undefined;

    const items = await db.select().from(lineItems).where(eq(lineItems.invoiceId, id));
    return { ...invoice[0], lineItems: items };
  }

  async getInvoicesByUserId(userId: number): Promise<(Invoice & { lineItems: LineItem[] })[]> {
    const userInvoices = await db.select().from(invoices).where(eq(invoices.userId, userId));

    const invoicesWithItems = await Promise.all(
      userInvoices.map(async (invoice) => {
        const items = await db.select().from(lineItems).where(eq(lineItems.invoiceId, invoice.id));
        return { ...invoice, lineItems: items };
      })
    );

    return invoicesWithItems;
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

  async updateInvoice(id: number, updateData: InsertInvoice): Promise<Invoice & { lineItems: LineItem[] }> {
    return await db.transaction(async (tx) => {
      // Update the invoice
      const [invoice] = await tx
        .update(invoices)
        .set({
          clientName: updateData.clientName,
          description: updateData.description,
          status: updateData.status,
          dueDate: updateData.dueDate,
          template: updateData.template,
        })
        .where(eq(invoices.id, id))
        .returning();

      if (!invoice) throw new Error("Invoice not found");

      // Delete existing line items
      await tx.delete(lineItems).where(eq(lineItems.invoiceId, id));

      // Insert new line items
      const items = await Promise.all(
        updateData.lineItems.map(async (item) => {
          const [lineItem] = await tx
            .insert(lineItems)
            .values({
              invoiceId: id,
              description: item.description,
              quantity: item.quantity.toString(),
              unitPrice: item.unitPrice.toString(),
              amount: item.amount.toString(),
            })
            .returning();
          return lineItem;
        })
      );

      return { ...invoice, lineItems: items };
    });
  }

  async deleteInvoice(id: number): Promise<void> {
    return await db.transaction(async (tx) => {
      // Delete line items first due to foreign key constraint
      await tx.delete(lineItems).where(eq(lineItems.invoiceId, id));
      // Then delete the invoice
      await tx.delete(invoices).where(eq(invoices.id, id));
    });
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