import React from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
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
import { FileText, Plus, Trash2, Mail, UserPlus, Calendar, Receipt, Palette, DollarSign, Tag, Percent } from "lucide-react";

const defaultDueDate = new Date();
defaultDueDate.setDate(defaultDueDate.getDate() + 30);

export default function CreateInvoice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${Date.now()}`,
      description: "",
      status: "pending",
      dueDate: defaultDueDate.toISOString().split('T')[0],
      userId: 1,
      template: "modern",
      taxRate: 0,
      lineItems: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          amount: 0,
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const watchLineItems = form.watch("lineItems");
  const taxRate = form.watch("taxRate");
  const totalAmount = watchLineItems.reduce((sum, item) => sum + (item.amount || 0), 0);


  const updateLineItemAmount = (index: number) => {
    const lineItem = watchLineItems[index];
    const amount = (lineItem.quantity || 0) * (lineItem.unitPrice || 0);
    form.setValue(`lineItems.${index}.amount`, amount);
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/invoices", data);
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
          <div className="lg:order-1 order-2">
            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">             <FormField
                    control={form.control}
                    name="template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <Palette className="h-4 w-4 text-primary" />
                          Template Style
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-white hover:border-primary/50 transition-colors">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-gray-700">
                            <UserPlus className="h-4 w-4 text-primary" />
                            Client Name
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white hover:border-primary/50 transition-colors" placeholder="Enter client name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-gray-700">
                            <Mail className="h-4 w-4 text-primary" />
                            Client Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              className="bg-white hover:border-primary/50 transition-colors"
                              placeholder="Enter client email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4 text-primary" />
                          Due Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-white hover:border-primary/50 transition-colors"
                            {...field}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({
                          description: "",
                          quantity: 1,
                          unitPrice: 0,
                          amount: 0,
                        })}
                        className="hover:border-primary/50 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    {/* Tax Rate Field */}
                    <div className="p-4 bg-gray-50 rounded-lg relative hover:bg-gray-100/80 transition-colors">
                      <FormField
                        control={form.control}
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-gray-700">
                              <Percent className="h-4 w-4 text-primary" />
                              Tax Rate (%)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                className="bg-white hover:border-primary/50 transition-colors"
                                {...field}
                                onChange={(e) => {
                                  // Convert percentage to decimal (e.g., 10% -> 0.1)
                                  const value = Number(e.target.value) / 100;
                                  field.onChange(value);
                                }}
                                value={Number(field.value * 100)} // Convert decimal to percentage for display
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className="space-y-4 p-4 bg-gray-50 rounded-lg relative hover:bg-gray-100/80 transition-colors">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 hover:text-red-600 transition-colors"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-gray-700">
                                <Tag className="h-4 w-4 text-primary" />
                                Description
                              </FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-white hover:border-primary/50 transition-colors" placeholder="Item description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 text-gray-700">
                                  <Percent className="h-4 w-4 text-primary" />
                                  Quantity
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="1"
                                    min="1"
                                    className="bg-white hover:border-primary/50 transition-colors"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(Number(e.target.value));
                                      updateLineItemAmount(index);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 text-gray-700">
                                  <DollarSign className="h-4 w-4 text-primary" />
                                  Unit Price
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="bg-white hover:border-primary/50 transition-colors"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(Number(e.target.value));
                                      updateLineItemAmount(index);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.amount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 text-gray-700">
                                  <DollarSign className="h-4 w-4 text-primary" />
                                  Amount
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className="bg-white"
                                    {...field}
                                    disabled
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-4 border-t">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          ${totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-[#22c55e] hover:from-primary/90 hover:to-[#22c55e]/90 transition-all duration-200"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Creating..." : "Create Invoice"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>

          <div className="lg:order-2 order-1 lg:sticky lg:top-24 lg:self-start">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Preview</h2>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl shadow-2xl transition-shadow hover:shadow-2xl">
              <InvoicePreview
                invoice={{
                  ...form.getValues(),
                  id: 0,
                  createdAt: new Date(),
                  lineItems: watchLineItems,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}