import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { FileText, Plus, Pencil, Trash2, Filter, X, Mail, Clock, Check, AlertTriangle, Search, Calendar, DollarSign } from "lucide-react";
import type { Invoice } from "@shared/schema";
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

const INVOICE_STATUSES = ["all", "pending", "paid", "overdue"] as const;
const INVOICE_STATUS_OPTIONS = ["pending", "paid", "overdue"] as const;

export default function InvoiceList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });

  const { data: invoices, isLoading } = useQuery<(Invoice & { lineItems: Array<{ amount: number }> })[]>({
    queryKey: ["/api/invoices/1"],
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/invoices/${id}/status`, { status });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices/1"] });
      toast({
        title: "Status updated",
        description: "The invoice status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const emailInvoiceMutation = useMutation({
    mutationFn: async ({ id, email }: { id: number; email: string }) => {
      const response = await apiRequest("POST", `/api/invoices/${id}/email`, { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email sent",
        description: "Invoice has been sent to the client.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send email. Please check the SendGrid API key is configured.",
        variant: "destructive",
      });
    },
  });

  const filteredInvoices = invoices?.filter((invoice) => {
    const invoiceTotal = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const invoiceDate = new Date(invoice.dueDate);
    invoiceDate.setHours(0, 0, 0, 0);

    if (filters.status !== "all" && invoice.status !== filters.status) return false;
    if (filters.search && !invoice.clientName.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.minAmount && invoiceTotal < Number(filters.minAmount)) return false;
    if (filters.maxAmount && invoiceTotal > Number(filters.maxAmount)) return false;

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (invoiceDate < startDate) return false;
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (invoiceDate > endDate) return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilters({
      status: "all",
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
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">All Invoices</h1>
        </div>
        <Link href="/create-invoice">
          <Button className="bg-gradient-to-r from-primary to-[#22c55e] hover:from-primary/90 hover:to-[#22c55e]/90 transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </Link>
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
                <Filter className="h-4 w-4 text-primary" />
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="bg-white hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Search by client
              </label>
              <Input
                placeholder="Search client name..."
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
              <div className="flex gap-3">
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

      <div className="space-y-4">
        {filteredInvoices?.map((invoice) => {
          const invoiceTotal = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
          return (
            <Card key={invoice.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.clientName}</p>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      #{invoice.invoiceNumber}
                    </p>
                    {invoice.clientEmail && (
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {invoice.clientEmail}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`status-label inline-flex items-center ${
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {invoice.status === 'paid' && <Check className="h-3 w-3 mr-1" />}
                        {invoice.status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                      <Select
                        value={invoice.status}
                        onValueChange={(value) => updateStatusMutation.mutate({ id: invoice.id, status: value })}
                      >
                        <SelectTrigger className="h-7 w-32 bg-white hover:border-primary/50 transition-colors">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          {INVOICE_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">${invoiceTotal.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/edit-invoice/${invoice.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 hover:border-primary/50 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
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
                            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this invoice? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                              className="bg-red-500 hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {invoice.clientEmail && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 hover:border-primary/50 transition-colors"
                          onClick={() => emailInvoiceMutation.mutate({
                            id: invoice.id,
                            email: invoice.clientEmail
                          })}
                          disabled={emailInvoiceMutation.isPending}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredInvoices?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
            <Link href="/create-invoice">
              <Button className="mt-4 bg-gradient-to-r from-primary to-[#22c55e] hover:from-primary/90 hover:to-[#22c55e]/90 transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Create your first invoice
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}