import { baseApi } from "@/core/api/baseApi";
import type {
  BackendSingleUserResponse,
  BackendUserItem,
  BackendUsersResponse,
  ChangeUserStatusPayload,
  User,
  UserFormValues,
  UsersParams,
  UsersResult,
} from "../types";

export const mapBackendUser = (item: BackendUserItem): User => ({
  id: item.id,
  name: item.name,
  email: item.email,
  role: item.role,
  projectId:
    item.project_id !== null && item.project_id !== undefined
      ? Number(item.project_id)
      : null,
  projectName: item.project_name ?? null,
  project_name: item.project_name ?? null,
  status:
    item.is_active === 1 || item.is_active === true ? "ACTIVE" : "INACTIVE",
  is_active: item.is_active === 1 || item.is_active === true ? 1 : 0,
  createdAt: item.created_at,
});

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResult, UsersParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        queryParams.set("page", String(page));
        queryParams.set("limit", String(limit));

        if (params?.search && params.search.trim()) {
          queryParams.set("search", params.search.trim());
        }

        if (params?.role) {
          queryParams.set("role", params.role);
        }

        if (
          params?.projectId !== undefined &&
          params?.projectId !== "" &&
          params?.projectId !== null
        ) {
          queryParams.set("projectId", String(params.projectId));
        }

        if (params?.status) {
          queryParams.set("status", params.status);
        }

        return `/users?${queryParams.toString()}`;
      },

      transformResponse: (response: BackendUsersResponse): UsersResult => ({
        data: (response.data || []).map(mapBackendUser),
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Users" as const, id })),
              { type: "Users" as const, id: "LIST" },
            ]
          : [{ type: "Users" as const, id: "LIST" }],
    }),

    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,

      transformResponse: (response: BackendSingleUserResponse): User =>
        mapBackendUser(response.data),

      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),

    createUser: builder.mutation<User, UserFormValues>({
      query: (data) => ({
        url: "/users/add",
        method: "POST",
        body: {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
          role: data.role,
          project_id: data.role === "super_admin" ? null : data.projectId,
          is_active: data.status === "ACTIVE" ? 1 : 0,
        },
      }),

      transformResponse: (response: BackendSingleUserResponse): User =>
        mapBackendUser(response.data),

      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    updateUser: builder.mutation<User, { id: number; data: Partial<UserFormValues> }>({
      query: ({ id, data }) => {
        const body: Record<string, unknown> = {};

        if (data.name !== undefined) body.name = data.name.trim();
        if (data.email !== undefined) body.email = data.email.trim().toLowerCase();
        if (data.password && data.password.trim()) body.password = data.password;
        if (data.role !== undefined) body.role = data.role;
        if (data.projectId !== undefined) {
          body.project_id = data.role === "super_admin" ? null : data.projectId;
        }
        if (data.status !== undefined) {
          body.is_active = data.status === "ACTIVE" ? 1 : 0;
        }

        return {
          url: `/users/edit/${id}`,
          method: "PUT",
          body,
        };
      },

      transformResponse: (response: BackendSingleUserResponse): User =>
        mapBackendUser(response.data),

      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    changeUserStatus: builder.mutation<
      { id: number; is_active: number },
      ChangeUserStatusPayload
    >({
      query: ({ id, status }) => ({
        url: `/users/status/${id}`,
        method: "PATCH",
        body: {
          is_active: status === "ACTIVE" ? 1 : 0,
        },
      }),

      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<{ id: number }, number>({
      query: (id) => ({
        url: `/users/delete/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserStatusMutation,
  useDeleteUserMutation,
} = usersApi;
