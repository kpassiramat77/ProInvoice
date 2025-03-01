import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Expense, insertExpenseSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Calendar, Tag, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

const EXPENSE_CATEGORIES = [
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

export default function EditExpense({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expense, isLoading } = useQuery({
    queryKey: ["/api/expenses", params.id],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/expenses/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch expense");
        const data = await response.json();
        return {
          ...data,
          amount: Number(data.amount), // Convert to number when receiving
          date: new Date(data.date).toISOString().split('T')[0],
        };
      } catch (error) {
        console.error("Error fetching expense:", error);
        throw new Error("Failed to fetch expense data");
      }
    },
  });

  const form = useForm<Expense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      description: "",
      amount: 0, // Set default as number
      category: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  React.useEffect(() => {
    if (expense) {
      form.reset(expense);
    }
  }, [expense, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: Expense) => {
      const response = await apiRequest("PATCH", `/api/expenses/${params.id}`, {
        ...data,
        amount: Number(data.amount), // Ensure amount is number before sending
        date: new Date(data.date).toISOString(),
      });
      if (!response.ok) throw new Error("Failed to update expense");
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

  if (isLoading) {
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
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value || 0}
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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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