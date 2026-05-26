import express from "express";
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  getSearchResults,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search", getSearchResults);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

export default router;
