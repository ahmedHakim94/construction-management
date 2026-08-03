import { Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/routeConstants";
import { useAppSelector } from "@/app/store/hooks";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.dashboard} replace />;
  }

  return <>{children}</>;
}
