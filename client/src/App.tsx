import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import ReleaseNotes from "@/pages/release-notes";

import Dashboard from "@/pages/dashboard";
import Endpoints from "@/pages/endpoints";
import Analytics from "@/pages/analytics";
import Compliance from "@/pages/compliance";
import Escrow from "@/pages/escrow";
import Settings from "@/pages/settings";
import WalletTest from "@/pages/wallet-test";
import Audit from "@/pages/audit";
import Webhooks from "@/pages/webhooks";
import DocsPage from "@/pages/docs";
import ContactPage from "@/pages/contact";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/release-notes" component={ReleaseNotes} />
        <Route path="/docs" component={DocsPage} />
        <Route path="/docs/:section" component={DocsPage} />
        <Route path="/docs/:section/:page" component={DocsPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="*" component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/endpoints" component={Endpoints} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/escrow" component={Escrow} />
      <Route path="/audit" component={Audit} />
      <Route path="/webhooks" component={Webhooks} />
      <Route path="/settings" component={Settings} />
      <Route path="/wallet-test" component={WalletTest} />
      <Route path="/docs" component={DocsPage} />
      <Route path="/docs/:section" component={DocsPage} />
      <Route path="/docs/:section/:page" component={DocsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
