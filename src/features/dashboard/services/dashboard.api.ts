import { baseApi } from "@/core/api/baseApi";
import type { DashboardSummaryResponse } from ".";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummaryResponse, void>({
      query: () => "/dashboard/summary",
    }),
  }),
});
export const { useGetDashboardSummaryQuery } = dashboardApi;
