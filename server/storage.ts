import { Order, Suborder } from "./models/order";

// In-memory session storage (would normally be backed by a database)
let ordersData: Order[] = [];

export const storage = {
  // Get all orders
  getOrders: (): Order[] => {
    return [...ordersData];
  },
  
  // Get order by ID
  getOrderById: (orderId: string): Order | undefined => {
    return ordersData.find(order => order.id === orderId);
  },
  
  // Create a new order
  createOrder: (order: Order): Order => {
    ordersData.push(order);
    return order;
  },
  
  // Update order status
  updateOrderStatus: (orderId: string, status: "pending" | "completed"): Order | undefined => {
    const index = ordersData.findIndex(order => order.id === orderId);
    if (index === -1) return undefined;
    
    ordersData[index].status = status;
    return ordersData[index];
  },
  
  // Update suborder status
  updateSuborderStatus: (
    orderId: string,
    suborderId: string,
    status: "pending" | "completed"
  ): Order | undefined => {
    const orderIndex = ordersData.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return undefined;
    
    const suborderIndex = ordersData[orderIndex].suborders.findIndex(
      suborder => suborder.id === suborderId
    );
    
    if (suborderIndex === -1) return undefined;
    
    ordersData[orderIndex].suborders[suborderIndex].status = status;
    return ordersData[orderIndex];
  },
  
  // Get all orders for a specific user (by email)
  getUserOrders: (email: string): Order[] => {
    return ordersData.filter(order =>
      order.suborders.some(suborder => suborder.payee.email === email)
    );
  },
  
  // Get orders with pending payments for a user
  getUserPendingPayments: (email: string): Order[] => {
    return ordersData.filter(order =>
      order.suborders.some(
        suborder => 
          suborder.payee.email === email && 
          suborder.status === "pending"
      )
    );
  },
  
  // Get orders that are ready for final payment (all suborders paid)
  getReadyForFinalPaymentOrders: (email: string): Order[] => {
    return ordersData.filter(
      order =>
        // Order contains at least one suborder for current user
        order.suborders.some(suborder => suborder.payee.email === email) &&
        // All suborders are paid
        order.suborders.every(suborder => suborder.status === "completed") &&
        // Main order is not paid yet
        order.status === "pending"
    );
  },
  
  // Get suborders for a specific user
  getUserSuborders: (email: string): { suborder: Suborder, order: Order }[] => {
    const result: { suborder: Suborder, order: Order }[] = [];
    
    ordersData.forEach(order => {
      order.suborders
        .filter(suborder => suborder.payee.email === email)
        .forEach(suborder => {
          result.push({ suborder, order });
        });
    });
    
    return result;
  },
  
  // Clear all orders (for testing)
  clearAll: (): void => {
    ordersData = [];
  },
};
