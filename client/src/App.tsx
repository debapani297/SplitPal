import { Route, Switch, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CreateOrder from "@/pages/CreateOrder";
import ViewOrders from "@/pages/ViewOrders";
import PaySuborders from "@/pages/PaySuborders";
import PayMainOrder from "@/pages/PayMainOrder";
import Login from "@/pages/Login";
import { getCurrentUser } from "@/lib/sessionStorage";
import { useEffect } from "react";

// Protected route component that redirects to login if not authenticated
function ProtectedRoute({ component: Component, ...rest }: any) {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser === "default@example.com") {
      navigate("/login");
    }
  }, [navigate]);
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/create-order">
          {(params) => <ProtectedRoute component={CreateOrder} params={params} />}
        </Route>
        <Route path="/view-orders">
          {(params) => <ProtectedRoute component={ViewOrders} params={params} />}
        </Route>
        <Route path="/pay-suborders">
          {(params) => <ProtectedRoute component={PaySuborders} params={params} />}
        </Route>
        <Route path="/pay-main-order">
          {(params) => <ProtectedRoute component={PayMainOrder} params={params} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
