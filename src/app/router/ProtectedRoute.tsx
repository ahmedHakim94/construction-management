import { Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/routeConstants";
import { useAppSelector } from "@/app/store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.login} replace />;
  }

  return <>{children}</>;
}
