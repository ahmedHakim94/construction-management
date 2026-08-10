import { Navigate, Outlet } from "react-router-dom";

import { ROUTE_PATHS } from "@/app/router/routeConstants";
import { useAppSelector } from "@/app/store/hooks";

export function ProtectedRoute() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.login} replace />;
  }

  return <Outlet />;
}
