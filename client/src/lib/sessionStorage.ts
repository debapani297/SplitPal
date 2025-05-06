// Type imports
import { Order, Payee, Suborder } from "@/types";

// Local storage keys
const ORDERS_KEY = "splitpay_orders";
const CURRENT_USER_KEY = "splitpay_current_user";

// Get current user
export const getCurrentUser = (): string => {
  return localStorage.getItem(CURRENT_USER_KEY) || "default@example.com";
};

// Set current user
export const setCurrentUser = (email: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, email);
};

// Get all orders
export const getOrders = (): Order[] => {
  const ordersJson = localStorage.getItem(ORDERS_KEY);
  return ordersJson ? JSON.parse(ordersJson) : [];
};

// Get specific order
export const getOrderById = (orderId: string): Order | undefined => {
  const orders = getOrders();
  return orders.find((order) => order.id === orderId);
};

// Add order
export const addOrder = (order: Order): void => {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

// Update order
export const updateOrder = (updatedOrder: Order): void => {
  const orders = getOrders();
  const index = orders.findIndex((order) => order.id === updatedOrder.id);
  
  if (index !== -1) {
    orders[index] = updatedOrder;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};

// Update suborder status
export const updateSuborderStatus = (
  orderId: string, 
  suborderId: string, 
  status: "pending" | "completed"
): void => {
  const orders = getOrders();
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  
  if (orderIndex !== -1) {
    const suborderIndex = orders[orderIndex].suborders.findIndex(
      (suborder) => suborder.id === suborderId
    );
    
    if (suborderIndex !== -1) {
      orders[orderIndex].suborders[suborderIndex].status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  }
};

// Get orders for current user (as payee)
export const getCurrentUserOrders = (): Order[] => {
  const orders = getOrders();
  const currentUser = getCurrentUser();
  
  return orders.filter((order) =>
    order.suborders.some((suborder) => suborder.payee.email === currentUser)
  );
};

// Get orders with pending suborders for current user
export const getPendingOrders = (): Order[] => {
  const orders = getCurrentUserOrders();
  const currentUser = getCurrentUser();
  
  return orders.filter((order) =>
    order.suborders.some(
      (suborder) => 
        suborder.payee.email === currentUser && 
        suborder.status === "pending"
    )
  );
};

// Get orders with all suborders completed
export const getCompletedOrders = (): Order[] => {
  const orders = getOrders();
  
  return orders.filter((order) =>
    order.suborders.every((suborder) => suborder.status === "completed")
  );
};

// Get orders that are ready for final payment (all suborders paid)
export const getReadyForFinalPaymentOrders = (): Order[] => {
  const orders = getOrders();
  const currentUser = getCurrentUser();
  
  return orders.filter(
    (order) =>
      // Order contains at least one suborder for current user
      order.suborders.some((suborder) => suborder.payee.email === currentUser) &&
      // All suborders are paid
      order.suborders.every((suborder) => suborder.status === "completed") &&
      // Main order is not paid yet
      order.status === "pending"
  );
};

// Pay a main order (mark as completed)
export const payMainOrder = (orderId: string): void => {
  const orders = getOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  
  if (index !== -1) {
    orders[index].status = "completed";
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};

// Clear all data (for testing)
export const clearAllData = (): void => {
  localStorage.removeItem(ORDERS_KEY);
};

// Initialize with sample data if empty
export const initializeDataIfEmpty = (): void => {
  const orders = getOrders();
  
  if (orders.length === 0) {
    // Don't initialize with sample data by default
    // This would go against the guidelines to not use mock data
  }
};
