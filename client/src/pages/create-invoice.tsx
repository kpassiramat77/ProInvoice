import React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInvoiceSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InvoicePreview } from "@/components/invoice-preview";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { templates } from "@/lib/invoice-templates";
import { FileText } from "lucide-react";

const defaultDueDate = new Date();
defaultDueDate.setDate(defaultDueDate.getDate() + 30);

export default function CreateInvoice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      clientName: "",
      invoiceNumber: `INV-${Date.now()}`,
      description: "",
      amount: 0,
      status: "pending",
      dueDate: defaultDueDate.toISOString().split('T')[0],
      userId: 1, // Mock user ID
      template: "modern",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/invoices", {
        ...data,
        amount: Number(data.amount),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices/1"] });
      toast({
        title: "Invoice created",
        description: "Your invoice has been generated successfully.",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formValues = form.watch();
  const previewData = {
    ...formValues,
    id: 0,
    createdAt: new Date(),
    amount: Number(formValues.amount) || 0,
    dueDate: new Date(formValues.dueDate),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Create New Invoice</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="lg:order-1 order-2">
            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit((data) => mutation.mutate(data))} 
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Style</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(templates).map(([id, template]) => (
                              <SelectItem key={id} value={id}>
                                {template.name} - {template.description}
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
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white" placeholder="Enter client name" />
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
                            className="bg-white"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-white"
                            placeholder="Enter description or let AI generate one" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="bg-white"
                            {...field}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-[#22c55e] hover:from-primary/90 hover:to-[#22c55e]/90"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Creating..." : "Create Invoice"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:order-2 order-1 lg:sticky lg:top-24 lg:self-start">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preview</h2>
            </div>
            <div className="overflow-hidden rounded-xl shadow-2xl">
              <InvoicePreview invoice={previewData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}