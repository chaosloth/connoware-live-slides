"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  token: string | null;
  login: (token: string, phoneNumber: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem("auth_token");
    const storedPhone = localStorage.getItem("auth_phone");
    const storedExpiry = localStorage.getItem("auth_expiry");

    if (storedToken && storedPhone && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      const now = Date.now();

      // Check if token is still valid (not expired)
      if (now < expiryTime) {
        setToken(storedToken);
        setPhoneNumber(storedPhone);
        setIsAuthenticated(true);
      } else {
        // Token expired, clear storage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_phone");
        localStorage.removeItem("auth_expiry");
      }
    }
  }, []);

  const login = (newToken: string, newPhoneNumber: string) => {
    // Set expiry to 24 hours from now
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours in milliseconds

    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_phone", newPhoneNumber);
    localStorage.setItem("auth_expiry", expiryTime.toString());

    setToken(newToken);
    setPhoneNumber(newPhoneNumber);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_phone");
    localStorage.removeItem("auth_expiry");
    setToken(null);
    setPhoneNumber(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, phoneNumber, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
