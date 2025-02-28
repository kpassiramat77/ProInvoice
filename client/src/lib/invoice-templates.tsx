import { type Invoice } from "@shared/schema";
import { type ReactNode } from "react";

// Define business settings type
export interface BusinessSettings {
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

export { templates } from "./templates";