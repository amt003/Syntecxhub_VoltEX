import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Activity timeout in milliseconds (5 minutes of inactivity)
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export const useSessionManager = () => {
  const { initializeSession, logout, isAuthenticated, token, refreshToken } =
    useAuthStore();

  useEffect(() => {
    // Initialize session on mount
    initializeSession();

    // Check token expiry on mount
    const checkTokenExpiry = async () => {
      const authStore = useAuthStore.getState();
      if (
        isAuthenticated &&
        authStore.isTokenExpired() &&
        refreshToken &&
        !token
      ) {
        try {
          await authService.refreshToken(refreshToken);
        } catch (error) {
          console.error("Token refresh failed:", error);
          logout();
        }
      }
    };

    checkTokenExpiry();

    // Set up inactivity timeout
    let inactivityTimer: NodeJS.Timeout;
    let sessionTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      // Clear previous timers
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (sessionTimer) clearTimeout(sessionTimer);

      // Only set timers if authenticated
      if (isAuthenticated) {
        // Inactivity timeout - logout after 5 minutes of no activity
        inactivityTimer = setTimeout(() => {
          console.warn("Session inactive for 5 minutes. Logging out...");
          logout();
        }, INACTIVITY_TIMEOUT);

        // Session timeout - logout after 30 minutes regardless of activity
        sessionTimer = setTimeout(() => {
          console.warn("Session expired after 30 minutes. Logging out...");
          logout();
        }, SESSION_TIMEOUT);
      }
    };

    // Track user activity
    const handleActivity = () => {
      localStorage.setItem("lastActivityTime", Date.now().toString());
      resetInactivityTimer();
    };

    // Listen to user activity events
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initial setup
    resetInactivityTimer();

    // Check inactivity every minute
    const inactivityCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        const lastActivityTime =
          parseInt(localStorage.getItem("lastActivityTime") || "0") ||
          Date.now();
        const timeSinceLastActivity = Date.now() - lastActivityTime;

        if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
          console.warn("Session inactive. Logging out...");
          logout();
        }
      }
    }, 60000); // Check every minute

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (sessionTimer) clearTimeout(sessionTimer);
      clearInterval(inactivityCheckInterval);
    };
  }, [isAuthenticated, token, refreshToken, logout, initializeSession]);
};
