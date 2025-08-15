import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Endpoints from "@/pages/endpoints";
import Analytics from "@/pages/analytics";
import Compliance from "@/pages/compliance";
import Escrow from "@/pages/escrow";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/endpoints" component={Endpoints} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/escrow" component={Escrow} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
