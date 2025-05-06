// Order status types
export type OrderStatus = "pending" | "completed";

// Payee info
export interface Payee {
  name: string;
  email: string;
}

// Suborder structure
export interface Suborder {
  id: string;
  payee: Payee;
  amount: number;
  status: OrderStatus;
}

// Main Order structure
export interface Order {
  id: string;
  description: string;
  totalAmount: number;
  dueDate: string;
  landlord: string;
  suborders: Suborder[];
  status: OrderStatus;
  createdAt: string;
}

// Form data for creating an order
export interface OrderFormData {
  description: string;
  totalAmount: number;
  dueDate: string;
  landlord: string;
  payees: Payee[];
}

// Payment request data
export interface PaymentRequest {
  orderId?: string;
  suborderId?: string;
  amount: number;
  description: string;
}
