import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { ROUTE_PATHS } from "@/app/router/routeConstants";
import { useAppSelector } from "@/app/store/hooks";

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, role } = useAppSelector((state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    role: state.auth.user?.role,
  }));

  if (isAuthenticated) {
    return (
      <Navigate
        to={role === "admin" ? ROUTE_PATHS.dashboard : "/equipment"}
        replace
      />
    );
  }

  return <>{children}</>;
}
