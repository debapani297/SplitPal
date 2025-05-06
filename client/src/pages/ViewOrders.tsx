import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AppRoutes, Order } from "@/types";
import { getOrders } from "@/lib/sessionStorage";
import PageHeader from "@/components/layout/PageHeader";
import OrderCard from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function ViewOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Fetch all orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = () => {
    // Get all orders from session storage without filtering
    const allOrders = getOrders();
    
    // If there are no orders, log for debugging
    if (allOrders.length === 0) {
      console.log("No orders found in storage");
    } else {
      console.log(`Found ${allOrders.length} orders in storage`);
    }
    
    // Sort by creation date (newest first)
    allOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setOrders(allOrders);
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
      
      <div className="mt-6">
        {renderOrdersList()}
      </div>
    </>
  );
  
  function renderOrdersList() {
    if (orders.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Icon name="file-invoice-dollar" className="text-xl" />
          </div>
          <h3 className="text-lg font-medium text-secondary mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">You haven't created any orders yet.</p>
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
