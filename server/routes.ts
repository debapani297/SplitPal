import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

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
  
  // Order management routes
  app.get(`${apiPrefix}/orders`, async (req, res) => {
    try {
      const orders = storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve orders" });
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
  
  app.post(`${apiPrefix}/orders`, async (req, res) => {
    try {
      const newOrder = req.body;
      const savedOrder = storage.createOrder(newOrder);
      res.status(201).json(savedOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
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
