import { baseApi } from "@/core/api/baseApi";
import type {
  CreateDailyWorkPayload,
  CreateDailyWorkResponse,
  GetDailyWorkParams,
  GetDailyWorkResponse,
} from "../types";

export const dailyWorkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDailyWork: builder.query<GetDailyWorkResponse, GetDailyWorkParams>({
      query: ({ page, limit, search, date }) => ({
        url: "/daily_works",
        method: "GET",
        params: {
          page,
          limit,
          ...(search?.trim() && { search: search.trim() }),
          ...(date && { date }),
        },
      }),
      providesTags: ["DailyWork"],
    }),

    createDailyWork: builder.mutation<
      CreateDailyWorkResponse,
      CreateDailyWorkPayload
    >({
      query: (payload) => ({
        url: "/daily_works/add",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["DailyWork"],
    }),

    updateDailyWork: builder.mutation<
      CreateDailyWorkResponse,
      {
        id: number;
        payload: CreateDailyWorkPayload;
      }
    >({
      query: ({ id, payload }) => ({
        url: `/daily_works/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["DailyWork"],
    }),

    deleteDailyWork: builder.mutation<
      { success: boolean; message: string },
      number
    >({
      query: (id) => ({
        url: `/daily_works/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DailyWork"],
    }),
  }),
});

export const {
  useGetDailyWorkQuery,
  useCreateDailyWorkMutation,
  useUpdateDailyWorkMutation,
  useDeleteDailyWorkMutation,
} = dailyWorkApi;
