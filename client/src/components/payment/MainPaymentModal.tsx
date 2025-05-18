import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface MainPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onPaymentComplete: () => void;
}

export default function MainPaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentComplete,
}: MainPaymentModalProps) {
  const handlePayment = () => {
    console.log(order);
    if (order.paymentLink) {
      window.open(order.paymentLink, "_blank");
      onClose();
      onPaymentComplete();
    } else {
      alert("Payment link not available.");
    }
  };

  // ✅ Add `return ( ... )` to wrap the JSX
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Main Order</DialogTitle>
          <DialogDescription>
            You're paying <strong>{formatCurrency(order.totalAmount)}</strong> to landlord <strong>{order.landlord}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium text-secondary">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
              <span className="font-medium text-secondary">Total</span>
              <span className="font-bold text-secondary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-secondary" onClick={handlePayment}>
            Pay Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
