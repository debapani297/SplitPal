export type OrderStatus =
  | "pending"
  | "completed"
  | "APPROVED"
  | "PAYER_ACTION_REQUIRED"
  | "CANCELLED"
  | "FAILED";


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
  paymentLink?: string;
}


export interface Order {
  id: string;
  description: string;
  totalAmount: number;
  suborders: Suborder[];
    paymentLink?: string;
  dueDate?: string;
  landlord?: string;
  status?: OrderStatus;
  createdAt?: string;
}

// Form data for creating an order
export interface OrderFormData {
  description: string;
  totalAmount: number;
  dueDate: string;
  landlord: string;
  payees: {
    name: string;
    email: string;
  }[];
}

// Payment method type
export type PaymentMethod = "card" | "paypal";

// Payment request data
export interface PaymentRequest {
  orderId?: string;
  suborderId?: string;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
}

export interface LightOrder {
  id: string;
  description: string;
  totalAmount: number;
  suborders: Suborder[];
}


// Routes in the application
export enum AppRoutes {
  DASHBOARD = "/",
  CREATE_ORDER = "/create-order",
  VIEW_ORDERS = "/view-orders",
  PAY_SUBORDERS = "/pay-suborders",
  PAY_MAIN_ORDER = "/pay-main-order"
}
