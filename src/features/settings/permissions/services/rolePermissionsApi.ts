import { baseApi } from "@/core/api/baseApi";

type RolePermissionsResponse = {
  permissions: string[];
};

type UpdateRolePermissionsRequest = {
  permissions: string[];
};

export const rolePermissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRolePermissions: builder.query<RolePermissionsResponse, void>({
      query: () => "/role-permissions",
    }),

    updateRolePermissions: builder.mutation<
      RolePermissionsResponse,
      UpdateRolePermissionsRequest
    >({
      query: (body) => ({
        url: "/role-permissions",
        method: "PUT",
        body,
      }),
    }),

    getMyPermissions: builder.query<{ permissions: string[] }, void>({
      query: () => "/role-permissions/me",
    }),
  }),
});

export const {
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
  useGetMyPermissionsQuery,
} = rolePermissionsApi;
