import { jsPDF } from "jspdf";
import type { Invoice } from "@shared/schema";
import { useBusinessInfo } from "./templates";

export function generateInvoicePDF(invoice: Invoice & { lineItems: Array<{ description: string; quantity: number; unitPrice: number; amount: number }> }): string {
  const doc = new jsPDF();

  // Set initial coordinates
  let yPos = 20;
  const leftMargin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (leftMargin * 2);

  // Header section with logo placeholder
  doc.setFontSize(30);
  doc.setTextColor(44, 82, 130); // Primary blue color
  doc.text("INVOICE", pageWidth / 2, yPos, { align: "center" });
  yPos += 20;

  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100); // Gray text
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, leftMargin, yPos);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - leftMargin - 40, yPos);
  yPos += 8;
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - leftMargin - 40, yPos);

  // Bill To section
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", leftMargin, yPos);
  yPos += 8;
  doc.setFont("helvetica", "normal");
  doc.text(invoice.clientName, leftMargin, yPos);
  if (invoice.clientEmail) {
    yPos += 6;
    doc.text(invoice.clientEmail, leftMargin, yPos);
  }

  // Line items table
  yPos += 20;

  // Table headers
  const colWidths = {
    qty: 20,
    desc: contentWidth - 100,
    rate: 40,
    amount: 40
  };

  doc.setFont("helvetica", "bold");
  doc.setFillColor(247, 248, 250); // Light gray background
  doc.rect(leftMargin, yPos - 5, contentWidth, 10, "F");
  doc.text("QTY", leftMargin, yPos);
  doc.text("DESCRIPTION", leftMargin + colWidths.qty, yPos);
  doc.text("RATE", pageWidth - leftMargin - colWidths.rate - colWidths.amount, yPos, { align: "right" });
  doc.text("AMOUNT", pageWidth - leftMargin, yPos, { align: "right" });
  yPos += 10;

  // Line items
  doc.setFont("helvetica", "normal");
  invoice.lineItems.forEach((item) => {
    doc.text(item.quantity.toString(), leftMargin, yPos);
    const descriptionLines = doc.splitTextToSize(item.description, colWidths.desc);
    doc.text(descriptionLines, leftMargin + colWidths.qty, yPos);
    doc.text(`$${item.unitPrice.toFixed(2)}`, pageWidth - leftMargin - colWidths.amount, yPos, { align: "right" });
    doc.text(`$${item.amount.toFixed(2)}`, pageWidth - leftMargin, yPos, { align: "right" });
    yPos += descriptionLines.length > 1 ? 8 * descriptionLines.length : 8;
  });

  // Totals section
  yPos += 10;
  const totalsStartX = pageWidth - leftMargin - 80;
  const subTotal = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const tax = subTotal * Number(invoice.taxRate || 0);
  const total = subTotal + tax;

  doc.text("Subtotal:", totalsStartX, yPos);
  doc.text(`$${subTotal.toFixed(2)}`, pageWidth - leftMargin, yPos, { align: "right" });
  yPos += 8;

  doc.text(`Tax (${(Number(invoice.taxRate || 0) * 100).toFixed(0)}%):`, totalsStartX, yPos);
  doc.text(`$${tax.toFixed(2)}`, pageWidth - leftMargin, yPos, { align: "right" });
  yPos += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Total:", totalsStartX, yPos);
  doc.text(`$${total.toFixed(2)}`, pageWidth - leftMargin, yPos, { align: "right" });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text("Thank you for your business!", pageWidth / 2, 270, { align: "center" });
  doc.text("Payment is due within 30 days of invoice date.", pageWidth / 2, 276, { align: "center" });

  return doc.output("datauristring");
}