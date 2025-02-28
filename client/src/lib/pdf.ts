import { jsPDF } from "jspdf";
import type { Invoice } from "@shared/schema";

export function generateInvoicePDF(invoice: Invoice): string {
  const doc = new jsPDF();
  
  // Add company logo/header
  doc.setFontSize(20);
  doc.text("INVOICE", 105, 20, { align: "center" });
  
  // Add invoice details
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 50);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 60);
  
  // Add client details
  doc.text(`Bill To:`, 20, 80);
  doc.text(invoice.clientName, 20, 90);
  
  // Add description
  doc.text(`Description:`, 20, 110);
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(invoice.description, 170);
  doc.text(lines, 20, 120);
  
  // Add amount
  doc.setFontSize(12);
  doc.text(`Amount Due: $${invoice.amount}`, 20, 160);
  
  // Add footer
  doc.setFontSize(10);
  doc.text("Thank you for your business!", 105, 280, { align: "center" });
  
  return doc.output("datauristring");
}
