import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";

import Dashboard from "@/pages/dashboard";
import Endpoints from "@/pages/endpoints";
import Analytics from "@/pages/analytics";
import Compliance from "@/pages/compliance";
import Escrow from "@/pages/escrow";
import Settings from "@/pages/settings";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!user ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/endpoints" component={Endpoints} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/compliance" component={Compliance} />
          <Route path="/escrow" component={Escrow} />
          <Route path="/settings" component={Settings} />
          <Route component={Dashboard} />
        </>
      )}
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
