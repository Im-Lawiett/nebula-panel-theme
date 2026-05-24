import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ServersPage from "@/pages/servers";
import UsersPage from "@/pages/users";
import AdminPage from "@/pages/admin";
import BannedPage from "@/pages/banned";
import MaintenanceViewPage from "@/pages/maintenance-view";
import DevDashboardPage from "@/pages/dev/index";
import DevProtectPage from "@/pages/dev/protect";
import DevMaintenancePage from "@/pages/dev/maintenance";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/banned" component={BannedPage} />
      <Route path="/maintenance" component={MaintenanceViewPage} />
      <Route path="/" component={DashboardPage} />
      <Route path="/servers" component={ServersPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/dev" component={DevDashboardPage} />
      <Route path="/dev/protect" component={DevProtectPage} />
      <Route path="/dev/maintenance" component={DevMaintenancePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
