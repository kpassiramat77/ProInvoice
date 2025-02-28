import { type ReactNode } from "react";
import { type Invoice } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Building2, Mail } from "lucide-react";
import { type InvoiceTemplateProps } from "./modern";

function useBusinessInfo() {
  const { data: settings } = useQuery<BusinessSettings>({
    queryKey: ["/api/business-settings/1"], // Mock user ID = 1
  });
  return settings;
}

interface BusinessSettings {
  businessName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  logo?: string;
}

export function ProfessionalTemplate({ invoice, className }: InvoiceTemplateProps) {
  const businessInfo = useBusinessInfo();
  const totalAmount = invoice.lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className={cn("bg-[#f8fafc] p-10", className)}>
      {/* Header with dark blue band */}
      <div className="bg-blue-900 text-white p-8 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div>
            {businessInfo?.logo && (
              <img 
                src={businessInfo.logo} 
                alt="Business logo" 
                className="h-20 w-auto mb-4 object-contain bg-white p-2 rounded"
              />
            )}
            <h1 className="text-4xl font-serif">INVOICE</h1>
            <p className="text-blue-200 mt-2">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <div className="bg-blue-800 rounded p-4">
              <p className="text-blue-200 text-sm">Due Date</p>
              <p className="text-xl">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-8 rounded-b-xl shadow-lg">
        {/* Addresses */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <h2 className="text-xl font-serif text-blue-900 mb-4">From</h2>
            {businessInfo ? (
              <div className="space-y-2">
                <p className="text-xl font-medium">{businessInfo.businessName}</p>
                <p className="text-gray-600">{businessInfo.address}</p>
                <p className="text-gray-600">
                  {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
                </p>
                {businessInfo.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <p>{businessInfo.phone}</p>
                  </div>
                )}
                {businessInfo.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <p>{businessInfo.email}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No business information set</p>
            )}
          </div>
          <div>
            <h2 className="text-xl font-serif text-blue-900 mb-4">Bill To</h2>
            <p className="text-xl">{invoice.clientName}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-10">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50">
                <th className="py-4 px-6 text-left text-blue-900 font-serif">Description</th>
                <th className="py-4 px-6 text-right text-blue-900 font-serif">Quantity</th>
                <th className="py-4 px-6 text-right text-blue-900 font-serif">Rate</th>
                <th className="py-4 px-6 text-right text-blue-900 font-serif">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {invoice.lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 px-6">{item.description}</td>
                  <td className="py-4 px-6 text-right">{item.quantity}</td>
                  <td className="py-4 px-6 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                  <td className="py-4 px-6 text-right">${Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-start pt-6 border-t-2 border-blue-900">
          <div>
            <p className="text-sm text-gray-600">
              Payment is due within 30 days
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Thank you for your business
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded">
            <p className="text-sm text-blue-900 mb-1">Total Due</p>
            <p className="text-4xl font-bold text-blue-900">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
