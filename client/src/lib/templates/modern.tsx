import { type ReactNode } from "react";
import { type Invoice } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useBusinessInfo } from "./index";
import type { InvoiceTemplateProps } from "../invoice-templates";

export function ModernTemplate({ invoice, className }: InvoiceTemplateProps) {
  const businessInfo = useBusinessInfo();
  const totalAmount = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const tax = 0;
  const subTotal = totalAmount;

  return (
    <div className={cn("max-w-3xl mx-auto p-8 bg-white shadow-md rounded-lg border border-gray-300", className)}>
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-300">
        {businessInfo?.logo && (
          <img src={businessInfo.logo} alt="Logo" className="w-16 h-16 object-contain" />
        )}
        <div className="text-right">
          <h2 className="text-2xl font-bold">{businessInfo?.businessName || "Business Name"}</h2>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="mt-4 flex justify-between text-sm">
        <div>
          <p className="font-bold">From</p>
          {businessInfo && (
            <div className="text-gray-600">
              <p>{businessInfo.businessName}</p>
              <p>{businessInfo.phone}</p>
              <p>{businessInfo.email}</p>
              <p>{`${businessInfo.address}, ${businessInfo.city}, ${businessInfo.state} ${businessInfo.zipCode}`}</p>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold mb-2">Invoice No: #{invoice.invoiceNumber}</p>
          <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mt-8">
        <h3 className="font-bold mb-2">Bill To:</h3>
        <p>{invoice.clientName}</p>
      </div>

      {/* Items Table */}
      <div className="mt-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-center">QTY</th>
              <th className="border p-2 text-left">DESCRIPTION</th>
              <th className="border p-2 text-right">PRICE</th>
              <th className="border p-2 text-right">TOTAL</th>
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
      <div className="mt-4 text-right border-t pt-4">
        <div className="flex justify-end">
          <div className="w-48 space-y-1">
            <div className="flex justify-between">
              <p className="text-gray-600">Subtotal:</p>
              <p className="font-medium">${subTotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Tax:</p>
              <p className="font-medium">${tax.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-1">
              <p>Total:</p>
              <p>${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm border-t pt-4">
        <p className="text-center text-gray-700 font-bold mb-2">Thank you for your business!</p>
        <p className="text-center text-gray-600">Payment is due within 30 days of invoice date.</p>
      </div>
    </div>
  );
}