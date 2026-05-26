import api from "./api";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod: string;
  transactionId: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  order: Order;
  message?: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  razorpayOrder: {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
  };
  keyId: string;
}

export const orderService = {
  createOrder: async (shippingAddress: ShippingAddress) => {
    const response = await api.post<OrderResponse>("/orders", {
      shippingAddress,
    });
    return response.data.order;
  },

  getOrders: async () => {
    const response = await api.get<{ success: boolean; orders: Order[] }>(
      "/orders",
    );
    return response.data.orders;
  },

  getOrderById: async (id: string) => {
    const response = await api.get<OrderResponse>(`/orders/${id}`);
    return response.data.order;
  },

  createRazorpayOrder: async (orderId: string) => {
    const response = await api.post<RazorpayOrderResponse>(
      "/orders/razorpay/create-order",
      {
        orderId,
      },
    );
    return response.data;
  },

  processPayment: async (
    orderId: string,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
  ) => {
    const response = await api.post<OrderResponse>("/orders/payment", {
      orderId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    });
    return response.data.order;
  },

  cancelOrder: async (id: string) => {
    const response = await api.put<OrderResponse>(`/orders/${id}/cancel`);
    return response.data.order;
  },
};
