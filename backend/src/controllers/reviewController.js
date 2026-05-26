import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Add a review
export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!rating || !title || !comment) {
      return res.status(400).json({
        message: "Please provide rating, title, and comment",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Fetch user to get name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const review = await Review.create({
      productId,
      userId,
      userName: user.name,
      rating,
      title,
      comment,
      verified: true, // Mark as verified since they're logged in
    });

    // Update product rating and review count
    const allReviews = await Review.find({ productId });
    const avgRating =
      allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviews: allReviews.length,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res
      .status(500)
      .json({ message: "Error adding review", error: error.message });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email");

    const totalReviews = await Review.countDocuments({ productId });

    // Calculate rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = await Review.countDocuments({
        productId,
        rating: i,
      });
    }

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
        currentPage: page,
      },
      ratingDistribution,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};

// Update review (only by review author)
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the author (convert both to string for comparison)
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only update your own reviews",
      });
    }

    // Update review
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    // Recalculate product rating
    const allReviews = await Review.find({ productId: review.productId });
    const avgRating =
      allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(review.productId, {
      rating: avgRating,
    });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating review", error: error.message });
  }
};

// Delete review (only by review author)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the author (convert both to string for comparison)
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own reviews",
      });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate product rating
    const allReviews = await Review.find({ productId });
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
        : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviews: allReviews.length,
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting review", error: error.message });
  }
};

// Mark review as helpful/unhelpful
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (helpful === true) {
      review.helpful += 1;
    } else if (helpful === false) {
      review.unhelpful += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: "Thanks for your feedback",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking helpful",
      error: error.message,
    });
  }
};
