import { lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { MainLayout } from "@/app/layouts/MainLayout";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import { ROUTE_PATHS } from "@/app/router/routeConstants";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const ContractorsPage = lazy(() => import("@/features/contractors/pages/ContractorsPage").then(m => ({ default: m.ContractorsPage })));
const DailyWorkPage = lazy(() => import("@/features/daily-work/pages/DailyWorkPage").then(m => ({ default: m.DailyWorkPage })));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const EquipmentPage = lazy(() => import("@/features/equipment/pages/EquipmentPage").then(m => ({ default: m.EquipmentPage })));
const PaymentPage = lazy(() => import("@/features/payments/pages/PaymentPage").then(m => ({ default: m.PaymentPage })));
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage").then(m => ({ default: m.ReportsPage })));
const EquipmentTypePage = lazy(() => import("@/features/settings/equipment-type/pages/EquipmentTypePage").then(m => ({ default: m.EquipmentTypePage })));
const TaskPage = lazy(() => import("@/features/settings/task/pages/TaskPage").then(m => ({ default: m.TaskPage })));
const ProjectPage = lazy(() => import("@/features/settings/projects/pages/ProjectPage").then(m => ({ default: m.ProjectPage })));

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
