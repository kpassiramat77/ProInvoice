import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Plus, Pencil, Trash2, Filter, X } from "lucide-react";
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
  "Other",
] as const;

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
    queryKey: ["/api/expenses/1"], // Mock user ID = 1
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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">All Expenses</h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </h2>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search description</label>
              <Input
                placeholder="Search description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-4">
          <ExpenseForm />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredExpenses?.map((expense) => (
          <Card key={expense.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{expense.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{expense.category}</Badge>
                  {expense.subCategory && (
                    <>
                      <span className="text-xs text-gray-400">→</span>
                      <Badge variant="outline" className="text-xs">
                        {expense.subCategory}
                      </Badge>
                    </>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
                {expense.categoryExplanation && (
                  <p className="text-xs text-gray-500 mt-1">
                    {expense.categoryExplanation}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 mr-4">
                  ${Number(expense.amount).toFixed(2)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/edit-expense/${expense.id}`)}
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
          </Card>
        ))}

        {filteredExpenses?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No expenses recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}