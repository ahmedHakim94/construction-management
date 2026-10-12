import { lazy, type ReactNode } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { MainLayout } from "@/app/layouts/MainLayout";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import { ROUTE_PATHS } from "@/app/router/routeConstants";
import { useAppSelector } from "@/app/store/hooks";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);

const ContractorsPage = lazy(() =>
  import("@/features/contractors/pages/ContractorsPage").then((m) => ({
    default: m.ContractorsPage,
  })),
);

const DailyWorkPage = lazy(() =>
  import("@/features/daily-work/pages/DailyWorkPage").then((m) => ({
    default: m.DailyWorkPage,
  })),
);

const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);

const EquipmentPage = lazy(() =>
  import("@/features/equipment/pages/EquipmentPage").then((m) => ({
    default: m.EquipmentPage,
  })),
);

const PaymentPage = lazy(() =>
  import("@/features/payments/pages/PaymentPage").then((m) => ({
    default: m.PaymentPage,
  })),
);

const ReportsPage = lazy(() =>
  import("@/features/reports/pages/ReportsPage").then((m) => ({
    default: m.ReportsPage,
  })),
);

const EquipmentTypePage = lazy(() =>
  import("@/features/settings/equipment-type/pages/EquipmentTypePage").then(
    (m) => ({
      default: m.EquipmentTypePage,
    }),
  ),
);

const TaskPage = lazy(() =>
  import("@/features/settings/task/pages/TaskPage").then((m) => ({
    default: m.TaskPage,
  })),
);

const ProjectPage = lazy(() =>
  import("@/features/settings/projects/pages/ProjectPage").then((m) => ({
    default: m.ProjectPage,
  })),
);

const PermissionsPage = lazy(() =>
  import("@/features/settings/permissions/pages/PermissionsPage").then((m) => ({
    default: m.PermissionsPage,
  })),
);

// ==========================================
// Default Redirect Based on Role
// ==========================================

function DefaultRedirect() {
  const role = useAppSelector((state) => state.auth.user?.role);

  return (
    <Navigate
      to={role === "admin" ? ROUTE_PATHS.dashboard : "/equipment"}
      replace
    />
  );
}

// ==========================================
// Route Permission Protection
// ==========================================

interface RequirePermissionProps {
  permission?: string;
  adminOnly?: boolean;
  children: ReactNode;
}

function RequirePermission({
  permission,
  adminOnly = false,
  children,
}: RequirePermissionProps) {
  const { hasPermission, isLoading, isError } = usePermissions();

  const isAdmin = useAppSelector((state) => state.auth.user?.role === "admin");

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Typography sx={{ p: 4 }}>Unable to load permissions.</Typography>;
  }

  const allowed = adminOnly
    ? isAdmin
    : isAdmin || (permission ? hasPermission(permission) : false);

  if (!allowed) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700}>
          403 - Access Denied
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          You don't have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}

// ==========================================
// Router
// ==========================================

export const router = createBrowserRouter([
  // Root
  {
    path: "/",
    element: (
      <PublicRoute>
        <Navigate to={ROUTE_PATHS.login} replace />
      </PublicRoute>
    ),
  },

  // Public Routes
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: "*",
        element: (
          <PublicRoute>
            <Navigate to={ROUTE_PATHS.login} replace />
          </PublicRoute>
        ),
      },
    ],
  },

  // Protected Routes
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <DefaultRedirect />,
          },
          {
            path: "dashboard",
            element: (
              <RequirePermission permission="dashboard.view">
                <DashboardPage />
              </RequirePermission>
            ),
          },
          {
            path: "contractors",
            element: (
              <RequirePermission permission="contractors.view">
                <ContractorsPage />
              </RequirePermission>
            ),
          },
          {
            path: "equipment",
            element: (
              <RequirePermission permission="equipment.view">
                <EquipmentPage />
              </RequirePermission>
            ),
          },
          {
            path: "settings/equipment-types",
            element: (
              <RequirePermission permission="equipmentTypes.view">
                <EquipmentTypePage />
              </RequirePermission>
            ),
          },
          {
            path: "settings/tasks",
            element: (
              <RequirePermission permission="tasks.view">
                <TaskPage />
              </RequirePermission>
            ),
          },
          {
            path: "settings/projects",
            element: (
              <RequirePermission permission="projects.view">
                <ProjectPage />
              </RequirePermission>
            ),
          },
          {
            path: "settings/permissions",
            element: (
              <RequirePermission adminOnly>
                <PermissionsPage />
              </RequirePermission>
            ),
          },
          {
            path: "daily-work",
            element: (
              <RequirePermission permission="dailyWork.view">
                <DailyWorkPage />
              </RequirePermission>
            ),
          },
          {
            path: "payments",
            element: (
              <RequirePermission permission="payments.view">
                <PaymentPage />
              </RequirePermission>
            ),
          },
          {
            path: "reports",
            element: (
              <RequirePermission permission="reports.view">
                <ReportsPage />
              </RequirePermission>
            ),
          },
          {
            path: "*",
            element: <DefaultRedirect />,
          },
        ],
      },
    ],
  },
]);
