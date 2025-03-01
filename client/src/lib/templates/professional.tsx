import { type ReactNode } from "react";
import { type Invoice } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { type BusinessSettings } from "../invoice-templates";
import { Phone, Mail, MapPin } from "lucide-react";

function useBusinessInfo() {
  const { data: settings } = useQuery<BusinessSettings>({
    queryKey: ["/api/business-settings/1"],
  });
  return settings;
}

export function ProfessionalTemplate({ invoice, className }: { invoice: Invoice & { lineItems: Array<{ description: string; quantity: number; unitPrice: number; amount: number }> }, className?: string }) {
  const businessInfo = useBusinessInfo();
  const subTotal = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const taxRate = 0.1; // 10% tax rate
  const tax = subTotal * taxRate;
  const totalAmount = subTotal + tax;

  return (
    <div className={cn("max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-300", className)}>
      {/* Header Section */}
      <div className="flex justify-between items-center pb-6 border-b border-gray-300">
        <div className="flex items-center gap-4">
          {businessInfo?.logo && (
            <img src={businessInfo.logo} alt="Logo" className="w-12 h-12 object-contain" />
          )}
          <div>
            <h1 className="text-xl font-bold text-blue-600">{businessInfo?.businessName || "Business Name"}</h1>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-blue-600">INVOICE</h2>
          <p className="text-xs text-gray-600">#{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="mt-4 flex justify-between text-sm text-gray-700">
        <div>
          <p className="font-bold">Invoice to:</p>
          <p className="text-lg font-semibold">{invoice.clientName}</p>
          {invoice.clientEmail && <p className="text-sm">{invoice.clientEmail}</p>}
        </div>
        <div className="text-right">
          <p className="font-bold">Invoice no: {invoice.invoiceNumber}</p>
          <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mt-6">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border p-2">NO</th>
              <th className="border p-2 text-left">DESCRIPTION</th>
              <th className="border p-2">QTY</th>
              <th className="border p-2">PRICE</th>
              <th className="border p-2">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.length > 0 ? (
              invoice.lineItems.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2 text-left">{item.description}</td>
                  <td className="border p-2">{item.quantity}</td>
                  <td className="border p-2">${Number(item.unitPrice).toFixed(2)}</td>
                  <td className="border p-2">${Number(item.amount).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="border p-2 text-center text-gray-500">No items available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Info */}
      <div className="mt-6 flex justify-end text-sm text-gray-700 border-t pt-4">
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
            <p className="text-blue-600">${totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-gray-700 text-sm border-t pt-4">
        <p className="font-bold">Thank you for your business!</p>
        {invoice.description && (
          <div className="mt-2">
            <p className="font-bold">Notes :</p>
            <p>{invoice.description}</p>
          </div>
        )}
      </div>

      {/* Contact Info */}
      {businessInfo && (
        <div className="mt-4 flex justify-around text-gray-500 text-xs border-t pt-4">
          {businessInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {businessInfo.phone}
            </div>
          )}
          {businessInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {businessInfo.email}
            </div>
          )}
          {businessInfo.address && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> 
              {`${businessInfo.address}, ${businessInfo.city}, ${businessInfo.state} ${businessInfo.zipCode}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}