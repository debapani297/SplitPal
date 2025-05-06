import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AppRoutes, Order } from "@/types";
import { getReadyForFinalPaymentOrders, payMainOrder } from "@/lib/sessionStorage";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@/components/ui/icon";

export default function PayMainOrder() {
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch orders on mount
  useEffect(() => {
    fetchReadyOrders();
  }, []);
  
  const fetchReadyOrders = () => {
    const orders = getReadyForFinalPaymentOrders();
    setReadyOrders(orders);
  };
  
  const handlePayMainOrder = async (orderId: string) => {
    setProcessingOrderId(orderId);
    
    try {
      // In a real app, this would make an API call to process the payment
      // For this demo, we'll just update the order status after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      payMainOrder(orderId);
      
      toast({
        title: "Payment Successful",
        description: "Your payment to the landlord has been processed successfully.",
        variant: "success",
      });
      
      fetchReadyOrders();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <>
      <PageHeader 
        title="Pay Main Order" 
        description="Make final payments to the landlord/property management"
      />
      
      {readyOrders.length > 0 ? (
        <div className="space-y-6">
          {readyOrders.map(order => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="px-6 py-4 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Order</span>
                  <h3 className="text-lg font-semibold text-secondary">{order.description}</h3>
                  <p className="text-sm text-gray-500">Due date: {new Date(order.dueDate).toLocaleDateString()}</p>
                </div>
                
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-500">All roommates have paid their shares</p>
                  <p className="text-sm text-secondary mb-4">Payment to: {order.landlord}</p>
                  
                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Total amount</span>
                      <span className="font-medium text-secondary">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment method fee</span>
                      <span className="font-medium text-secondary">{formatCurrency(0)}</span>
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                      <span className="font-medium text-secondary">Total</span>
                      <span className="font-bold text-secondary">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="bg-secondary hover:bg-secondary/90"
                      onClick={() => handlePayMainOrder(order.id)}
                      disabled={processingOrderId === order.id}
                    >
                      {processingOrderId === order.id ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Icon name="dollar-sign" className="mr-2" /> Pay {formatCurrency(order.totalAmount)}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Icon name="info-circle" className="text-xl" />
          </div>
          <h3 className="text-lg font-medium text-secondary mb-2">No Orders Ready for Final Payment</h3>
          <p className="text-gray-500 mb-6">
            You don't have any orders where all roommates have completed their payments.
          </p>
          <Link href={AppRoutes.VIEW_ORDERS}>
            <Button className="bg-primary hover:bg-primary/90">
              <Icon name="list-alt" className="mr-2" /> View All Orders
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
