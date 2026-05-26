import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  processPayment,
  cancelOrder,
  createRazorpayOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/razorpay/create-order", createRazorpayOrder);
router.post("/payment", processPayment);
router.put("/:id/cancel", cancelOrder);

export default router;
