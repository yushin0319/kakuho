// app/src/routes/PrivateRoute.tsx
// Login していない場合はログインページにリダイレクトする

import React from "react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || user === null) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
