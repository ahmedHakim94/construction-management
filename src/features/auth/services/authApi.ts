import { baseApi } from "@/core/api/baseApi";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
};

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    getMe: builder.query<{ user: AuthUser }, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
