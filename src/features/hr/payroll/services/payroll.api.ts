import { baseApi } from "@/core/api/baseApi";
import type {
  ApiPayrollLoanItem,
  ApiPayrollRecord,
  ApiPayrollTransactionItem,
  MarkPayrollPaidApiResponse,
  MarkPayrollPaidPayload,
  MonthlyPayrollApiResponse,
  MonthlyPayrollQueryParams,
  MonthlyPayrollResult,
  PayrollDetailsApiResponse,
  PayrollDetailsQueryParams,
  PayrollLoanItem,
  PayrollRecord,
  PayrollTransactionItem,
} from "../types";

const mapTransactionItem = (
  raw: ApiPayrollTransactionItem,
): PayrollTransactionItem => ({
  id: Number(raw.id),
  projectId: Number(raw.project_id),
  projectName: raw.project_name,
  amount: Number(raw.amount) || 0,
  reason: raw.reason ?? "",
  date: raw.date,
});

const mapLoanItem = (raw: ApiPayrollLoanItem): PayrollLoanItem => ({
  id: Number(raw.id),
  projectId: Number(raw.project_id),
  projectName: raw.project_name,
  amount: Number(raw.amount) || 0,
  date: raw.date,
});

const mapApiPayrollRecord = (raw: ApiPayrollRecord): PayrollRecord => {
  const employeeId = Number(raw.employee_id);

  return {
    id: raw.id,
    payrollId: raw.payroll_id != null ? Number(raw.payroll_id) : null,
    employeeId,
    employeeCode: `#${employeeId}`,
    employeeName: raw.employee_name,
    employeeJobTitle: raw.employee_job_title ?? "",
    employeeStatus: raw.employee_status,
    month: raw.month,
    isInactive: Boolean(raw.is_inactive),
    basicSalary: Number(raw.basic_salary) || 0,
    dailyRate: Number(raw.daily_rate) || 0,
    standardWorkingDays: Number(raw.standard_working_days) || 26,
    attendanceDays: Number(raw.attendance_days) || 0,
    payableWorkingDays: Number(raw.payable_working_days) || 0,
    totalAbsenceDays: Number(raw.total_absence_days) || 0,
    paidAbsenceDays: Number(raw.paid_absence_days) || 0,
    unpaidAbsenceDays: Number(raw.unpaid_absence_days) || 0,
    unpaidAbsenceDeduction: Number(raw.unpaid_absence_deduction) || 0,
    extraDays: Number(raw.extra_days) || 0,
    extraDaysAmount: Number(raw.extra_days_amount) || 0,
    bonuses: Array.isArray(raw.bonuses)
      ? raw.bonuses.map(mapTransactionItem)
      : [],
    deductions: Array.isArray(raw.deductions)
      ? raw.deductions.map(mapTransactionItem)
      : [],
    loans: Array.isArray(raw.loans) ? raw.loans.map(mapLoanItem) : [],
    totalBonuses: Number(raw.total_bonuses) || 0,
    totalDeductions: Number(raw.total_deductions) || 0,
    totalLoans: Number(raw.total_loans) || 0,
    netSalary: Number(raw.net_salary) || 0,
    status: raw.status,
    paidAt: raw.paid_at ?? null,
    paidBy: raw.paid_by != null ? Number(raw.paid_by) : null,
  };
};

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMonthlyPayroll: builder.query<
      MonthlyPayrollResult,
      MonthlyPayrollQueryParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params?.month) {
          queryParams.set("month", params.month);
        }

        const qs = queryParams.toString();
        return `/payroll${qs ? `?${qs}` : ""}`;
      },

      transformResponse: (
        response: MonthlyPayrollApiResponse,
      ): MonthlyPayrollResult => ({
        month: response.month,
        summary: {
          totalMonthPayroll: Number(response.summary?.total_month_payroll) || 0,
        },
        data: (response.data ?? []).map(mapApiPayrollRecord),
      }),

      providesTags: [
        "Payroll",
        "Employees",
        "Attendance",
        "EmployeeTransactions",
        "EmployeeLoans",
      ],
    }),

    getEmployeePayrollDetails: builder.query<
      PayrollRecord,
      PayrollDetailsQueryParams
    >({
      query: ({ employeeId, month }) => {
        const queryParams = new URLSearchParams();

        if (month) {
          queryParams.set("month", month);
        }

        const qs = queryParams.toString();
        return `/payroll/${employeeId}/details${qs ? `?${qs}` : ""}`;
      },

      transformResponse: (
        response: PayrollDetailsApiResponse,
      ): PayrollRecord => mapApiPayrollRecord(response.data),

      providesTags: (_result, _error, arg) => [
        { type: "Payroll", id: `${arg.employeeId}_${arg.month ?? ""}` },
        "Payroll",
        "Employees",
        "Attendance",
        "EmployeeTransactions",
        "EmployeeLoans",
      ],
    }),

    markPayrollAsPaid: builder.mutation<PayrollRecord, MarkPayrollPaidPayload>({
      query: ({ employeeId, month }) => ({
        url: `/payroll/${employeeId}/pay`,
        method: "POST",
        body: { month },
      }),

      transformResponse: (
        response: MarkPayrollPaidApiResponse,
      ): PayrollRecord => mapApiPayrollRecord(response.data),

      invalidatesTags: (_result, _error, arg) => [
        { type: "Payroll", id: `${arg.employeeId}_${arg.month}` },
        "Payroll",
      ],
    }),
  }),
});

export const {
  useGetMonthlyPayrollQuery,
  useGetEmployeePayrollDetailsQuery,
  useMarkPayrollAsPaidMutation,
} = payrollApi;
