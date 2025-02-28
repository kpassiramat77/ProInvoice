import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expense-form";
import type { Invoice, Expense } from "@shared/schema";

export default function Dashboard() {
  const { data: invoices, isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices/1"], // Mock user ID = 1
  });

  const { data: expenses, isLoading: loadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses/1"], // Mock user ID = 1
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/create-invoice">
          <Button>Create New Invoice</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
          {loadingInvoices ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {invoices?.map((invoice) => (
                <Card key={invoice.id} className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{invoice.clientName}</p>
                      <p className="text-sm text-gray-500">
                        #{invoice.invoiceNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${invoice.amount}</p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Expenses</h2>
          <Card className="p-6">
            <ExpenseForm />
            
            {loadingExpenses ? (
              <div>Loading...</div>
            ) : (
              <div className="mt-6 space-y-2">
                {expenses?.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                    </div>
                    <p className="font-bold">${expense.amount}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
