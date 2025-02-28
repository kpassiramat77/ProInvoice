import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expense-form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, FileText, TrendingUp } from "lucide-react";
import type { Invoice, Expense } from "@shared/schema";

function InvoiceStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
  };

  return (
    <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export default function Dashboard() {
  const { data: invoices, isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices/1"], // Mock user ID = 1
  });

  const { data: expenses, isLoading: loadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses/1"], // Mock user ID = 1
  });

  // Calculate totals
  const totalInvoices = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const profit = totalInvoices - totalExpenses;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/create-invoice">
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create New Invoice
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInvoices.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices?.length || 0} active invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {expenses?.length || 0} recorded expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${profit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current balance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Invoices Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
          {loadingInvoices ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-4">
              {invoices?.map((invoice) => (
                <Card key={invoice.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-lg">{invoice.clientName}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        #{invoice.invoiceNumber}
                      </p>
                      <InvoiceStatusBadge status={invoice.status} />
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">${invoice.amount}</p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {invoices?.length === 0 && (
                <p className="text-center text-gray-500 py-4">No invoices found</p>
              )}
            </div>
          )}
        </div>

        {/* Expenses Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Expenses</h2>
          <Card className="p-6">
            <ExpenseForm />

            {loadingExpenses ? (
              <LoadingSkeleton />
            ) : (
              <div className="mt-6 space-y-4">
                {expenses?.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{expense.category}</Badge>
                        <p className="text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-lg">${expense.amount}</p>
                  </div>
                ))}
                {expenses?.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No expenses recorded</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}