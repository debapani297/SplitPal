import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { AppRoutes, OrderFormData } from "@/types";
import { addOrder, getCurrentUser } from "@/lib/sessionStorage";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PayeeField from "./PayeeField";
import { Icon } from "@/components/ui/icon";

// Form validation schema
const formSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  totalAmount: z.coerce.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  landlord: z.string().min(1, "Landlord name is required"),
  payees: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
    })
  ).min(1, "At least one payee is required"),
});

export default function CreateOrderForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = getCurrentUser();

  // Initialize the form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      totalAmount: 0,
      dueDate: new Date().toISOString().split("T")[0],
      landlord: "",
      payees: [{ name: "", email: currentUser }],
    },
  });

  // Add a new payee field
  const addPayee = () => {
    const currentPayees = form.getValues("payees");
    form.setValue("payees", [...currentPayees, { name: "", email: "" }]);
  };

  // Remove a payee field
  const removePayee = (index: number) => {
    const currentPayees = form.getValues("payees");
    if (currentPayees.length > 1) {
      const updatedPayees = currentPayees.filter((_, i) => i !== index);
      form.setValue("payees", updatedPayees);
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const totalAmount = Number(data.totalAmount);
      const amountPerPayee = totalAmount / data.payees.length;
      
      // Create new order object
      const newOrder = {
        id: `ORDER-${nanoid(6).toUpperCase()}`,
        description: data.description,
        totalAmount,
        dueDate: data.dueDate,
        landlord: data.landlord,
        suborders: data.payees.map(payee => ({
          id: `SUB-${nanoid(8).toUpperCase()}`,
          payee,
          amount: amountPerPayee,
          status: "pending" as const,
        })),
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      };
      
      // Save to session storage
      addOrder(newOrder);
      
      toast({
        title: "Order Created",
        description: "Your payment order has been created successfully.",
        variant: "success",
      });
      
      // Navigate to orders page
      navigate(AppRoutes.VIEW_ORDERS);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Order description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. July Apartment Rent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total amount */}
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Due date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Landlord */}
            <FormField
              control={form.control}
              name="landlord"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Landlord/Property Management</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Pacific Property Management" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Payees section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-secondary">Roommates</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addPayee}
                >
                  <Icon name="plus" className="mr-1" /> Add Roommate
                </Button>
              </div>
              
              <div className="space-y-4">
                {form.watch("payees").map((_, index) => (
                  <PayeeField
                    key={index}
                    index={index}
                    form={form}
                    onRemove={() => removePayee(index)}
                    canRemove={form.watch("payees").length > 1}
                  />
                ))}
              </div>
              
              {form.formState.errors.payees?.message && (
                <p className="text-sm text-red-500 mt-2">{form.formState.errors.payees.message}</p>
              )}
            </div>
            
            {/* Submit button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Creating Order...</>
                ) : (
                  <>Create Order</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
