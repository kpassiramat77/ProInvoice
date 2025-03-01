import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expense-form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  FileText,
  TrendingUp,
  Pencil,
  Trash2,
  Plus,
  Filter,
  Download,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Add this mutation inside the Dashboard component
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      const response = await apiRequest("DELETE", `/api/expenses/${expenseId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/1"] });
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
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
    <div className="container mx-auto py-8 px-6">
      {/* Header with Quick Actions */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-200 hover:border-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter your transactions</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-200 hover:border-gray-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export your data</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/create-invoice">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new invoice</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Summary Cards with enhanced visuals */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium tracking-tight">Total Invoices</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="metric-value text-gray-900">${totalInvoices.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1 tracking-tight">
              {invoices?.length || 0} active invoices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium tracking-tight">Total Expenses</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="metric-value text-gray-900">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1 tracking-tight">
              {expenses?.length || 0} recorded expenses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium tracking-tight">Net Profit</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`metric-value ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${profit.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 mt-1 tracking-tight">Current balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Invoices Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/invoices")} className="text-gray-600 hover:text-gray-900">
              View all
            </Button>
          </div>

          {loadingInvoices ? (
            <LoadingSkeleton />
          ) : invoices?.length === 0 ? (
            <Card className="py-10 px-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-sm text-gray-500 mb-4">Create your first invoice to get started</p>
              <Link href="/create-invoice">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {invoices?.map((invoice) => {
                const invoiceTotal = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
                return (
                  <Card key={invoice.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-5">
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
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/edit-invoice/${invoice.id}`)}
                              className="border-gray-200 hover:border-gray-300"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-200 hover:border-gray-300"
                                >
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
            </div>
          )}
        </div>

        {/* Expenses Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Expenses</h2>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/expenses")} className="text-gray-600 hover:text-gray-900">
              View all
            </Button>
          </div>

          <Card className="bg-white shadow-sm">
            <div className="p-5">
              <ExpenseForm />

              {loadingExpenses ? (
                <LoadingSkeleton />
              ) : expenses?.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses recorded</h3>
                  <p className="text-sm text-gray-500">
                    Add your first expense using the form above
                  </p>
                </div>
              ) : (
                <div className="mt-6 divide-y divide-gray-100">
                  {expenses?.map((expense) => (
                    <div
                      key={expense.id}
                      className="py-3 first:pt-0 last:pb-0 hover:bg-gray-50 -mx-5 px-5 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{expense.category}</Badge>
                            {expense.subCategory && (
                              <>
                                <span className="text-xs text-gray-400">→</span>
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                  {expense.subCategory}
                                </Badge>
                              </>
                            )}
                            <span className="text-xs text-gray-500 ml-1.5">
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <p className="font-semibold text-gray-900 tabular-nums">
                            ${Number(expense.amount).toFixed(2)}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setLocation(`/edit-expense/${expense.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this expense? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteExpenseMutation.mutate(expense.id)}
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
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}