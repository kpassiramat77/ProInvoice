import { type ReactNode } from "react";
import { type Invoice } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Calendar, DollarSign, Building2, Mail, Phone } from "lucide-react";

// Define proper business settings type
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

export interface InvoiceTemplateProps {
  invoice: Invoice & {
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;
  };
  className?: string;
}

function useBusinessInfo() {
  const { data: settings } = useQuery<BusinessSettings>({
    queryKey: ["/api/business-settings/1"], // Mock user ID = 1
  });
  return settings;
}

// Modern template with clean lines and minimalist design
export function ModernTemplate({ invoice, className }: InvoiceTemplateProps) {
  const businessInfo = useBusinessInfo();
  const totalAmount = invoice.lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className={cn("bg-white p-6 max-w-4xl mx-auto", className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            {businessInfo?.logo && (
              <img 
                src={businessInfo.logo} 
                alt="Business logo" 
                className="h-8 w-auto object-contain"
              />
            )}
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-[#1e3a8a]">INVOICE</h1>
            <p className="text-sm text-gray-600">#{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Invoice Info Grid */}
      <div className="grid grid-cols-2 gap-x-8 mb-6">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">From</p>
          {businessInfo ? (
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{businessInfo.businessName}</p>
              <p className="text-xs text-gray-600">{businessInfo.address}</p>
              <p className="text-xs text-gray-600">
                {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
              </p>
              {businessInfo.phone && <p className="text-xs text-gray-600">{businessInfo.phone}</p>}
              {businessInfo.email && <p className="text-xs text-gray-600">{businessInfo.email}</p>}
            </div>
          ) : (
            <p className="text-gray-500 italic text-xs">No business information set</p>
          )}
        </div>
        <div>
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Bill To</p>
            <p className="text-sm font-medium">{invoice.clientName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Invoice Date</p>
              <p className="text-xs text-gray-600">
                {new Date(invoice.createdAt || new Date()).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Due Date</p>
              <p className="text-xs text-gray-600">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-1">Project Details</p>
        <p className="text-xs text-gray-600">{invoice.description || 'No description provided'}</p>
      </div>

      {/* Line Items */}
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Description</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Qty</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Rate</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.lineItems.map((item, index) => (
              <tr key={index}>
                <td className="px-3 py-2 text-xs text-gray-800">{item.description}</td>
                <td className="px-3 py-2 text-xs text-right text-gray-800">{item.quantity}</td>
                <td className="px-3 py-2 text-xs text-right text-gray-800">
                  ${Number(item.unitPrice).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-xs text-right text-gray-800">
                  ${Number(item.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end pt-3 border-t border-gray-200">
        <div className="w-48">
          <div className="flex justify-between mb-1">
            <p className="text-xs text-gray-500">Subtotal</p>
            <p className="text-xs text-gray-800">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between mb-1">
            <p className="text-xs text-gray-500">Tax</p>
            <p className="text-xs text-gray-800">$0.00</p>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-800">Total</p>
            <p className="text-xs font-medium text-gray-800">${totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6 text-xs text-gray-500">
        <p>Thank you for your business!</p>
        <p>Payment is due within 30 days of invoice date.</p>
      </div>
    </div>
  );
}

// Professional template with traditional business styling
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

// Creative template with modern artistic elements
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