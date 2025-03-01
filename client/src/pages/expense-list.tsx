import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Plus, Pencil, Trash2, Filter, X, Tag, Calendar, DollarSign, Search, FileText, Building2, ShoppingBag, Briefcase, Wifi, Wrench, CreditCard, Coffee, Car, TrendingUp } from "lucide-react";
import type { Expense } from "@shared/schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ExpenseForm } from "@/components/expense-form";

const EXPENSE_CATEGORIES = [
  "All",
  "Office Supplies",
  "Travel",
  "Software",
  "Hardware",
  "Marketing",
  "Professional Services",
  "Utilities",
  "Food & Drinks",
  "Transportation",
  "Other",
] as const;

// Updated category icons mapping with Wrench instead of Tool
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Office Supplies": <ShoppingBag className="h-4 w-4" />,
  "Travel": <Car className="h-4 w-4" />,
  "Software": <Wrench className="h-4 w-4" />,
  "Hardware": <Wrench className="h-4 w-4" />,
  "Marketing": <Briefcase className="h-4 w-4" />,
  "Professional Services": <Building2 className="h-4 w-4" />,
  "Utilities": <Wifi className="h-4 w-4" />,
  "Food & Drinks": <Coffee className="h-4 w-4" />,
  "Transportation": <Car className="h-4 w-4" />,
  "Other": <CreditCard className="h-4 w-4" />,
};

export default function ExpenseList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    category: "All",
    search: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses/1"],
  });

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

  const filteredExpenses = expenses?.filter((expense) => {
    const expenseDate = new Date(expense.date);
    expenseDate.setHours(0, 0, 0, 0);

    if (filters.category !== "All" && expense.category !== filters.category) return false;
    if (filters.search && !expense.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.minAmount && Number(expense.amount) < Number(filters.minAmount)) return false;
    if (filters.maxAmount && Number(expense.amount) > Number(filters.maxAmount)) return false;

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (expenseDate < startDate) return false;
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (expenseDate > endDate) return false;
    }

    return true;
  });

  // Calculate summary statistics
  const totalExpenses = filteredExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const averageExpense = filteredExpenses?.length 
    ? totalExpenses / filteredExpenses.length 
    : 0;

  const resetFilters = () => {
    setFilters({
      category: "All",
      search: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">All Expenses</h1>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">{filteredExpenses?.length || 0} expenses</p>
          </div>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Average Expense</h3>
              <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">${averageExpense.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">per transaction</p>
          </div>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Most Common Category</h3>
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Tag className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {filteredExpenses?.length ? 
                Object.entries(
                  filteredExpenses.reduce((acc, exp) => ({
                    ...acc,
                    [exp.category]: (acc[exp.category] || 0) + 1
                  }), {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1])[0][0]
                : "N/A"}
            </p>
            <p className="text-sm text-gray-500 mt-1">most frequent</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-5 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filters
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger className="bg-white hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        {CATEGORY_ICONS[category] || <CreditCard className="h-4 w-4" />}
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Search description
              </label>
              <Input
                placeholder="Search description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="bg-white hover:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Amount range
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  className="bg-white hover:border-primary/50 transition-colors"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  className="bg-white hover:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Start date
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="bg-white hover:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                End date
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="bg-white hover:border-primary/50 transition-colors"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-8 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Add New Expense</h2>
          </div>
          <ExpenseForm />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredExpenses?.map((expense) => (
          <Card key={expense.id} className="p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{expense.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                    {CATEGORY_ICONS[expense.category] || <CreditCard className="h-3 w-3" />}
                    {expense.category}
                  </Badge>
                  {expense.subCategory && (
                    <>
                      <span className="text-xs text-gray-400">→</span>
                      <Badge variant="outline" className="text-xs hover:bg-gray-100">
                        {expense.subCategory}
                      </Badge>
                    </>
                  )}
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
                {expense.categoryExplanation && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {expense.categoryExplanation}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 mr-4 flex items-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                  {Number(expense.amount).toFixed(2)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/edit-expense/${expense.id}`)}
                  className="border-gray-200 hover:border-primary/50 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 hover:border-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
                        className="bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}

        {filteredExpenses?.length === 0 && (
          <div className="text-center py-12 col-span-2">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No expenses found</p>
            <Button
              className="mt-4 bg-gradient-to-r from-primary to-[#22c55e] hover:from-primary/90 hover:to-[#22c55e]/90 transition-all duration-200"
              onClick={() => {
                const form = document.querySelector('form');
                if (form) {
                  form.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first expense
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}