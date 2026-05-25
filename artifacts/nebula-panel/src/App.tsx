import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Layouts
import { UserLayout } from "@/components/layout/user-layout";
import { AdminLayout } from "@/components/layout/admin-layout";

// Auth Pages
import Login from "@/pages/login";
import Register from "@/pages/register";

// User Pages
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Account from "@/pages/account";
import ServerDetail from "@/pages/server/detail";
import ServerFiles from "@/pages/server/files";

// Admin Pages
import AdminOverview from "@/pages/admin/overview";
import AdminServers from "@/pages/admin/servers";
import AdminNodes from "@/pages/admin/nodes";
import AdminUsers from "@/pages/admin/users";
import AdminLocations from "@/pages/admin/locations";
import AdminNests from "@/pages/admin/nests";
import AdminApi from "@/pages/admin/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Auth */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Admin Panel */}
      <Route path="/admin" nest>
        <AdminLayout>
          <Switch>
            <Route path="/" component={AdminOverview} />
            <Route path="/servers" component={AdminServers} />
            <Route path="/nodes" component={AdminNodes} />
            <Route path="/users" component={AdminUsers} />
            <Route path="/locations" component={AdminLocations} />
            <Route path="/nests" component={AdminNests} />
            <Route path="/api" component={AdminApi} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>

      {/* User Panel */}
      <Route path="/server/:id/files" nest>
        <UserLayout>
          <ServerFiles />
        </UserLayout>
      </Route>
      
      <Route path="/server/:id" nest>
        <UserLayout>
          <ServerDetail />
        </UserLayout>
      </Route>

      <Route path="/" nest>
        <UserLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/chat" component={Chat} />
            <Route path="/account" component={Account} />
            <Route component={NotFound} />
          </Switch>
        </UserLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeWrapper>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeWrapper>
    </QueryClientProvider>
  );
}

export default App;
