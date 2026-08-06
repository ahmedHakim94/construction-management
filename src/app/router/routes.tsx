import { Navigate, createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { MainLayout } from "@/app/layouts/MainLayout";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import { ROUTE_PATHS } from "@/app/router/routeConstants";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ContractorsPage } from "@/features/contractors/pages/ContractorsPage";
import { DailyWorkPage } from "@/features/daily-work/pages/DailyWorkPage";
import { DashboardPlaceholderPage } from "@/features/dashboard/pages/DashboardPlaceholderPage";
import { EquipmentPage } from "@/features/equipment/pages/EquipmentPage";
import { PaymentsPage } from "@/features/payments/pages/PaymentsPage";
import { ReportsPage } from "@/features/reports/pages/ReportsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { EquipmentTypePage } from "@/features/settings/equipment-type/pages/EquipmentTypePage";
import { TaskPage } from "@/features/settings/task/pages/TaskPage";
import { ProjectPage } from "@/features/settings/projects/pages/ProjectPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <Navigate to={ROUTE_PATHS.login} replace />
      </PublicRoute>
    ),
  },
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
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPlaceholderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "contractors",
        element: (
          <ProtectedRoute>
            <ContractorsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "equipment",
        element: (
          <ProtectedRoute>
            <EquipmentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/equipment-types",
        element: (
          <ProtectedRoute>
            <EquipmentTypePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/tasks",
        element: (
          <ProtectedRoute>
            <TaskPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/projects",
        element: (
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "daily-work",
        element: (
          <ProtectedRoute>
            <DailyWorkPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payments",
        element: (
          <ProtectedRoute>
            <PaymentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: (
          <ProtectedRoute>
            <Navigate to={ROUTE_PATHS.dashboard} replace />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
