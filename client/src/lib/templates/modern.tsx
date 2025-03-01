import { type ReactNode } from "react";
import { type Invoice } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { type BusinessSettings } from "../invoice-templates";
import { useBusinessInfo } from "./index";
import type { InvoiceTemplateProps } from "../invoice-templates";

export function ModernTemplate({ invoice, className }: InvoiceTemplateProps) {
  const businessInfo = useBusinessInfo();
  const subTotal = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const taxRate = 0.1; // 10% tax rate
  const tax = subTotal * taxRate;
  const totalAmount = subTotal + tax;

  return (
    <div className={cn("max-w-3xl mx-auto p-8 bg-white shadow-md rounded-lg border border-gray-300", className)}>
      {/* Header Section */}
      <div className="flex justify-between items-center">
        {businessInfo?.logo && (
          <img src={businessInfo.logo} alt="Logo" className="w-12 h-12 object-contain" />
        )}
        <div className="text-right">
          <h2 className="text-xl font-bold">{businessInfo?.businessName || "Business Name"}</h2>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="mt-4 flex justify-between text-sm">
        <div>
          <p className="font-bold">From</p>
          {businessInfo && (
            <div className="text-gray-600 text-sm">
              {businessInfo.businessName}
              <p>{businessInfo.address}, {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}</p>
              <p>{businessInfo.phone} • {businessInfo.email}</p>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold mb-2">Invoice No: #{invoice.invoiceNumber}</p>
          <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mt-6">
        <h3 className="font-bold mb-2">Bill To:</h3>
        <p>{invoice.clientName}</p>
      </div>

      {/* Items Table */}
      <div className="mt-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-center">QTY</th>
              <th className="border p-2 text-left">DESCRIPTION</th>
              <th className="border p-2 text-right">RATE</th>
              <th className="border p-2 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.length > 0 ? (
              invoice.lineItems.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="border p-2 text-center">{item.quantity}</td>
                  <td className="border p-2 text-left">{item.description}</td>
                  <td className="border p-2 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                  <td className="border p-2 text-right">${Number(item.amount).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border p-2 text-center text-gray-500">No items available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="mt-4 text-right">
        <div className="flex justify-end">
          <div className="w-48 space-y-1">
            <div className="flex justify-between">
              <p className="text-gray-600">Subtotal:</p>
              <p className="font-medium">${subTotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Tax (10%):</p>
              <p className="font-medium">${tax.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <p>Total:</p>
              <p>${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-sm text-center text-gray-600">
        <p className="font-bold mb-1">Thank you for your business!</p>
        <p>Payment is due within 30 days of invoice date.</p>
      </div>
    </div>
  );
}