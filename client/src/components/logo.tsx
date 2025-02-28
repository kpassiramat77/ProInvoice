import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-lg transform rotate-3" />
        <div className="relative bg-primary rounded-lg p-1.5">
          <FileText className="h-6 w-6 text-white" />
        </div>
      </div>
      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          ProInvoice
        </span>
      )}
    </div>
  );
}
