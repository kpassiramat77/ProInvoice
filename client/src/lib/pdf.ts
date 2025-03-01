import { jsPDF } from "jspdf";
import type { Invoice } from "@shared/schema";

export function generateInvoicePDF(invoice: Invoice & { lineItems: Array<{ description: string; quantity: number; unitPrice: number; amount: number }> }): string {
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
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 60);

  // Add client details
  doc.setFontSize(14);
  doc.setFont("helvetica", 'bold');
  doc.text(`Bill To:`, 20, 80);
  doc.setFont("helvetica", 'normal');
  doc.setFontSize(12);
  doc.text(invoice.clientName, 20, 90);
  if (invoice.clientEmail) {
    doc.text(invoice.clientEmail, 20, 98);
  }

  // Add line items table
  doc.setFontSize(12);
  doc.setFont("helvetica", 'bold');
  let yPos = 120;

  // Table headers
  doc.text("Description", 20, yPos);
  doc.text("Qty", 120, yPos);
  doc.text("Rate", 140, yPos);
  doc.text("Amount", 170, yPos);

  doc.setFont("helvetica", 'normal');
  yPos += 10;

  // Line items
  invoice.lineItems.forEach((item) => {
    // Ensure the description fits within the allocated space
    const descriptionLines = doc.splitTextToSize(item.description, 90);
    doc.text(descriptionLines, 20, yPos);
    doc.text(item.quantity.toString(), 120, yPos);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 140, yPos);
    doc.text(`$${item.amount.toFixed(2)}`, 170, yPos);
    yPos += descriptionLines.length > 1 ? 10 * descriptionLines.length : 10;
  });

  // Calculate totals
  const subTotal = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const tax = subTotal * Number(invoice.taxRate || 0);
  const total = subTotal + tax;

  // Add totals
  yPos += 10;
  doc.text("Subtotal:", 140, yPos);
  doc.text(`$${subTotal.toFixed(2)}`, 170, yPos);

  yPos += 10;
  doc.text(`Tax (${(Number(invoice.taxRate || 0) * 100).toFixed(0)}%):`, 140, yPos);
  doc.text(`$${tax.toFixed(2)}`, 170, yPos);

  yPos += 10;
  doc.setFont("helvetica", 'bold');
  doc.text("Total:", 140, yPos);
  doc.text(`$${total.toFixed(2)}`, 170, yPos);

  // Add footer
  doc.setFontSize(10);
  doc.setFont("helvetica", 'normal');
  doc.setTextColor(128, 128, 128); // Gray footer
  doc.text("Thank you for your business!", 105, 280, { align: "center" });
  doc.text("Payment is due within 30 days of invoice date.", 105, 286, { align: "center" });

  return doc.output("datauristring");
}