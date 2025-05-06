import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AppRoutes, Order } from "@/types";
import { getOrders, getCurrentUser } from "@/lib/sessionStorage";
import PageHeader from "@/components/layout/PageHeader";
import OrderCard from "@/components/orders/OrderCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function ViewOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTab, setCurrentTab] = useState("all");
  
  // Fetch orders on mount and when tab changes
  useEffect(() => {
    fetchOrders();
  }, [currentTab]);
  
  const fetchOrders = () => {
    const allOrders = getOrders();
    const currentUser = getCurrentUser();
    
    // Filter orders where current user is a participant
    let filteredOrders = allOrders.filter(order =>
      order.suborders.some(suborder => suborder.payee.email === currentUser)
    );
    
    // Apply additional filters based on tab
    if (currentTab === "pending") {
      filteredOrders = filteredOrders.filter(order => 
        order.status === "pending" || 
        order.suborders.some(
          suborder => 
            suborder.payee.email === currentUser && 
            suborder.status === "pending"
        )
      );
    } else if (currentTab === "completed") {
      filteredOrders = filteredOrders.filter(order => 
        order.status === "completed" && 
        order.suborders.every(
          suborder => 
            suborder.payee.email !== currentUser || 
            suborder.status === "completed"
        )
      );
    }
    
    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setOrders(filteredOrders);
  };
  
  const handleOrderUpdated = () => {
    fetchOrders();
  };

  return (
    <>
      <PageHeader 
        title="View Orders" 
        description="Manage your payment orders and track their status"
        rightContent={
          <Link href={AppRoutes.CREATE_ORDER}>
            <Button className="bg-primary hover:bg-primary/90">
              <Icon name="plus" className="mr-2" /> Create New Order
            </Button>
          </Link>
        }
      />
      
      <Tabs defaultValue="all" onValueChange={setCurrentTab} className="mb-6">
        <TabsList className="w-full border-b border-gray-200 bg-transparent">
          <TabsTrigger 
            value="all"
            className="flex-1 data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300 rounded-none py-4"
          >
            All Orders
          </TabsTrigger>
          <TabsTrigger 
            value="pending"
            className="flex-1 data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300 rounded-none py-4"
          >
            Pending Payments
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="flex-1 data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300 rounded-none py-4"
          >
            Completed
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {renderOrdersList()}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          {renderOrdersList()}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {renderOrdersList()}
        </TabsContent>
      </Tabs>
    </>
  );
  
  function renderOrdersList() {
    if (orders.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Icon name="list-alt" className="text-xl" />
          </div>
          <h3 className="text-lg font-medium text-secondary mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">You don't have any {currentTab !== "all" ? `${currentTab} ` : ""}orders.</p>
          <Link href={AppRoutes.CREATE_ORDER}>
            <Button className="bg-primary hover:bg-primary/90">
              <Icon name="plus" className="mr-2" /> Create New Order
            </Button>
          </Link>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {orders.map(order => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onOrderUpdated={handleOrderUpdated}
          />
        ))}
      </div>
    );
  }
}
