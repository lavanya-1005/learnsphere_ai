import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import type { User, UserRole } from "../types/user";

type RoleRouteProps = {
  children: ReactElement;
  allowedRoles: UserRole[];
};

export default function RoleRoute({
  children,
  allowedRoles,
}: RoleRouteProps) {
  const token = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/" replace />;
  }

  const user: User = JSON.parse(storedUser);

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}