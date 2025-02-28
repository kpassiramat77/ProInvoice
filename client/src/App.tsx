import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import CreateInvoice from "@/pages/create-invoice";
import EditInvoice from "@/pages/edit-invoice";
import BusinessSettings from "@/pages/business-settings";
import NotFound from "@/pages/not-found";
import { Building2, FileText, PlusCircle, Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <div 
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
          "hover:bg-primary/10",
          isActive && "bg-primary/10 text-primary font-medium"
        )}
      >
        {children}
      </div>
    </Link>
  );
}

function NavigationLinks({ onClick }: { onClick?: () => void }) {
  return (
    <>
      <NavLink href="/dashboard" onClick={onClick}>
        <FileText className="h-4 w-4" />
        Dashboard
      </NavLink>
      <NavLink href="/create-invoice" onClick={onClick}>
        <PlusCircle className="h-4 w-4" />
        New Invoice
      </NavLink>
      <NavLink href="/business-settings" onClick={onClick}>
        <Building2 className="h-4 w-4" />
        Settings
      </NavLink>
    </>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-8">
          <NavigationLinks />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden md:flex items-center gap-1">
      <NavigationLinks />
    </nav>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="cursor-pointer">
                <Logo />
              </div>
            </Link>
            <DesktopNav />
          </div>
          <MobileNav />
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
      <Route path="/edit-invoice/:id" component={EditInvoice} />
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
        <main className="container mx-auto px-4 py-6">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;