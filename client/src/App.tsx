import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import EmailScanner from "@/pages/email-scanner";
import URLScanner from "@/pages/url-scanner";
import FileScanner from "@/pages/file-scanner";
import BreachChecker from "@/pages/breach-checker";
import Reports from "@/pages/reports";
import ThreatIntelligence from "@/pages/threat-intelligence";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/email-scanner" component={EmailScanner} />
          <Route path="/url-scanner" component={URLScanner} />
          <Route path="/file-scanner" component={FileScanner} />
          <Route path="/breach-checker" component={BreachChecker} />
          <Route path="/reports" component={Reports} />
          <Route path="/threat-intelligence" component={ThreatIntelligence} />
          <Route path="/admin" component={Admin} />
        </>
      )}
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
