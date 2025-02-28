import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import CreateInvoice from "@/pages/create-invoice";
import BusinessSettings from "@/pages/business-settings";
import NotFound from "@/pages/not-found";
import { Building2, FileText, PlusCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
        {children}
      </div>
    </Link>
  );
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="cursor-pointer">
                <Logo />
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <NavLink href="/dashboard">
                <FileText className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink href="/create-invoice">
                <PlusCircle className="h-4 w-4" />
                New Invoice
              </NavLink>
              <NavLink href="/business-settings">
                <Building2 className="h-4 w-4" />
                Settings
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-6">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;