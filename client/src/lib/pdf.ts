import { jsPDF } from "jspdf";
import type { Invoice } from "@shared/schema";

export function generateInvoicePDF(invoice: Invoice): string {
  const doc = new jsPDF();

  // Add invoice header
  doc.setFontSize(24);
  doc.setTextColor(44, 82, 130); // Blue header
  doc.text("INVOICE", 105, 20, { align: "center" });

  // Add invoice details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
  doc.text(`Due Date: ${new Date(invoice.dueDate || new Date()).toLocaleDateString()}`, 20, 60);

  // Add client details
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`Bill To:`, 20, 80);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(12);
  doc.text(invoice.clientName, 20, 90);

  // Add description
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`Description:`, 20, 110);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(invoice.description || '', 170);
  doc.text(lines, 20, 120);

  // Add amount with styling
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`Amount Due:`, 20, 160);
  doc.setFontSize(16);
  doc.setTextColor(44, 82, 130); // Blue amount
  doc.text(`$${Number(invoice.amount).toFixed(2)}`, 80, 160);

  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128); // Gray footer
  doc.text("Thank you for your business!", 105, 280, { align: "center" });

  return doc.output("datauristring");
}