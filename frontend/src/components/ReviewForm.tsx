import React, { useState } from "react";
import { reviewService } from "../services/reviewService";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import "./ReviewForm.css";

interface ReviewFormProps {
  productId: string;
  onReviewAdded: () => void;
}

function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (title.length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }

    if (comment.length < 20) {
      toast.error("Comment must be at least 20 characters");
      return;
    }

    setLoading(true);
    try {
      await reviewService.addReview(productId, {
        rating,
        title,
        comment,
      });

      toast.success("Review added successfully!");
      setTitle("");
      setComment("");
      setRating(5);
      setShowForm(false);
      onReviewAdded();
    } catch (error: any) {
      console.error("Error adding review:", error);
      const errorMsg = error.response?.data?.message || "Failed to add review";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="review-form-section">
        <p className="login-required">⚠️ Please log in to write a review</p>
      </div>
    );
  }

  return (
    <div className="review-form-section">
      {!showForm ? (
        <button className="write-review-btn" onClick={() => setShowForm(true)}>
          ✍️ Write a Review
        </button>
      ) : (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h3>Share Your Experience</h3>
            <button
              type="button"
              className="close-btn"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>

          <div className="form-group">
            <label>Rating *</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= rating ? "active" : ""}`}
                  onClick={() => setRating(star)}
                  title={`${star} star${star > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
              <span className="rating-text">{rating} out of 5 stars</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Review Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience (e.g., 'Great product, highly recommended')"
              maxLength={100}
              required
            />
            <span className="char-count">{title.length} / 100</span>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Review Comment *</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product (at least 20 characters)"
              rows={5}
              maxLength={1000}
              required
            />
            <span className="char-count">{comment.length} / 1000</span>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Posting..." : "Post Review"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setShowForm(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ReviewForm;
