import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add token to requests
api.interceptors.request.use((config) => {
  const authStore = useAuthStore.getState();
  const token = authStore.token;
  const refreshToken = authStore.refreshToken;

  // Update last activity time
  localStorage.setItem("lastActivityTime", Date.now().toString());

  // Don't set Content-Type for FormData - let axios handle it
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  // Check if token is expired and we have a refresh token
  if (authStore.isTokenExpired() && refreshToken && !isRefreshing) {
    isRefreshing = true;

    return authStore
      .refreshToken?.(refreshToken)
      .then(() => {
        const newToken = useAuthStore.getState().token;
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
        processQueue(null, newToken);
        return config;
      })
      .catch((error) => {
        processQueue(error, null);
        authStore.logout();
        window.location.href = "/login";
        return Promise.reject(error);
      })
      .finally(() => {
        isRefreshing = false;
      });
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle responses and refresh token if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const authStore = useAuthStore.getState();
      const refreshToken = authStore.refreshToken;

      if (refreshToken) {
        return api
          .post("/auth/refresh-token", { refreshToken })
          .then((response) => {
            const { accessToken, accessTokenExpiry } = response.data;
            authStore.setToken(accessToken, accessTokenExpiry);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            return api(originalRequest);
          })
          .catch((err) => {
            processQueue(err, null);
            authStore.logout();
            window.location.href = "/login";
            return Promise.reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        authStore.logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
