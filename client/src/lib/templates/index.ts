import { useQuery } from "@tanstack/react-query";
import { ModernTemplate } from "./modern";
import { ProfessionalTemplate } from "./professional";
import { CreativeTemplate } from "./creative";
import type { BusinessSettings } from "../invoice-templates";

export function useBusinessInfo() {
  const { data: settings } = useQuery<BusinessSettings>({
    queryKey: ["/api/business-settings/1"], // Mock user ID = 1
  });
  return settings;
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
  }
} as const;

export type TemplateId = keyof typeof templates;
export { ModernTemplate, ProfessionalTemplate, CreativeTemplate };