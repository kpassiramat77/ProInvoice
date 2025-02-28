import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/assets/create a logo for ProInvoice is an AI-powered invoice generator that helps freelancers and small business owners create professional invoices effortlessly.jpg" 
        alt="ProInvoice Logo"
        className="h-8 w-auto object-contain"
      />
      {showText && (
        <span className="text-xs text-gray-500 hidden md:block">
          AI-Powered Invoice Generator 
        </span>
      )}
    </div>
  );
}