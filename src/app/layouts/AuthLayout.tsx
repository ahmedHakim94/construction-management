import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AppLoader } from "@/components/ui";

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <main className="auth-layout__content">
        <Suspense fallback={<AppLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
