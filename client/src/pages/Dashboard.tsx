import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppRoutes, Order } from "@/types";
import { getOrders, getCurrentUser, getPendingOrders, getCompletedOrders } from "@/lib/sessionStorage";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import OrderCard from "@/components/orders/OrderCard";
import { Icon } from "@/components/ui/icon";

export default function Dashboard() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  
  // Refetch data whenever the component mounts
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
  const currentUser = getCurrentUser();
  const raw = sessionStorage.getItem("userOrderMap");
  const userOrderMap = raw ? JSON.parse(raw) : {};

  const response = await fetch(`/api/orders/${currentUser}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userOrderMap),
  });

  if (!response.ok) {
    console.error("Failed to fetch orders");
    return;
  }

  const data = await response.json();

  const grouped: { [key: string]: Order } = {};
  let pendingCount = 0;
  let completedCount = 0;

  data.orders.forEach(({ mainOrder, subOrder }) => {
    const orderId = mainOrder.orderId;
    const [beforeFor, afterFor] = mainOrder.description.split("for").map(str => str.trim());

    if (!grouped[orderId]) {
      grouped[orderId] = {
        id: orderId,
        description: beforeFor,
        totalAmount: mainOrder.totalAmount,
        dueDate: new Date().toISOString(),
        landlord: afterFor,
        status: mainOrder.paymentStatus,
        createdAt: new Date().toISOString(),
        paymentLink: mainOrder.paymentLink,
        suborders: [],
      };
    }

    subOrder.forEach(sub => {
      const suborder = {
        id: sub.orderId,
        amount: sub.suborderAmount,
        status: sub.paymentStatus,
        payee: {
          name: sub.name,
          email: sub.email,
        },
      };

      grouped[orderId].suborders.push(suborder);

      if (sub.email === currentUser) {
        if (sub.paymentStatus === "PAYER_ACTION_REQUIRED") pendingCount++;
        if (sub.paymentStatus === "APPROVED") completedCount++;
      }
    });
  });

  const ordersArray = Object.values(grouped);
  const recent = [...ordersArray]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  setTotalOrders(ordersArray.length);
  setPendingPayments(pendingCount);
  setCompletedOrders(completedCount);
  setRecentOrders(recent);
};


  return (
    <>
      <PageHeader 
        title="Dashboard"
        description="Welcome to SplitPal! Manage your apartment payments."
        rightContent={
          <Link href={AppRoutes.CREATE_ORDER}>
            <Button className="bg-primary hover:bg-primary/90">
              <Icon name="plus" className="mr-2" /> Create New Order
            </Button>
          </Link>
        }
      />
      
      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Orders" 
          value={totalOrders} 
          icon="list" 
          iconColor="primary"
        />
        <StatCard 
          title="Pending Payments" 
          value={pendingPayments} 
          icon="clock" 
          iconColor="warning"
        />
        <StatCard 
          title="Completed Orders" 
          value={completedOrders} 
          icon="check-circle" 
          iconColor="success"
        />
      </div>
      
      {/* Recent orders */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-secondary">Recent Orders</h2>
          <Link href={AppRoutes.VIEW_ORDERS}>
            <Button variant="ghost" className="text-primary">
              View All <Icon name="chevron-right" className="ml-1" />
            </Button>
          </Link>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="space-y-6">
            {recentOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onOrderUpdated={loadDashboardData}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Icon name="list-alt" className="text-xl" />
                </div>
                <h3 className="text-lg font-medium text-secondary mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">You haven't created any payment orders yet.</p>
                <Link href={AppRoutes.CREATE_ORDER}>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Icon name="plus" className="mr-2" /> Create New Order
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Quick links */}
      <div>
        <h2 className="text-xl font-semibold text-secondary mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href={AppRoutes.CREATE_ORDER}>
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow">
              <div className="mb-2 text-primary">
                <Icon name="plus-circle" className="text-xl" />
              </div>
              <h3 className="font-medium text-secondary">Create Order</h3>
              <p className="text-sm text-gray-500 mt-1">Create a new payment order</p>
            </div>
          </Link>
          
          <Link href={AppRoutes.PAY_SUBORDERS}>
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow">
              <div className="mb-2 text-primary">
                <Icon name="credit-card" className="text-xl" />
              </div>
              <h3 className="font-medium text-secondary">Pay Suborders</h3>
              <p className="text-sm text-gray-500 mt-1">Pay your share of expenses</p>
            </div>
          </Link>
          
          <Link href={AppRoutes.PAY_MAIN_ORDER}>
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow">
              <div className="mb-2 text-primary">
                <Icon name="dollar-sign" className="text-xl" />
              </div>
              <h3 className="font-medium text-secondary">Pay Main Order</h3>
              <p className="text-sm text-gray-500 mt-1">Pay the landlord/property management</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
