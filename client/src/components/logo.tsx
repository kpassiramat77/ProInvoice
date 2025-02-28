import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img 
        src="/assets/proinvoice-logo.jpg" 
        alt="ProInvoice"
        className="h-6 w-auto"
      />
      <span className="text-sm text-muted-foreground">
        AI-Powered Invoice Generator
      </span>
    </div>
  );
}