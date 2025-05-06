import React, { useState, useEffect } from "react";
import PayPalButton from "../PayPalButton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PayPalCheckoutButtonProps {
  amount: string;
  currency?: string;
  intent?: string;
  onSuccess?: (orderData: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

/**
 * A wrapper around the PayPal button component to connect with our API endpoints
 */
export default function PayPalCheckoutButton({
  amount,
  currency = "USD",
  intent = "CAPTURE",
  onSuccess,
  onError,
  className
}: PayPalCheckoutButtonProps) {
  const [isPaypalReady, setIsPaypalReady] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Create a reference to the onSuccess and onError callbacks
  const handleSuccess = (orderData: any) => {
    setIsProcessing(false);
    if (onSuccess) {
      onSuccess(orderData);
    }
  };
  
  const handleError = (error: any) => {
    setIsProcessing(false);
    console.error("PayPal payment error:", error);
    if (onError) {
      onError(error);
    }
  };
  
  // We need to create a PayPal order through our backend
  const createOrder = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch("/api/paypal/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          intent
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create PayPal order");
      }
      
      const orderData = await response.json();
      return orderData.id;
    } catch (error) {
      setIsProcessing(false);
      handleError(error);
      return null;
    }
  };
  
  // Capture the payment after approval
  const capturePayment = async (orderId: string) => {
    try {
      const response = await fetch(`/api/paypal/order/${orderId}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to capture PayPal payment");
      }
      
      const captureData = await response.json();
      handleSuccess(captureData);
    } catch (error) {
      handleError(error);
    }
  };
  
  // This is a simplified implementation that triggers the PayPal flow
  // In a more complex app, we'd use the PayPalButton component directly
  const handlePayPalClick = async () => {
    try {
      // Create the order first
      const orderId = await createOrder();
      if (!orderId) return;
      
      // For demo purposes, simulate a successful capture
      // In a real app with proper button integration, the capture
      // would happen after the user completes the PayPal flow
      await capturePayment(orderId);
    } catch (error: any) {
      handleError(error);
    }
  };

  return (
    <div className={className}>
      <Button 
        className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold relative"
        onClick={handlePayPalClick}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <img 
              src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" 
              alt="PayPal" 
              className="h-5 mr-2" 
            />
            Pay with PayPal
          </>
        )}
      </Button>
    </div>
  );
}