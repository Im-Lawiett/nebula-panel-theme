import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ServersPage from "@/pages/servers";
import ServerDetailPage from "@/pages/server-detail";
import CreateServerPage from "@/pages/create-server";
import UsersPage from "@/pages/users";
import CreateUserPage from "@/pages/create-user";
import AdminPage from "@/pages/admin";
import NodesPage from "@/pages/nodes";
import AuditLogPage from "@/pages/audit-log";
import ProfilePage from "@/pages/profile";
import BannedPage from "@/pages/banned";
import MaintenanceViewPage from "@/pages/maintenance-view";
import DevDashboardPage from "@/pages/dev/index";
import DevProtectPage from "@/pages/dev/protect";
import DevMaintenancePage from "@/pages/dev/maintenance";
import EggsPage from "@/pages/admin/eggs";
import MountsPage from "@/pages/admin/mounts";
import LocationsPage from "@/pages/admin/locations";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login"            component={LoginPage} />
      <Route path="/banned"           component={BannedPage} />
      <Route path="/maintenance"      component={MaintenanceViewPage} />
      <Route path="/"                 component={DashboardPage} />

      {/* Servers */}
      <Route path="/servers"              component={ServersPage} />
      <Route path="/servers/create"       component={CreateServerPage} />
      <Route path="/servers/:id"          component={ServerDetailPage} />
      <Route path="/servers/:id/:tab"     component={ServerDetailPage} />

      {/* Users */}
      <Route path="/users"                component={UsersPage} />
      <Route path="/users/create"         component={CreateUserPage} />

      {/* Admin */}
      <Route path="/admin"                component={AdminPage} />
      <Route path="/nodes"                component={NodesPage} />
      <Route path="/audit"                component={AuditLogPage} />

      {/* Admin — Eggs / Mounts / Locations */}
      <Route path="/admin/eggs"           component={EggsPage} />
      <Route path="/admin/mounts"         component={MountsPage} />
      <Route path="/admin/locations"      component={LocationsPage} />

      {/* Profile */}
      <Route path="/profile"              component={ProfilePage} />

      {/* Dev */}
      <Route path="/dev"                  component={DevDashboardPage} />
      <Route path="/dev/protect"          component={DevProtectPage} />
      <Route path="/dev/maintenance"      component={DevMaintenancePage} />

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
