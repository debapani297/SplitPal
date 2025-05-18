export interface PayeeInfo {
  name: string;
  email: string;
  phone?: string;
  amount?: number;
}

export interface MainOrderResponse {
  orderId: string;
  description: string;
  totalAmount: number;
  paymentLink?: string;
  paymentStatus?: string;
}

export interface SuborderResponse {
  mainOrder: {
    description: string;
    totalAmount: number;
    orderId: string;
  };
  payees: {
    name: string;
    email: string;
    orderId: string;
    suborderAmount: number;
    paymentLink: string;
    emailMessage: string;
    paymentStatus: string;
  }[];
}

export interface Suborder {
  mainOrder: {
    description: string;
    totalAmount: number;
    orderId: string;
  };
  subOrder: {
    name: string;
    email: string;
    orderId: string;
    suborderAmount: number;
  };
}

export interface UserOrdersResponse {
  user: string;
  orders: {
    mainOrder: {
      description: string;
      totalAmount: number;
      orderId: string;
      paymentLink: string;
    };
    subOrder: {
      name: string;
      email: string;
      orderId: string;
      suborderAmount: number;
      paymentStatus: string;
      paymentLink: string;
    }[];
  }[];
}

export interface SuborderSummary {
  mainID: string;
  suborders: {
    orderId: string;
    name: string;
    email: string;
  }[];
};