import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AppRoutes, Order, OrderStatus } from "@/types";
import { getCurrentUser, getOrders } from "@/lib/sessionStorage";
import PageHeader from "@/components/layout/PageHeader";
import OrderCard from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { fetchUserOrders } from "@/lib/api"; // Adjust path as needed
import { toast } from "@/hooks/use-toast";

export default function ViewOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Fetch all orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      const userEmail = getCurrentUser(); // get user from session
      console.log(userEmail);
      const response = await fetchUserOrders(userEmail);

    if (!response.orders || response.orders.length === 0) {
      setOrders([]);
      return;
    }
  
      // Step 1: Group by mainOrder.orderId
      const grouped: { [key: string]: Order } = {};
  
      response.orders.forEach(({ mainOrder, subOrder }) => {
        const orderId = mainOrder.orderId;
        const [beforeFor, afterFor] = mainOrder.description.split("for").map(str => str.trim());
        if (!grouped[orderId]) {
          grouped[orderId] = {
            id: orderId,
            description: beforeFor,
            totalAmount: mainOrder.totalAmount,
            dueDate: new Date().toISOString(), // mock or add from backend
            landlord: afterFor, // you can replace this if you return landlord info
            status: mainOrder.paymentStatus as OrderStatus, // default unless backend returns something else
            createdAt: new Date().toISOString(),
            paymentLink: mainOrder.paymentLink,
            suborders: [],
          };
        }
  
        subOrder.forEach(sub => {
          grouped[orderId].suborders.push({
            id: sub.orderId,
            amount: sub.suborderAmount,
            status: sub.paymentStatus as OrderStatus,
            payee: {
              name: sub.name,
              email: sub.email,
            },
          });
        });
      });
  
      // Step 2: Convert the grouped object into an array
      const transformedOrders = Object.values(grouped);
  
      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "There was a problem fetching your orders.",
        variant: "destructive",
      });
    }
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
