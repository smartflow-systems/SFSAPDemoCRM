import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CRMProvider } from "./contexts/CRMContext";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Tasks from "./pages/Tasks";
import Login from "./pages/Login";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/pipeline" component={Pipeline} />
      <Route path="/leads" component={Leads} />
      <Route path="/leads/:id" component={LeadDetail} />
      <Route path="/tasks" component={Tasks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CRMProvider>
          <div className="min-h-screen bg-brown-900">
            <Navigation />
            <Router />
            <Toaster />
          </div>
        </CRMProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
