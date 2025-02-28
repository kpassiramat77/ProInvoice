import { type ReactNode } from "react";
import { type Invoice } from "@shared/schema";
import { cn } from "@/lib/utils";

export interface InvoiceTemplateProps {
  invoice: Invoice;
  className?: string;
}

// Modern template with clean lines and minimalist design
export function ModernTemplate({ invoice, className }: InvoiceTemplateProps) {
  return (
    <div className={cn("bg-white p-8 rounded-lg shadow-lg", className)}>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">INVOICE</h1>
          <p className="text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-gray-800">Due Date</p>
          <p className="text-gray-600">{new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Bill To:</h2>
        <p className="text-xl text-gray-800">{invoice.clientName}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{invoice.description}</p>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-500">Created on {new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Amount Due</p>
          <p className="text-3xl font-bold text-gray-800">${Number(invoice.amount).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

// Professional template with traditional business styling
export function ProfessionalTemplate({ invoice, className }: InvoiceTemplateProps) {
  return (
    <div className={cn("bg-white p-8 rounded-lg shadow-lg", className)}>
      <div className="border-b-2 border-blue-600 pb-4 mb-6">
        <h1 className="text-3xl font-serif text-blue-800">INVOICE</h1>
        <div className="flex justify-between mt-2">
          <p className="text-gray-600">Invoice #: {invoice.invoiceNumber}</p>
          <p className="text-gray-600">Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-serif text-blue-800 mb-2">From</h2>
          <p className="text-gray-700">Your Company Name</p>
          <p className="text-gray-600">123 Business Street</p>
          <p className="text-gray-600">Business City, ST 12345</p>
        </div>
        <div>
          <h2 className="text-lg font-serif text-blue-800 mb-2">Bill To</h2>
          <p className="text-gray-700">{invoice.clientName}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-serif text-blue-800 mb-2">Description</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-gray-700 whitespace-pre-wrap">{invoice.description}</p>
        </div>
      </div>

      <div className="border-t-2 border-blue-600 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-serif text-blue-800">Total Amount</p>
            <p className="text-2xl font-bold text-gray-800">${Number(invoice.amount).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Creative template with modern artistic elements
export function CreativeTemplate({ invoice, className }: InvoiceTemplateProps) {
  return (
    <div className={cn("bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-lg shadow-lg", className)}>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            INVOICE
          </h1>
          <p className="text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-gray-800">Due Date</p>
          <p className="text-gray-600">{new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">For</h2>
        <p className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {invoice.clientName}
        </p>
      </div>

      <div className="mb-8 bg-white bg-opacity-50 p-6 rounded-lg backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Project Details</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{invoice.description}</p>
      </div>

      <div className="flex justify-between items-center pt-6">
        <div>
          <p className="text-sm text-gray-500">Created {new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Due</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ${Number(invoice.amount).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

export const templates = {
  modern: {
    name: "Modern",
    component: ModernTemplate,
    description: "Clean and minimalist design",
  },
  professional: {
    name: "Professional",
    component: ProfessionalTemplate,
    description: "Traditional business styling",
  },
  creative: {
    name: "Creative",
    component: CreativeTemplate,
    description: "Artistic and modern elements",
  },
} as const;

export type TemplateId = keyof typeof templates;
