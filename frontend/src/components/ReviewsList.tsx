import React, { useState, useEffect, useCallback } from "react";
import { reviewService, Review } from "../services/reviewService";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import "./ReviewsList.css";

interface ReviewsListProps {
  productId: string;
  onReviewUpdate?: () => void;
  triggerRefresh?: boolean;
}

function ReviewsList({
  productId,
  onReviewUpdate,
  triggerRefresh,
}: ReviewsListProps) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingDistribution, setRatingDistribution] = useState<{
    [key: number]: number;
  }>({});

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewService.getProductReviews(productId, page);
      setReviews(data.reviews);
      setTotalPages(data.pagination?.pages || 1);
      if (data.ratingDistribution) {
        setRatingDistribution(data.ratingDistribution);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (triggerRefresh) {
      setPage(1);
    }
  }, [triggerRefresh]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      toast.success("Review deleted successfully");
      setReviews(reviews.filter((r) => r._id !== reviewId));
      if (onReviewUpdate) onReviewUpdate();
    } catch (error: any) {
      console.error("Error deleting review:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to delete review";
      toast.error(errorMsg);
    }
  };

  const handleMarkHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      await reviewService.markHelpful(reviewId, helpful);
      toast.success("Thanks for your feedback!");
    } catch (error) {
      console.error("Error marking helpful:", error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <span className="review-stars">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </span>
    );
  };

  const getRatingPercentage = (count: number) => {
    const total = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  if (loading && reviews.length === 0) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  return (
    <div className="reviews-section">
      <h2>Customer Reviews</h2>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <>
          {/* Rating Distribution */}
          <div className="rating-distribution">
            <div className="rating-stats">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="rating-row">
                  <span className="rating-label">{rating} ★</span>
                  <div className="rating-bar">
                    <div
                      className="rating-fill"
                      style={{
                        width: `${getRatingPercentage(
                          ratingDistribution[rating] || 0,
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="rating-count">
                    {ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="review-info">
                    <span className="review-author">{review.userName}</span>
                    {review.verified && (
                      <span className="verified-badge">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>

                <h4 className="review-title">{review.title}</h4>

                <p className="review-comment">{review.comment}</p>

                <div className="review-footer">
                  <div className="helpful-buttons">
                    <button
                      className="helpful-btn"
                      onClick={() => handleMarkHelpful(review._id, true)}
                      title="Mark as helpful"
                    >
                      👍 Helpful ({review.helpful})
                    </button>
                    <button
                      className="unhelpful-btn"
                      onClick={() => handleMarkHelpful(review._id, false)}
                      title="Mark as unhelpful"
                    >
                      👎 ({review.unhelpful})
                    </button>
                  </div>

                  {user?._id &&
                    review.userId &&
                    String(user._id) === String(review.userId) && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteReview(review._id)}
                        title="Delete your review"
                      >
                        🗑️ Delete
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="reviews-pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReviewsList;
