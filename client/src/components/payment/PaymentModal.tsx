import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Suborder, PaymentMethod } from "@/types";
import { formatCurrency } from "@/lib/utils";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PayPalCheckoutButton from "./PayPalCheckoutButton";
import { getCurrentUser } from "@/lib/sessionStorage";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@/components/ui/icon";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  suborder: Suborder;
  orderDescription: string;
  onPaymentComplete: () => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  suborder, 
  orderDescription,
  onPaymentComplete
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const { toast } = useToast();
  
  // Get the current logged-in user
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // If the current user doesn't match the payee email, show a warning
    if (user !== suborder.payee.email && isOpen) {
      toast({
        title: "Payment Notice",
        description: `You're logged in as ${user} but making a payment for ${suborder.payee.name} (${suborder.payee.email})`,
        variant: "destructive"
      });
    }
  }, [isOpen, suborder.payee]);

  const handlePaymentSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // In a real application, this would call your payment API
      // For this demo, we're simulating a successful payment after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      onPaymentComplete();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>
            {currentUser === suborder.payee.email ? (
              <>Making payment as <strong>{suborder.payee.name}</strong></>
            ) : (
              <>Making payment on behalf of <strong>{suborder.payee.name}</strong></>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <div className="bg-blue-50 rounded p-3 flex items-start mb-4">
              <Icon name="info-circle" className="text-blue-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-700">Payment Information</p>
                <p className="text-sm text-blue-600">
                  You're paying your portion of "{orderDescription}"
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6 bg-gray-50 p-4 rounded">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Amount due</span>
              <span className="font-medium text-secondary">{formatCurrency(suborder.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment method fee</span>
              <span className="font-medium text-secondary">{formatCurrency(0)}</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
              <span className="font-medium text-secondary">Total</span>
              <span className="font-bold text-secondary">{formatCurrency(suborder.amount)}</span>
            </div>
          </div>
          
          <PaymentMethodSelector 
            selectedMethod={paymentMethod}
            onSelectMethod={handlePaymentSelect}
          />
        </div>
        
        <DialogFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          {paymentMethod === 'paypal' ? (
            <div className="w-full">
              <PayPalCheckoutButton 
                amount={suborder.amount.toString()} 
                currency="USD" 
                intent="CAPTURE"
                onSuccess={onPaymentComplete}
                onError={(error) => {
                  toast({
                    title: "Payment Failed",
                    description: "There was an error processing your PayPal payment. Please try again.",
                    variant: "destructive"
                  });
                }}
              />
            </div>
          ) : (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? `Processing...` : `Pay ${formatCurrency(suborder.amount)}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
