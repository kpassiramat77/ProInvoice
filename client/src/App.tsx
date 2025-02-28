import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import CreateInvoice from "@/pages/create-invoice";
import BusinessSettings from "@/pages/business-settings";
import NotFound from "@/pages/not-found";
import { Building2, Home, FileText } from "lucide-react";

function Navbar() {
  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="flex items-center gap-2 hover:text-primary cursor-pointer">
                <Home className="h-5 w-5" />
                Dashboard
              </div>
            </Link>
            <Link href="/create-invoice">
              <div className="flex items-center gap-2 hover:text-primary cursor-pointer">
                <FileText className="h-5 w-5" />
                Create Invoice
              </div>
            </Link>
            <Link href="/business-settings">
              <div className="flex items-center gap-2 hover:text-primary cursor-pointer">
                <Building2 className="h-5 w-5" />
                Business Settings
              </div>
            </Link>
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
        <Router />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;