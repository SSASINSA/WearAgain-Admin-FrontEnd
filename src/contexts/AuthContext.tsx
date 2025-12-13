import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authUtils } from "../utils/auth";
import apiRequest from "../utils/api";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | null;

interface AuthContextType {
  role: AdminRole;
  isLoading: boolean;
  fetchRole: () => Promise<void>;
  clearRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface RoleResponse {
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER";
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<AdminRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRole = useCallback(async () => {
    if (!authUtils.isAuthenticated()) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("/admin/auth/my-role", {
        method: "GET",
      });

      if (response.ok) {
        const data: RoleResponse = await response.json();
        setRole(data.role);
      } else {
        if (response.status === 401 || response.status === 403) {
          setRole(null);
          authUtils.clearTokens();
        }
      }
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

  // 초기 마운트 시 role 로드
  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      fetchRole();
    } else {
      setRole(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleTokenExpired = () => {
      clearRole();
    };

    window.addEventListener("authTokenExpired", handleTokenExpired);

    return () => {
      window.removeEventListener("authTokenExpired", handleTokenExpired);
    };
  }, [clearRole]);

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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
