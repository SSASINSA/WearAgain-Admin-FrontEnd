import React from "react";
import { Navigate } from "react-router-dom";
import { authUtils } from "utils/auth";
import { useAuth } from "../../contexts/AuthContext";
import type { AdminRole } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AdminRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { role, isLoading } = useAuth();

  if (!authUtils.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

