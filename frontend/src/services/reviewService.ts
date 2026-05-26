import api from "./api";

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  unhelpful: number;
  verified: boolean;
  createdAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  pagination?: {
    total: number;
    pages: number;
    currentPage: number;
  };
  ratingDistribution?: {
    [key: number]: number;
  };
}

export const reviewService = {
  // Get reviews for a product
  getProductReviews: async (productId: string, page: number = 1) => {
    const response = await api.get<ReviewsResponse>(
      `/reviews/product/${productId}`,
      {
        params: { page, limit: 10 },
      },
    );
    return response.data;
  },

  // Add a review
  addReview: async (
    productId: string,
    data: {
      rating: number;
      title: string;
      comment: string;
    },
  ) => {
    const response = await api.post(`/reviews/product/${productId}`, data);
    return response.data;
  },

  // Update a review
  updateReview: async (
    reviewId: string,
    data: {
      rating?: number;
      title?: string;
      comment?: string;
    },
  ) => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful/unhelpful
  markHelpful: async (reviewId: string, helpful: boolean) => {
    const response = await api.patch(`/reviews/${reviewId}/helpful`, {
      helpful,
    });
    return response.data;
  },
};
