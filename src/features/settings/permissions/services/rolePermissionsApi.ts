import { baseApi } from "@/core/api/baseApi";

type RolePermissionsResponse = {
  permissions: string[];
};

type UpdateRolePermissionsRequest = {
  userId: number;
  permissions: string[];
};

export const rolePermissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRolePermissions: builder.query<RolePermissionsResponse, number>({
      query: (userId) => `/role-permissions/${userId}`,
    }),

    updateRolePermissions: builder.mutation<
      RolePermissionsResponse,
      UpdateRolePermissionsRequest
    >({
      query: ({ userId, permissions }) => ({
        url: `/role-permissions/${userId}`,
        method: "PUT",
        body: { permissions },
      }),
    }),

    getMyPermissions: builder.query<RolePermissionsResponse, void>({
      query: () => "/role-permissions/me",
    }),

    getUsers: builder.query<
      {
        users: {
          id: number;
          name: string;
          email: string;
          role: "user";
          project_id: number | null;
        }[];
      },
      void
    >({
      query: () => "/users",
    }),
  }),
});

export const {
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
  useGetMyPermissionsQuery,
  useGetUsersQuery,
} = rolePermissionsApi;
