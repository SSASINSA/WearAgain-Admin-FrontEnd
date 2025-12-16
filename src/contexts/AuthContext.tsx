import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authUtils } from "../utils/auth";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | null;

interface AuthContextType {
  role: AdminRole;
  isLoading: boolean;
  fetchRole: () => void;
  clearRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<AdminRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRole = useCallback(() => {
    if (!authUtils.isAuthenticated()) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const tokenRole = authUtils.getRoleFromToken();
      setRole(tokenRole);
    } catch (error) {
      console.error("역할 조회 실패:", error);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRole = useCallback(() => {
    setRole(null);
  }, []);

  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      fetchRole();
    } else {
      setRole(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleTokenExpired = () => {
      clearRole();
    };

    const handleTokenRefreshed = () => {
      fetchRole();
    };

    window.addEventListener("authTokenExpired", handleTokenExpired);
    window.addEventListener("authTokenRefreshed", handleTokenRefreshed);

    return () => {
      window.removeEventListener("authTokenExpired", handleTokenExpired);
      window.removeEventListener("authTokenRefreshed", handleTokenRefreshed);
    };
  }, [clearRole, fetchRole]);

  const value: AuthContextType = {
    role,
    isLoading,
    fetchRole,
    clearRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("인증 에러가 발생했습니다.");
  }
  return context;
};
