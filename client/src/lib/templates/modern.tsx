import { type ReactNode } from "react";
import { type Invoice } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useBusinessInfo } from "./index";
import type { InvoiceTemplateProps } from "../invoice-templates";

export function ModernTemplate({ invoice, className }: InvoiceTemplateProps) {
  const businessInfo = useBusinessInfo();
  const totalAmount = invoice.lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className={cn("bg-white p-6 max-w-4xl mx-auto", className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            {businessInfo?.logo && (
              <img 
                src={businessInfo.logo} 
                alt="Business logo" 
                className="h-10 w-auto mb-2 object-contain"
              />
            )}
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-[#1e3a8a]">INVOICE</h1>
            <p className="text-sm text-gray-600">#INV-{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Invoice Info Grid */}
      <div className="grid grid-cols-2 gap-x-8 mb-8">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">From</p>
          {businessInfo ? (
            <div className="space-y-0.5 text-sm">
              <p className="font-medium">{businessInfo.businessName}</p>
              <p className="text-gray-600">{businessInfo.address}</p>
              <p className="text-gray-600">
                {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
              </p>
              {businessInfo.phone && <p className="text-gray-600">{businessInfo.phone}</p>}
              {businessInfo.email && <p className="text-gray-600">{businessInfo.email}</p>}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No business information set</p>
          )}
        </div>
        <div>
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Bill To</p>
            <p className="text-sm font-medium">{invoice.clientName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Invoice Date</p>
              <p className="text-sm text-gray-600">
                {new Date(invoice.createdAt || new Date()).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Due Date</p>
              <p className="text-sm text-gray-600">
                {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 mb-1">Project Details</p>
        <p className="text-sm text-gray-600">{invoice.description || 'No description provided'}</p>
      </div>

      {/* Line Items */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Description</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">Qty</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">Rate</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="py-3 px-4 text-sm text-gray-800">{item.description}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-800">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-800">
                    ${Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-800">
                    ${Number(item.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <div className="w-48">
          <div className="flex justify-between mb-2">
            <p className="text-xs text-gray-500">Subtotal</p>
            <p className="text-sm text-gray-800">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between mb-2">
            <p className="text-xs text-gray-500">Tax</p>
            <p className="text-sm text-gray-800">$0.00</p>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-800">Total</p>
            <p className="text-sm font-medium text-gray-800">${totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-8 text-xs text-gray-500">
        <p>Thank you for your business!</p>
        <p>Payment is due within 30 days of invoice date.</p>
      </div>
    </div>
  );
}