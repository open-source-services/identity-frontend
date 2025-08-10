"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { isAuthenticated, getUserFromToken, clearTokens } from "@/lib/auth";
import { authAPI } from "@/lib/api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isAuthenticated()) {
          const userData = getUserFromToken();

          // Set user first to prevent redirect
          setUser(userData);

          // Optional: Validate token with backend (commented out for now)
          // This validation happens on API calls anyway via the interceptor
          /*
          try {
            await authAPI.validate();
          } catch (validationError) {
            console.error('Token validation failed:', validationError);
            if (validationError.response?.status === 401) {
              clearTokens();
              setUser(null);
            }
          }
          */
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
