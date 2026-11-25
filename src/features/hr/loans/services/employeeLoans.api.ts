import { baseApi } from "@/core/api/baseApi";
import type {
  ApiEmployeeLoan,
  DeleteEmployeeLoanResponse,
  EmployeeLoanApiResponse,
  EmployeeLoanMutationPayload,
  EmployeeLoansApiResponse,
  EmployeeLoansQueryParams,
  EmployeeLoansResult,
  Loan,
} from "../types";

const mapApiLoan = (raw: ApiEmployeeLoan): Loan => ({
  id: Number(raw.id),
  employeeId: Number(raw.employee_id),
  employeeName: raw.employee_name,
  projectId: Number(raw.project_id),
  projectName: raw.project_name,
  amount: Number(raw.amount) || 0,
  date: raw.loan_date,
  createdAt: raw.created_at,
});

export const employeeLoansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeLoans: builder.query<
      EmployeeLoansResult,
      EmployeeLoansQueryParams | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;

        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (params?.employee_id) {
          queryParams.set("employee_id", String(params.employee_id));
        }

        if (params?.date) {
          queryParams.set("date", params.date);
        }

        if (params?.project_id) {
          queryParams.set("project_id", String(params.project_id));
        }

        return `/employee-loans?${queryParams.toString()}`;
      },

      transformResponse: (
        response: EmployeeLoansApiResponse,
      ): EmployeeLoansResult => ({
        data: (response.data ?? []).map(mapApiLoan),
        pagination: response.pagination,
      }),

      providesTags: ["EmployeeLoans"],
    }),

    createEmployeeLoan: builder.mutation<Loan, EmployeeLoanMutationPayload>({
      query: (body) => ({
        url: "/employee-loans",
        method: "POST",
        body,
      }),

      transformResponse: (response: EmployeeLoanApiResponse): Loan =>
        mapApiLoan(response.data),

      invalidatesTags: ["EmployeeLoans"],
    }),

    updateEmployeeLoan: builder.mutation<
      Loan,
      { id: number; data: EmployeeLoanMutationPayload }
    >({
      query: ({ id, data }) => ({
        url: `/employee-loans/${id}`,
        method: "PUT",
        body: data,
      }),

      transformResponse: (response: EmployeeLoanApiResponse): Loan =>
        mapApiLoan(response.data),

      invalidatesTags: ["EmployeeLoans"],
    }),

    deleteEmployeeLoan: builder.mutation<DeleteEmployeeLoanResponse, number>({
      query: (id) => ({
        url: `/employee-loans/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["EmployeeLoans"],
    }),
  }),
});

export const {
  useGetEmployeeLoansQuery,
  useCreateEmployeeLoanMutation,
  useUpdateEmployeeLoanMutation,
  useDeleteEmployeeLoanMutation,
} = employeeLoansApi;
