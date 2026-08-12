import { Navigate, createBrowserRouter } from "react-router-dom";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { MainLayout } from "@/app/layouts/MainLayout";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import { ROUTE_PATHS } from "@/app/router/routeConstants";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ContractorsPage } from "@/features/contractors/pages/ContractorsPage";
import { DailyWorkPage } from "@/features/daily-work/pages/DailyWorkPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { EquipmentPage } from "@/features/equipment/pages/EquipmentPage";
import { PaymentPage } from "@/features/payments/pages/PaymentPage";
import { ReportsPage } from "@/features/reports/pages/ReportsPage";
import { EquipmentTypePage } from "@/features/settings/equipment-type/pages/EquipmentTypePage";
import { TaskPage } from "@/features/settings/task/pages/TaskPage";
import { ProjectPage } from "@/features/settings/projects/pages/ProjectPage";

export const router = createBrowserRouter([
  // ==========================================
  // Root
  // ==========================================
  {
    path: "/",
    element: (
      <PublicRoute>
        <Navigate to={ROUTE_PATHS.login} replace />
      </PublicRoute>
    ),
  },

  // ==========================================
  // Public Routes
  // ==========================================
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

  // ==========================================
  // Protected Routes
  // ==========================================
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "contractors",
            element: <ContractorsPage />,
          },
          {
            path: "equipment",
            element: <EquipmentPage />,
          },
          {
            path: "settings/equipment-types",
            element: <EquipmentTypePage />,
          },
          {
            path: "settings/tasks",
            element: <TaskPage />,
          },
          {
            path: "settings/projects",
            element: <ProjectPage />,
          },
          {
            path: "daily-work",
            element: <DailyWorkPage />,
          },
          {
            path: "payments",
            element: <PaymentPage />,
          },
          {
            path: "reports",
            element: <ReportsPage />,
          },
          // {
          //   path: "settings",
          //   element: <SettingsPage />,
          // },
          {
            path: "*",
            element: <Navigate to={ROUTE_PATHS.dashboard} replace />,
          },
        ],
      },
    ],
  },
]);
