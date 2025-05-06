import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentMethod } from "@/types";
import { Icon } from "@/components/ui/icon";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ 
  selectedMethod, 
  onSelectMethod 
}: PaymentMethodSelectorProps) {
  return (
    <div className="mb-6">
      <Label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</Label>
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={(value) => onSelectMethod(value as PaymentMethod)}
      >
        <div className="border border-gray-300 rounded-md p-3 mb-3 flex items-center">
          <RadioGroupItem value="card" id="card" className="h-4 w-4 text-primary" />
          <Label htmlFor="card" className="ml-3 flex flex-1 items-center cursor-pointer">
            <Icon name="credit-card" className="text-gray-400 mr-2" />
            <span>Credit/Debit Card</span>
          </Label>
        </div>
        
        <div className="border border-gray-300 rounded-md p-3 flex items-center">
          <RadioGroupItem value="paypal" id="paypal" className="h-4 w-4 text-primary" />
          <Label htmlFor="paypal" className="ml-3 flex flex-1 items-center cursor-pointer">
            <Icon name="paypal" className="text-gray-400 mr-2" />
            <span>PayPal</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
