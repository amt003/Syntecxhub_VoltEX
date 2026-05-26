import api from "./api";

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
  stock?: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

export interface CartResponse {
  success: boolean;
  cart: Cart;
  message?: string;
}

export const cartService = {
  getCart: async () => {
    const response = await api.get<CartResponse>("/cart");
    return response.data.cart;
  },

  addToCart: async (productId: string, quantity: number) => {
    const response = await api.post<CartResponse>("/cart/add", {
      productId,
      quantity,
    });
    return response.data.cart;
  },

  removeFromCart: async (productId: string) => {
    const response = await api.delete<CartResponse>(`/cart/${productId}`);
    return response.data.cart;
  },

  updateCartItem: async (productId: string, quantity: number) => {
    const response = await api.put<CartResponse>(`/cart/${productId}`, {
      quantity,
    });
    return response.data.cart;
  },

  clearCart: async () => {
    const response = await api.delete<CartResponse>("/cart");
    return response.data.cart;
  },
};
