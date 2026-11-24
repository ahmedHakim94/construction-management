import { baseApi } from "@/core/api/baseApi";
import type {
  ApiLeaveSummaryItem,
  EmployeeLeaveSummary,
  LeavesApiResponse,
  LeavesQueryParams,
  LeavesResult,
} from "../types";

const mapLeaveItem = (raw: ApiLeaveSummaryItem): EmployeeLeaveSummary => ({
  id: Number(raw.id),
  employeeName: raw.name,
  jobTitle: raw.job_title ?? "",
  totalLeaveDays: Number(raw.total_leave_days) || 0,
  paidLeaveDays: Number(raw.paid_leave_days) || 0,
  unpaidLeaveDays: Number(raw.unpaid_leave_days) || 0,
});

export const leavesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaves: builder.query<LeavesResult, LeavesQueryParams | void>({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        const search = params?.search?.trim() ?? "";

        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (params?.month) {
          queryParams.set("month", params.month);
        }

        if (params?.employee_id) {
          queryParams.set("employee_id", String(params.employee_id));
        }

        if (search) {
          queryParams.set("search", search);
        }

        if (params?.project_id) {
          queryParams.set("project_id", String(params.project_id));
        }

        return `/leaves?${queryParams.toString()}`;
      },

      transformResponse: (response: LeavesApiResponse): LeavesResult => ({
        month: response.month,
        data: (response.data ?? []).map(mapLeaveItem),
        pagination: response.pagination,
      }),

      providesTags: ["Leaves", "Attendance"],
    }),
  }),
});

export const { useGetLeavesQuery } = leavesApi;
