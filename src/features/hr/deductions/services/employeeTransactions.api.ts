import { baseApi } from "@/core/api/baseApi";
import type {
  ApiEmployeeTransaction,
  DeleteEmployeeTransactionResponse,
  EmployeeTransactionApiResponse,
  EmployeeTransactionMutationPayload,
  EmployeeTransactionsApiResponse,
  EmployeeTransactionsQueryParams,
  EmployeeTransactionsResult,
  FinancialTransaction,
} from "../types";

const mapApiTransaction = (
  raw: ApiEmployeeTransaction,
): FinancialTransaction => ({
  id: Number(raw.id),
  employeeId: Number(raw.employee_id),
  employeeName: raw.employee_name,
  projectId: Number(raw.project_id),
  projectName: raw.project_name,
  type: raw.type,
  amount: Number(raw.amount) || 0,
  reason: raw.reason ?? "",
  date: raw.transaction_date,
  createdAt: raw.created_at,
});

export const employeeTransactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeTransactions: builder.query<
      EmployeeTransactionsResult,
      EmployeeTransactionsQueryParams | void
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

        if (params?.type) {
          queryParams.set("type", params.type);
        }

        if (params?.project_id) {
          queryParams.set("project_id", String(params.project_id));
        }

        return `/employee-transactions?${queryParams.toString()}`;
      },

      transformResponse: (
        response: EmployeeTransactionsApiResponse,
      ): EmployeeTransactionsResult => ({
        data: (response.data ?? []).map(mapApiTransaction),
        pagination: response.pagination,
      }),

      providesTags: ["EmployeeTransactions"],
    }),

    createEmployeeTransaction: builder.mutation<
      FinancialTransaction,
      EmployeeTransactionMutationPayload
    >({
      query: (body) => ({
        url: "/employee-transactions",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: EmployeeTransactionApiResponse,
      ): FinancialTransaction => mapApiTransaction(response.data),

      invalidatesTags: ["EmployeeTransactions"],
    }),

    updateEmployeeTransaction: builder.mutation<
      FinancialTransaction,
      { id: number; data: EmployeeTransactionMutationPayload }
    >({
      query: ({ id, data }) => ({
        url: `/employee-transactions/${id}`,
        method: "PUT",
        body: data,
      }),

      transformResponse: (
        response: EmployeeTransactionApiResponse,
      ): FinancialTransaction => mapApiTransaction(response.data),

      invalidatesTags: ["EmployeeTransactions"],
    }),

    deleteEmployeeTransaction: builder.mutation<
      DeleteEmployeeTransactionResponse,
      number
    >({
      query: (id) => ({
        url: `/employee-transactions/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["EmployeeTransactions"],
    }),
  }),
});

export const {
  useGetEmployeeTransactionsQuery,
  useCreateEmployeeTransactionMutation,
  useUpdateEmployeeTransactionMutation,
  useDeleteEmployeeTransactionMutation,
} = employeeTransactionsApi;
