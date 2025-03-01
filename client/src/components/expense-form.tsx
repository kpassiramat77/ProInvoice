import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function ExpenseForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const [aiSuggestion, setAiSuggestion] = React.useState<{
    mainCategory: string;
    subCategory: string;
    confidence: number;
    explanation: string;
  } | null>(null);

  const form = useForm({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "Other",
      date: new Date().toISOString().split('T')[0],
      userId: 1, // Mock user ID
    },
  });

  const watchDescription = form.watch("description");

  // AI categorization mutation
  const categorizeMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest("POST", "/api/expenses/categorize", { description });
      return response.json();
    },
    onSuccess: (data) => {
      setAiSuggestion(data);
      form.setValue("category", data.mainCategory);
      form.setValue("subCategory", data.subCategory);
    },
  });

  // Debounced AI categorization
  React.useEffect(() => {
    if (!watchDescription) return;

    const timer = setTimeout(() => {
      categorizeMutation.mutate(watchDescription);
    }, 500);

    return () => clearTimeout(timer);
  }, [watchDescription]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/expenses", {
        ...data,
        amount: Number(data.amount),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/1"] });
      toast({
        title: "Success",
        description: "Your expense has been recorded successfully.",
      });
      form.reset();
      setAiSuggestion(null);
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex w-full justify-between p-2"
        >
          <span className="font-medium">
            {isOpen ? "Close Expense Form" : "Add New Expense"}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} placeholder="Enter expense description" />
                        {categorizeMutation.isPending && (
                          <Brain className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground animate-pulse" />
                        )}
                      </div>
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
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="0.00"
                      />
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
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {aiSuggestion && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {aiSuggestion.mainCategory}
                  </Badge>
                  <span className="text-sm text-muted-foreground">→</span>
                  <Badge variant="outline">{aiSuggestion.subCategory}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {aiSuggestion.explanation} ({Math.round(aiSuggestion.confidence * 100)}% confidence)
                </p>
              </div>
            )}

            <Button
              type="submit"
              className={cn(
                "w-full",
                mutation.isPending && "opacity-50 cursor-not-allowed"
              )}
              disabled={mutation.isPending}
            >
              <Brain className="mr-2 h-4 w-4" />
              {mutation.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </form>
        </Form>
      </CollapsibleContent>
    </Collapsible>
  );
}