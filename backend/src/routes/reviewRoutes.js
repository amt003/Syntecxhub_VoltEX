import express from "express";
import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markHelpful,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get reviews for a product (public)
router.get("/product/:productId", getProductReviews);

// Add review (protected)
router.post("/product/:productId", protect, addReview);

// Update review (protected)
router.put("/:reviewId", protect, updateReview);

// Delete review (protected)
router.delete("/:reviewId", protect, deleteReview);

// Mark as helpful/unhelpful (public)
router.patch("/:reviewId/helpful", markHelpful);

export default router;
