import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateInvoicePDF } from "@/lib/pdf";
import type { Invoice } from "@shared/schema";
import { templates, type TemplateId } from "@/lib/invoice-templates";

interface InvoicePreviewProps {
  invoice: Invoice & {
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;
  };
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const handleDownload = () => {
    const pdfDataUri = generateInvoicePDF(invoice);
    const link = document.createElement("a");
    link.href = pdfDataUri;
    link.download = `invoice-${invoice.invoiceNumber}.pdf`;
    link.click();
  };

  const Template = templates[invoice.template as TemplateId]?.component || templates.modern.component;

  return (
    <Card className="bg-background border-none shadow-none">
      <div className="flex justify-end mb-4">
        <Button onClick={handleDownload} variant="outline" size="sm">
          Download PDF
        </Button>
      </div>

      <Template invoice={invoice} />
    </Card>
  );
}