import api from "./api";

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface DashboardData {
  success: boolean;
  stats: AdminStats;
  recentOrders: any[];
}

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get<DashboardData>("/admin/dashboard/stats");
    return response.data;
  },

  getProductAnalytics: async () => {
    const response = await api.get<any>("/admin/analytics/products");
    return response.data;
  },

  createProduct: async (productData: FormData | any) => {
    // Don't manually set Content-Type for FormData - let axios handle it
    const response = await api.post("/admin/products", productData);
    return response.data;
  },

  getAllProducts: async () => {
    const response = await api.get<any>("/admin/products");
    return response.data;
  },

  updateProduct: async (id: string, productData: any) => {
    // Check if productData is FormData (has append method)
    if (productData instanceof FormData) {
      // Don't manually set Content-Type for FormData - let axios handle it
      // axios will automatically set multipart/form-data with the correct boundary
      const response = await api.put(`/admin/products/${id}`, productData);
      return response.data;
    } else {
      // Regular object data
      const response = await api.put(`/admin/products/${id}`, productData);
      return response.data;
    }
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  getAllOrders: async (page: number = 1, status?: string) => {
    const response = await api.get<any>("/admin/orders", {
      params: { page, status },
    });
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
};
