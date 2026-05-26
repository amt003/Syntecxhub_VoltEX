import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null, expiry?: number) => void;
  setRefreshToken: (token: string | null) => void;
  logout: () => void;
  initializeSession: () => void;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null,
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  tokenExpiry: localStorage.getItem("tokenExpiry")
    ? parseInt(localStorage.getItem("tokenExpiry") || "0")
    : null,
  isAuthenticated: !!localStorage.getItem("token"),

  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  },

  setToken: (token, expiry) => {
    set({ token, isAuthenticated: !!token, tokenExpiry: expiry || null });
    if (token) {
      localStorage.setItem("token", token);
      if (expiry) {
        localStorage.setItem("tokenExpiry", expiry.toString());
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
    }
  },

  setRefreshToken: (token) => {
    set({ refreshToken: token });
    if (token) {
      localStorage.setItem("refreshToken", token);
    } else {
      localStorage.removeItem("refreshToken");
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      tokenExpiry: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("lastActivityTime");
  },

  initializeSession: () => {
    const state = get();
    // Set last activity time on init
    localStorage.setItem("lastActivityTime", Date.now().toString());
  },

  isTokenExpired: () => {
    const state = get();
    if (!state.tokenExpiry) return true;
    // Check if token expires in next 5 minutes
    return Date.now() > state.tokenExpiry - 5 * 60 * 1000;
  },
}));
