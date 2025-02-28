import { type ReactNode } from "react";
import { type Invoice } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Calendar, DollarSign } from "lucide-react";

export interface InvoiceTemplateProps {
  invoice: Invoice;
  className?: string;
}

function useBusinessInfo() {
  const { data: settings } = useQuery({
    queryKey: ["/api/business-settings/1"], // Mock user ID = 1
  });
  return settings;
}

// Modern template with clean lines and minimalist design
export function ModernTemplate({ invoice, className }: InvoiceTemplateProps) {
  const businessInfo = useBusinessInfo();

  return (
    <div className={cn("bg-white p-10 rounded-xl shadow-lg", className)}>
      <div className="flex justify-between items-start mb-12">
        <div>
          {businessInfo?.logo && (
            <img 
              src={businessInfo.logo} 
              alt="Business logo" 
              className="h-20 w-auto mb-6 object-contain"
            />
          )}
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            INVOICE
          </h1>
          <p className="text-gray-600 mt-2 text-lg">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-gray-600 mb-2">
            <Calendar className="h-5 w-5" />
            <p className="text-lg">Due Date</p>
          </div>
          <p className="text-xl font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">From</h2>
          {businessInfo ? (
            <>
              <p className="text-xl font-medium">{businessInfo.businessName}</p>
              <p className="text-gray-600">{businessInfo.address}</p>
              <p className="text-gray-600">
                {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
              </p>
              {businessInfo.phone && (
                <p className="text-gray-600">{businessInfo.phone}</p>
              )}
              {businessInfo.email && (
                <p className="text-gray-600">{businessInfo.email}</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 italic">No business information set</p>
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Bill To</h2>
          <p className="text-xl font-medium">{invoice.clientName}</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Description</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700 whitespace-pre-wrap">{invoice.description}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-500">
            Created {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-1">Amount Due</p>
          <div className="flex items-center justify-end gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <p className="text-4xl font-bold text-primary">
              {Number(invoice.amount).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Professional template with traditional business styling
export function ProfessionalTemplate({ invoice, className }: InvoiceTemplateProps) {
  const businessInfo = useBusinessInfo();
  return (
    <div className={cn("bg-white p-10 rounded-xl shadow-lg", className)}>
      <div className="border-b-2 border-blue-600 pb-6 mb-8">
        <div className="flex justify-between items-start">
          {businessInfo?.logo && (
            <img 
              src={businessInfo.logo} 
              alt="Business logo" 
              className="h-20 w-auto mb-4 object-contain"
            />
          )}
          <div className="text-right">
            <h1 className="text-4xl font-serif font-bold text-blue-800">INVOICE</h1>
            <p className="text-lg text-gray-600 mt-2">#{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex justify-between mt-4 text-gray-600">
          <p>Issue Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
          <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-xl font-serif text-blue-800 mb-4">From</h2>
          {businessInfo ? (
            <div className="space-y-2">
              <p className="text-xl font-medium">{businessInfo.businessName}</p>
              <p className="text-gray-600">{businessInfo.address}</p>
              <p className="text-gray-600">
                {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
              </p>
              {businessInfo.phone && (
                <p className="text-gray-600">{businessInfo.phone}</p>
              )}
              {businessInfo.email && (
                <p className="text-gray-600">{businessInfo.email}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No business information set</p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-serif text-blue-800 mb-4">Bill To</h2>
          <p className="text-xl font-medium">{invoice.clientName}</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-serif text-blue-800 mb-4">Description</h2>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {invoice.description}
          </p>
        </div>
      </div>

      <div className="border-t-2 border-blue-600 pt-6">
        <div className="flex justify-between items-end">
          <div className="text-sm text-gray-600">
            <p>Please include invoice number with payment</p>
            <p>Thank you for your business</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-serif text-blue-800 mb-2">Total Amount</p>
            <p className="text-4xl font-bold text-blue-800">
              ${Number(invoice.amount).toFixed(2)}
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
  return (
    <div className={cn(
      "bg-gradient-to-br from-purple-50 to-pink-50 p-10 rounded-xl shadow-lg",
      "backdrop-blur-sm",
      className
    )}>
      <div className="flex justify-between items-start mb-12">
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
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-lg p-4">
            <p className="text-lg font-medium text-gray-700">Due Date</p>
            <p className="text-xl text-purple-600">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">From</h2>
          {businessInfo ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 space-y-2">
              <p className="text-xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {businessInfo.businessName}
              </p>
              <p className="text-gray-600">{businessInfo.address}</p>
              <p className="text-gray-600">
                {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
              </p>
              {businessInfo.phone && (
                <p className="text-gray-600">{businessInfo.phone}</p>
              )}
              {businessInfo.email && (
                <p className="text-gray-600">{businessInfo.email}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No business information set</p>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">For</h2>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6">
            <p className="text-2xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {invoice.clientName}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Project Details</h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {invoice.description}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8">
        <div>
          <p className="text-sm text-gray-500">
            Created {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-lg p-6">
            <p className="text-lg font-medium text-gray-700 mb-2">Total Due</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ${Number(invoice.amount).toFixed(2)}
            </p>
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