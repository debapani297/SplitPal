import { useState } from "react";
import { Order, Suborder } from "@/types";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { updateSuborderStatus, payMainOrder } from "@/lib/sessionStorage";
import SubordersList from "./SubordersList";
import PaymentModal from "@/components/payment/PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@/components/ui/icon";

interface OrderCardProps {
  order: Order;
  onOrderUpdated?: () => void;
}

export default function OrderCard({ order, onOrderUpdated }: OrderCardProps) {
  const [selectedSuborder, setSelectedSuborder] = useState<Suborder | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingMainPayment, setIsProcessingMainPayment] = useState(false);
  const { toast } = useToast();

  const openPaymentModal = (suborder: Suborder) => {
    setSelectedSuborder(suborder);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedSuborder(null);
  };

  const handlePaymentComplete = (suborderId: string) => {
    updateSuborderStatus(order.id, suborderId, "completed");
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
      variant: "success",
    });
    closePaymentModal();
    if (onOrderUpdated) onOrderUpdated();
  };

  const handlePayMainOrder = async () => {
    setIsProcessingMainPayment(true);
    
    try {
      // In a real app, this would make an API call to process the payment
      // For this demo, we'll just update the order status
      setTimeout(() => {
        payMainOrder(order.id);
        toast({
          title: "Main Payment Successful",
          description: "Your payment to the landlord has been processed successfully.",
          variant: "success",
        });
        setIsProcessingMainPayment(false);
        if (onOrderUpdated) onOrderUpdated();
      }, 1500);
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
      setIsProcessingMainPayment(false);
    }
  };

  const allSubordersPaid = order.suborders.every(suborder => suborder.status === "completed");

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Order header */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-secondary">{order.id}</h3>
            <span className={`ml-3 status-badge ${order.status === "pending" ? "status-pending" : "status-completed"}`}>
              {order.status === "pending" ? "Pending" : "Completed"}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{order.description}</p>
        </div>
        <div className="flex flex-col md:items-end">
          <span className="text-lg font-bold text-secondary">{formatCurrency(order.totalAmount)}</span>
          <span className="text-sm text-gray-500">
            {order.status === "completed" 
              ? `Paid: ${new Date(order.dueDate).toLocaleDateString()}`
              : `Due: ${new Date(order.dueDate).toLocaleDateString()}`}
          </span>
        </div>
      </div>
      
      {/* Suborders */}
      <SubordersList 
        suborders={order.suborders} 
        onPayClick={openPaymentModal} 
      />
      
      {/* Footer with landlord info */}
      <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">Payment to landlord</p>
          <p className="font-medium text-secondary">{order.landlord}</p>
        </div>
        
        {order.status === "pending" && allSubordersPaid ? (
          <Button 
            className="mt-3 sm:mt-0 bg-secondary hover:bg-secondary/90"
            onClick={handlePayMainOrder}
            disabled={isProcessingMainPayment}
          >
            {isProcessingMainPayment ? (
              <>Processing...</>
            ) : (
              <>
                <Icon name="dollar-sign" className="mr-1" /> Pay Main Order
              </>
            )}
          </Button>
        ) : order.status === "completed" ? (
          <div className="mt-3 sm:mt-0 px-4 py-2 bg-gray-200 text-secondary rounded flex items-center">
            <Icon name="check-circle" className="mr-1" /> Payment Complete
          </div>
        ) : (
          <div className="mt-3 sm:mt-0 px-4 py-2 bg-gray-200 text-secondary rounded flex items-center">
            <Icon name="info-circle" className="mr-1" /> All Suborders Must Be Paid
          </div>
        )}
      </div>
      
      {/* Payment Modal */}
      {selectedSuborder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          suborder={selectedSuborder}
          orderDescription={order.description}
          onPaymentComplete={() => handlePaymentComplete(selectedSuborder.id)}
        />
      )}
    </div>
  );
}
