import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expense-form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, FileText, TrendingUp, Pencil, Trash2 } from "lucide-react";
import type { Invoice, Expense } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading: loadingInvoices } = useQuery<(Invoice & { lineItems: Array<{ amount: number }> })[]>({
    queryKey: ["/api/invoices/1"], // Mock user ID = 1
  });

  const { data: expenses, isLoading: loadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses/1"], // Mock user ID = 1
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await apiRequest("DELETE", `/api/invoices/${invoiceId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices/1"] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate totals from line items
  const totalInvoices = invoices?.reduce((sum, invoice) => {
    const invoiceTotal = invoice.lineItems.reduce((itemSum, item) => itemSum + Number(item.amount), 0);
    return sum + invoiceTotal;
  }, 0) || 0;

  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const profit = totalInvoices - totalExpenses;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link href="/create-invoice">
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create New Invoice
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalInvoices.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">
              {invoices?.length || 0} active invoices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">
              {expenses?.length || 0} recorded expenses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${profit.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 mt-1">Current balance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Invoices Section */}
        <div>
          <h2 className="text-lg font-medium mb-4">Recent Invoices</h2>
          {loadingInvoices ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-3">
              {invoices?.map((invoice) => {
                const invoiceTotal = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
                return (
                  <Card key={invoice.id} className="bg-white hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.clientName}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            #{invoice.invoiceNumber}
                          </p>
                          <div className="mt-2">
                            <InvoiceStatusBadge status={invoice.status} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">${invoiceTotal.toFixed(2)}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/edit-invoice/${invoice.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this invoice? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {invoices?.length === 0 && (
                <p className="text-center text-gray-500 py-4">No invoices found</p>
              )}
            </div>
          )}
        </div>

        {/* Expenses Section */}
        <div>
          <h2 className="text-lg font-medium mb-4">Expenses</h2>
          <Card className="bg-white">
            <div className="p-4">
              <ExpenseForm />

              {loadingExpenses ? (
                <LoadingSkeleton />
              ) : (
                <div className="mt-6 space-y-2">
                  {expenses?.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{expense.category}</Badge>
                          {expense.subCategory && (
                            <>
                              <span className="text-xs text-gray-400">→</span>
                              <Badge variant="outline" className="text-xs">{expense.subCategory}</Badge>
                            </>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">${Number(expense.amount).toFixed(2)}</p>
                    </div>
                  ))}
                  {expenses?.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No expenses recorded</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}