import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AppRoutes, Order, Suborder } from "@/types";
import { getPendingOrders, getCurrentUser, updateSuborderStatus } from "@/lib/sessionStorage";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import PaymentModal from "@/components/payment/PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@/components/ui/icon";

export default function PaySuborders() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [pendingSuborders, setPendingSuborders] = useState<{ 
    suborder: Suborder; 
    order: Order;
  }[]>([]);
  const [selectedSuborder, setSelectedSuborder] = useState<{
    suborder: Suborder;
    order: Order;
  } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  
  // Fetch orders on mount
  useEffect(() => {
    fetchPendingPayments();
  }, []);
  
  const fetchPendingPayments = () => {
    const orders = getPendingOrders();
    setPendingOrders(orders);
    
    // Extract all pending suborders for the current user
    const suborders: { suborder: Suborder; order: Order }[] = [];
    
    orders.forEach(order => {
      order.suborders
        .filter(
          suborder => 
            suborder.payee.email === currentUser && 
            suborder.status === "pending"
        )
        .forEach(suborder => {
          suborders.push({ suborder, order });
        });
    });
    
    setPendingSuborders(suborders);
  };
  
  const openPaymentModal = (item: { suborder: Suborder; order: Order }) => {
    setSelectedSuborder(item);
    setIsPaymentModalOpen(true);
  };
  
  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedSuborder(null);
  };
  
  const handlePaymentComplete = (suborderId: string, orderId: string) => {
    updateSuborderStatus(orderId, suborderId, "completed");
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
      variant: "success",
    });
    closePaymentModal();
    fetchPendingPayments();
  };

  return (
    <>
      <PageHeader 
        title="Pay Suborders" 
        description="Make payments for your share of the rent"
      />
      
      {pendingSuborders.length > 0 ? (
        <div className="space-y-6">
          {pendingSuborders.map(({ suborder, order }) => (
            <Card key={suborder.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="px-6 py-4 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Order</span>
                  <h3 className="text-lg font-semibold text-secondary">{order.description}</h3>
                  <p className="text-sm text-gray-500">Due date: {new Date(order.dueDate).toLocaleDateString()}</p>
                </div>
                
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-sm text-gray-500">Your share</p>
                    <p className="text-xl font-bold text-secondary">{formatCurrency(suborder.amount)}</p>
                  </div>
                  
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => openPaymentModal({ suborder, order })}
                  >
                    Make Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
            <Icon name="check-circle" className="text-xl" />
          </div>
          <h3 className="text-lg font-medium text-secondary mb-2">All Caught Up!</h3>
          <p className="text-gray-500 mb-6">You don't have any pending payments.</p>
          <Link href={AppRoutes.VIEW_ORDERS}>
            <Button className="bg-primary hover:bg-primary/90">
              <Icon name="list-alt" className="mr-2" /> View All Orders
            </Button>
          </Link>
        </div>
      )}
      
      {/* Payment Modal */}
      {selectedSuborder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          suborder={selectedSuborder.suborder}
          orderDescription={selectedSuborder.order.description}
          onPaymentComplete={() => 
            handlePaymentComplete(selectedSuborder.suborder.id, selectedSuborder.order.id)
          }
        />
      )}
    </>
  );
}
