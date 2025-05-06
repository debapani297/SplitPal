import { Route, Switch } from "wouter";
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

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/create-order" component={CreateOrder} />
        <Route path="/view-orders" component={ViewOrders} />
        <Route path="/pay-suborders" component={PaySuborders} />
        <Route path="/pay-main-order" component={PayMainOrder} />
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
