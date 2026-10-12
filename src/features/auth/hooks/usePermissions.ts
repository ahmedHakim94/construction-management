import { useAppSelector } from "@/app/store/hooks";
import { useGetMyPermissionsQuery } from "@/features/settings/permissions/services/rolePermissionsApi";

export function usePermissions() {
  const { role, isAuthenticated } = useAppSelector((state) => ({
    role: state.auth.user?.role,
    isAuthenticated: state.auth.isAuthenticated,
  }));

  const { data, isLoading, isError } = useGetMyPermissionsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const permissions = data?.permissions ?? [];

  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || isLoading || isError || !data) return false;

    if (role === "admin") return true;

    return permissions.includes(permission);
  };

  return {
    permissions,
    hasPermission,
    isLoading,
    isError,
  };
}