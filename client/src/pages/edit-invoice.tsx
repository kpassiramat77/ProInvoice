import React from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInvoiceSchema } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { FileText, Plus, Trash2 } from "lucide-react";

export default function EditInvoice({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing invoice data
  const { data: invoice, isLoading } = useQuery({
    queryKey: [`/api/invoices/edit/${params.id}`],
  });

  const form = useForm({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      clientName: "",
      invoiceNumber: "",
      description: "",
      status: "pending",
      dueDate: "",
      userId: 1,
      template: "modern",
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

  const watchLineItems = form.watch("lineItems") || [];
  const totalAmount = watchLineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Update form when invoice data is loaded
  React.useEffect(() => {
    if (invoice) {
      form.reset({
        ...invoice,
        dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
        lineItems: invoice.lineItems.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          amount: Number(item.amount)
        }))
      });
    }
  }, [invoice, form]);

  const updateLineItemAmount = (index: number) => {
    const lineItem = watchLineItems[index];
    if (lineItem) {
      const amount = (Number(lineItem.quantity) || 0) * (Number(lineItem.unitPrice) || 0);
      form.setValue(`lineItems.${index}.amount`, amount);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/invoices/${params.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices/1"] });
      toast({
        title: "Invoice updated",
        description: "Your invoice has been updated successfully.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Edit Invoice</h1>
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

                  {/* Line Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Line Items</h3>
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
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className="space-y-4 p-4 bg-gray-50 rounded-lg relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>

                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-white" placeholder="Item description" />
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
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="1"
                                    min="1"
                                    className="bg-white"
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
                                <FormLabel>Unit Price</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="bg-white"
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
                                <FormLabel>Amount</FormLabel>
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
                    className="w-full bg-gradient-to-r from-primary to-[#22c55e] hover:from-primary/90 hover:to-[#22c55e]/90"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Updating..." : "Update Invoice"}
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
              <InvoicePreview
                invoice={{
                  ...form.getValues(),
                  id: Number(params.id),
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