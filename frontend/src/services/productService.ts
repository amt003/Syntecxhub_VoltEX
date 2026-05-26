import api from "./api";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  featured: boolean;
  discount: number;
  specifications: Record<string, string>;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination?: {
    total: number;
    pages: number;
    currentPage: number;
  };
}

export const productService = {
  getProducts: async (category?: string, search?: string, page: number = 1) => {
    const response = await api.get<ProductsResponse>("/products", {
      params: { category, search, page, limit: 12 },
    });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await api.get<{ success: boolean; product: Product }>(
      `/products/${id}`,
    );
    return response.data.product;
  },

  getFeaturedProducts: async () => {
    const response = await api.get<ProductsResponse>("/products/featured");
    return response.data.products;
  },

  getProductsByCategory: async (category: string) => {
    const response = await api.get<ProductsResponse>(
      `/products/category/${category}`,
    );
    return response.data.products;
  },

  searchProducts: async (query: string) => {
    const response = await api.get<ProductsResponse>("/products/search", {
      params: { q: query },
    });
    return response.data.products;
  },
};
