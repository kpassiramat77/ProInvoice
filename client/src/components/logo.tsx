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
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] to-[#22c55e]/20 rounded-lg transform rotate-3" />
        <div className="relative bg-gradient-to-br from-[#1e3a8a] to-[#22c55e] rounded-lg p-1.5">
          <FileText className="h-6 w-6 text-white" />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#22c55e] bg-clip-text text-transparent">
            ProInvoice
          </span>
          <span className="text-xs text-gray-500 hidden md:block">AI-Powered Invoice Generator</span>
        </div>
      )}
    </div>
  );
}