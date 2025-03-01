import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Expense, insertExpenseSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Calendar, Tag, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

export default function EditExpense({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching expense data
  const { data: expense, isLoading: isLoadingExpense } = useQuery<Expense>({
    queryKey: ["/api/expenses", params.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/expenses/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch expense");
      return response.json();
    },
  });

  // Form setup with proper types
  const form = useForm<Expense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date().toLocaleDateString('en-CA'), // Format: YYYY-MM-DD
      userId: 1,
    },
  });

  // Update form when expense data is loaded
  React.useEffect(() => {
    if (expense) {
      form.reset({
        ...expense,
        date: new Date(expense.date).toLocaleDateString('en-CA'),
      });
    }
  }, [expense, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Expense) => {
      const response = await apiRequest("PATCH", `/api/expenses/${params.id}`, {
        ...data,
        amount: String(data.amount), // Ensure amount is sent as string
      });
      if (!response.ok) {
        throw new Error("Failed to update expense");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense updated successfully.",
      });
      setLocation("/expenses");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense.",
        variant: "destructive",
      });
    },
  });

  if (isLoadingExpense) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <Button
        variant="ghost"
        onClick={() => setLocation("/expenses")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Expenses
      </Button>

      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Expense</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter description" className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Amount
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Category
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter category" className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className={cn(
                "w-full bg-gradient-to-r from-primary to-[#22c55e] hover:from-primary/90 hover:to-[#22c55e]/90",
                updateMutation.isPending && "opacity-50 cursor-not-allowed"
              )}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Expense"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}