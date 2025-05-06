import { UseFormReturn } from "react-hook-form";
import { IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";

interface PayeeFieldProps {
  index: number;
  form: UseFormReturn<any>;
  onRemove: () => void;
  canRemove: boolean;
}

export default function PayeeField({ index, form, onRemove, canRemove }: PayeeFieldProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-md">
      <FormField
        control={form.control}
        name={`payees.${index}.name`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input placeholder="Full Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name={`payees.${index}.email`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input placeholder="Email Address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {canRemove && (
        <div className="flex items-center">
          <IconButton 
            type="button" 
            variant="ghost" 
            size="icon"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500"
          >
            <Icon name="trash" />
          </IconButton>
        </div>
      )}
    </div>
  );
}
