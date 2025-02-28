import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateInvoicePDF } from "@/lib/pdf";
import type { Invoice } from "@shared/schema";

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const handleDownload = () => {
    const pdfDataUri = generateInvoicePDF(invoice);
    const link = document.createElement("a");
    link.href = pdfDataUri;
    link.download = `invoice-${invoice.invoiceNumber}.pdf`;
    link.click();
  };

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">Invoice #{invoice.invoiceNumber}</h2>
        <Button onClick={handleDownload} variant="outline">
          Download PDF
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-600">Client</h3>
          <p className="text-lg">{invoice.clientName}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-600">Description</h3>
          <p className="text-gray-800">{invoice.description}</p>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <h3 className="font-semibold text-gray-600">Due Date</h3>
            <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-gray-600">Amount</h3>
            <p className="text-xl font-bold">${invoice.amount}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
