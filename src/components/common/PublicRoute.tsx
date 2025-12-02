import React from "react";
import { Navigate } from "react-router-dom";
import { authUtils } from "utils/auth";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  if (authUtils.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;

