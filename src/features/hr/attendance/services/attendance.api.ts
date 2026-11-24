import { baseApi } from "@/core/api/baseApi";
import type {
  ApiAttendanceSummaryItem,
  ApiEmployeeAttendanceDetails,
  ApiEmployeeAttendanceDetailsResponse,
  AttendanceApiResponse,
  AttendanceQueryParams,
  AttendanceResult,
  BulkAttendanceApiResponse,
  BulkAttendancePayload,
  EmployeeAttendanceDetails,
  EmployeeAttendanceDetailsQueryParams,
  EmployeeAttendanceSummary,
} from "../types";

const mapSummaryItem = (
  raw: ApiAttendanceSummaryItem,
): EmployeeAttendanceSummary => {
  const projects = Array.isArray(raw.projects)
    ? raw.projects.map((project) => ({
        id: Number(project.id),
        name: project.name,
      }))
    : [];

  const projectIds = Array.isArray(raw.project_ids)
    ? raw.project_ids.map(Number)
    : projects.map((project) => project.id);

  return {
    id: Number(raw.id),
    code: String(raw.id),
    name: raw.name,
    jobTitle: raw.job_title ?? "",
    status: raw.status,
    projectIds,
    projects,
    presentDays: Number(raw.present_days) || 0,
    absentDays: Number(raw.absent_days) || 0,
    paidAbsenceDays: Number(raw.paid_absence_days) || 0,
    unpaidAbsenceDays: Number(raw.unpaid_absence_days) || 0,
  };
};

const mapAttendanceDetails = (
  raw: ApiEmployeeAttendanceDetails,
): EmployeeAttendanceDetails => ({
  employee: {
    id: Number(raw.employee.id),
    name: raw.employee.name,
    jobTitle: raw.employee.job_title ?? "",
    status: raw.employee.status,
  },
  month: raw.month,
  paidAbsenceAllowance: Number(raw.paid_absence_allowance) || 4,
  presentDays: Number(raw.present_days) || 0,
  absentDays: Number(raw.absent_days) || 0,
  paidAbsenceDays: Number(raw.paid_absence_days) || 0,
  unpaidAbsenceDays: Number(raw.unpaid_absence_days) || 0,
  absenceDates: Array.isArray(raw.absence_dates) ? raw.absence_dates : [],
  absenceDetails: Array.isArray(raw.absence_details)
    ? raw.absence_details.map((item) => ({
        attendanceDate: item.attendance_date,
        projects: Array.isArray(item.projects)
          ? item.projects.map((project) => ({
              id: Number(project.id),
              name: project.name,
            }))
          : [],
      }))
    : [],
  records: Array.isArray(raw.records)
    ? raw.records.map((rec) => ({
        id: Number(rec.id),
        projectId: Number(rec.project_id),
        projectName: rec.project_name,
        attendanceDate: rec.attendance_date,
        status: rec.status,
      }))
    : [],
});

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendance: builder.query<AttendanceResult, AttendanceQueryParams | void>(
      {
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

          if (search) {
            queryParams.set("search", search);
          }

          if (params?.project_id) {
            queryParams.set("project_id", String(params.project_id));
          }

          return `/attendance?${queryParams.toString()}`;
        },

        transformResponse: (
          response: AttendanceApiResponse,
        ): AttendanceResult => ({
          month: response.month,
          data: (response.data ?? []).map(mapSummaryItem),
          pagination: response.pagination,
        }),

        providesTags: ["Attendance"],
      },
    ),

    getEmployeeAttendanceDetails: builder.query<
      EmployeeAttendanceDetails,
      EmployeeAttendanceDetailsQueryParams
    >({
      query: ({ employeeId, month, project_id }) => {
        const queryParams = new URLSearchParams();
        if (month) {
          queryParams.set("month", month);
        }
        if (project_id) {
          queryParams.set("project_id", String(project_id));
        }
        const qs = queryParams.toString();
        return `/attendance/employee/${employeeId}/details${qs ? `?${qs}` : ""}`;
      },

      transformResponse: (
        response: ApiEmployeeAttendanceDetailsResponse,
      ): EmployeeAttendanceDetails => mapAttendanceDetails(response.data),

      providesTags: (_result, _error, arg) => [
        { type: "Attendance", id: arg.employeeId },
        "Attendance",
      ],
    }),

    createBulkAttendance: builder.mutation<
      BulkAttendanceApiResponse,
      BulkAttendancePayload
    >({
      query: (body) => ({
        url: "/attendance/bulk",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Attendance"],
    }),

    updateBulkAttendance: builder.mutation<
      BulkAttendanceApiResponse,
      BulkAttendancePayload
    >({
      query: (body) => ({
        url: "/attendance/bulk",
        method: "PUT",
        body,
      }),

      invalidatesTags: ["Attendance"],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useGetEmployeeAttendanceDetailsQuery,
  useCreateBulkAttendanceMutation,
  useUpdateBulkAttendanceMutation,
} = attendanceApi;
