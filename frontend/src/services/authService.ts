import api from "./api";
import { useAuthStore } from "../store/authStore";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number;
  user: User;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  accessTokenExpiry: number;
}

export const authService = {
  register: async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    const response = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });
    if (response.data.accessToken) {
      const authStore = useAuthStore.getState();
      authStore.setToken(
        response.data.accessToken,
        response.data.accessTokenExpiry,
      );
      authStore.setRefreshToken(response.data.refreshToken);
      authStore.setUser(response.data.user);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    if (response.data.accessToken) {
      const authStore = useAuthStore.getState();
      authStore.setToken(
        response.data.accessToken,
        response.data.accessTokenExpiry,
      );
      authStore.setRefreshToken(response.data.refreshToken);
      authStore.setUser(response.data.user);
    }
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<RefreshTokenResponse>(
      "/auth/refresh-token",
      {
        refreshToken,
      },
    );
    if (response.data.accessToken) {
      const authStore = useAuthStore.getState();
      authStore.setToken(
        response.data.accessToken,
        response.data.accessTokenExpiry,
      );
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (error) {
      console.error("Error logging out from server:", error);
    }
    const authStore = useAuthStore.getState();
    authStore.logout();
  },

  getCurrentUser: async () => {
    const response = await api.get<{ success: boolean; user: User }>(
      "/auth/me",
    );
    return response.data.user;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<{ success: boolean; user: User }>(
      "/auth/profile",
      data,
    );
    return response.data.user;
  },
};
