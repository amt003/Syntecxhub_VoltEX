import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  getProductAnalytics,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadProductImages } from "../middleware/upload.js";

const router = express.Router();

router.use(protect, authorize("admin"));

// Product Management
router.get("/products", getAllProducts);
router.post("/products", uploadProductImages, createProduct);
router.put("/products/:id", uploadProductImages, updateProduct);
router.delete("/products/:id", deleteProduct);

// Order Management
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);
router.get("/analytics/products", getProductAnalytics);

export default router;
