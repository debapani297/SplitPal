import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { createMainOrder } from "./createMainOrder";
import { getUserOrders } from "./getUserOrders";
import { paySubOrders } from "./payOrders";
import { getFullDetails } from "./getFullDetails";
import { handleRejectedPayment } from "./handleRejectedPayment";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiPrefix = "/api";
  
  // PayPal routes
  app.get(`${apiPrefix}/paypal/setup`, async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post(`${apiPrefix}/paypal/order`, async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post(`${apiPrefix}/paypal/order/:orderID/capture`, async (req, res) => {
    await capturePaypalOrder(req, res);
  });

app.post(`${apiPrefix}/orders/:email`, async (req, res) => {
  const userOrderMap = req.body;
  const userEmail = req.params.email;

  if (!userOrderMap || typeof userOrderMap !== "object") {
    return res.status(400).json({ error: "Invalid session data" });
  }

  try {
    const orders = await getUserOrders(userEmail, userOrderMap);
    const resp= await getFullDetails(userEmail, orders);
    res.json(resp);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
});

app.post(`${apiPrefix}/get-suborders`, async (req, res) => {
  const userEmail = req.body.email;
  const userOrders = req.body.mainOrders;
  const userSuborders = req.body.subOrders;

  if (!userEmail || !userOrders || !userSuborders) {
    return res.status(400).json({ error: "Invalid session data" });
  }

  const userOrderMap = {
    [userEmail]: {
      mainOrder: userOrders,
      subOrder: userSuborders,
    }
  };

  try {
     const orders = await getUserOrders(userEmail, userOrderMap);
    const resp = await paySubOrders(userEmail, orders);
    res.json(resp);
    
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
});


  
  app.get(`${apiPrefix}/orders/:id`, async (req, res) => {
    try {
      const order = storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve order" });
    }
  });

  app.post(`${apiPrefix}/createOrder`, async (req, res) => {
    try {
      const { order, participants } = req.body;
  
      const { description, amount } = order;

      console.log(description);
      console.log(amount);
      console.log(participants);
  
      const result = await createMainOrder(description, amount, participants);

      console.log(result);
  
      res.status(201).json({ message: "Order created", data: result });
  
    } catch (error) {
      console.error("❌ Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  app.patch(`${apiPrefix}/reject/`, async (req, res) => {
    try {
      const suborderId = req.body.suborderId;
      if (!suborderId) {
        return res.status(400).json({ error: "Invalid suborder Id" });
      }
      
      const updatedOrder = handleRejectedPayment(suborderId);
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.status(200).json({ error: updatedOrder });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  
  app.patch(`${apiPrefix}/orders/:id/status`, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["pending", "completed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updatedOrder = storage.updateOrderStatus(req.params.id, status);
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  
  app.patch(`${apiPrefix}/orders/:orderId/suborders/:suborderId/status`, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["pending", "completed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updatedOrder = storage.updateSuborderStatus(
        req.params.orderId,
        req.params.suborderId,
        status
      );
      
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order or suborder not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update suborder status" });
    }
  });
  
  app.get(`${apiPrefix}/user/orders`, async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const orders = storage.getUserOrders(email);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user orders" });
    }
  });
  
  app.get(`${apiPrefix}/user/pending-payments`, async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const orders = storage.getUserPendingPayments(email);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve pending payments" });
    }
  });
  
  app.get(`${apiPrefix}/user/ready-for-final-payment`, async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const orders = storage.getReadyForFinalPaymentOrders(email);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve orders ready for final payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
