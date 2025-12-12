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

  // 인증 체크
  if (!authUtils.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // role 로딩 중일 때는 대기
  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  // allowedRoles가 지정된 경우 role 체크
  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      // 권한이 없으면 대시보드로 리다이렉트
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

