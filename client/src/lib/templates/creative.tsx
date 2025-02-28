import { type ReactNode } from "react";
import { type Invoice } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Mail, Phone } from "lucide-react";
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

export function CreativeTemplate({ invoice, className }: InvoiceTemplateProps) {
  const businessInfo = useBusinessInfo();
  const totalAmount = invoice.lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className={cn(
      "min-h-full p-8 rounded-xl overflow-hidden",
      "bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50",
      className
    )}>
      {/* Creative Header */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10 rounded-xl" />
        <div className="relative p-8">
          <div className="flex justify-between items-start">
            <div>
              {businessInfo?.logo && (
                <img 
                  src={businessInfo.logo} 
                  alt="Business logo" 
                  className="h-20 w-auto mb-6 object-contain"
                />
              )}
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                INVOICE
              </h1>
              <p className="text-gray-600 mt-2 text-lg">#{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-xl">
                <Calendar className="h-5 w-5 text-purple-500 mb-2" />
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-xl font-medium text-purple-600">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Cards */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              From
            </h2>
            {businessInfo ? (
              <div className="space-y-2">
                <p className="text-xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {businessInfo.businessName}
                </p>
                <p className="text-gray-600">{businessInfo.address}</p>
                <p className="text-gray-600">
                  {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
                </p>
                {businessInfo.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-purple-500" />
                    <p>{businessInfo.phone}</p>
                  </div>
                )}
                {businessInfo.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-purple-500" />
                    <p>{businessInfo.email}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No business information set</p>
            )}
          </div>
        </div>
        <div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              For
            </h2>
            <p className="text-2xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {invoice.clientName}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-100">
                <th className="py-4 px-6 text-left bg-purple-50/50">
                  <span className="text-purple-600 font-medium">Description</span>
                </th>
                <th className="py-4 px-6 text-right bg-purple-50/50">
                  <span className="text-purple-600 font-medium">Quantity</span>
                </th>
                <th className="py-4 px-6 text-right bg-purple-50/50">
                  <span className="text-purple-600 font-medium">Rate</span>
                </th>
                <th className="py-4 px-6 text-right bg-purple-50/50">
                  <span className="text-purple-600 font-medium">Amount</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, index) => (
                <tr key={index} className="border-b border-purple-50">
                  <td className="py-4 px-6">{item.description}</td>
                  <td className="py-4 px-6 text-right">{item.quantity}</td>
                  <td className="py-4 px-6 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                  <td className="py-4 px-6 text-right">${Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creative Footer */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Created {new Date(invoice.createdAt || new Date()).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-[2px] rounded-xl">
            <div className="bg-white px-8 py-6 rounded-xl">
              <p className="text-lg font-medium text-gray-600 mb-2">Total Due</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
