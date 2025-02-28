import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import CreateInvoice from "@/pages/create-invoice";
import BusinessSettings from "@/pages/business-settings";
import NotFound from "@/pages/not-found";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

function Navigation() {
  const [location] = useLocation();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="flex items-center gap-6">
            <Link href="/dashboard">
              <a className={cn(
                "text-sm hover:text-primary transition-colors",
                location === "/dashboard" && "text-primary"
              )}>
                Dashboard
              </a>
            </Link>
            <Link href="/create-invoice">
              <a className={cn(
                "text-sm hover:text-primary transition-colors",
                location === "/create-invoice" && "text-primary"
              )}>
                New Invoice
              </a>
            </Link>
            <Link href="/business-settings">
              <a className={cn(
                "text-sm hover:text-primary transition-colors",
                location === "/business-settings" && "text-primary"
              )}>
                Settings
              </a>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create-invoice" component={CreateInvoice} />
      <Route path="/business-settings" component={BusinessSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}