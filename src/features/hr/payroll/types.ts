import type { EmployeeStatus } from "@/features/hr/employees/types";

export type PayrollStatus = "PENDING" | "PAID";

export interface PayrollTransactionItem {
  id: number;
  projectId: number;
  projectName: string;
  amount: number;
  reason: string;
  date: string;
}

export interface PayrollLoanItem {
  id: number;
  projectId: number;
  projectName: string;
  amount: number;
  date: string;
}

export interface PayrollRecord {
  id: string; // `${employeeId}_${month}`
  payrollId?: number | null;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  employeeJobTitle: string;
  employeeStatus: EmployeeStatus;
  month: string; // YYYY-MM
  isInactive: boolean;

  basicSalary: number;
  dailyRate: number;
  standardWorkingDays?: number;

  attendanceDays: number;
  payableWorkingDays: number;
  totalAbsenceDays: number;
  paidAbsenceDays: number;
  unpaidAbsenceDays: number;
  unpaidAbsenceDeduction: number;
  extraDays: number;
  extraDaysAmount: number;

  bonuses: PayrollTransactionItem[];
  deductions: PayrollTransactionItem[];
  loans: PayrollLoanItem[];

  totalBonuses: number;
  totalDeductions: number;
  totalLoans: number;
  netSalary: number;

  status: PayrollStatus;
  paidAt?: string | null;
  paidBy?: number | null;
}

export interface ApiPayrollTransactionItem {
  id: number;
  project_id: number;
  project_name: string;
  amount: number | string;
  reason: string;
  date: string;
}

export interface ApiPayrollLoanItem {
  id: number;
  project_id: number;
  project_name: string;
  amount: number | string;
  date: string;
}

export interface ApiPayrollRecord {
  id: string;
  payroll_id: number | null;
  employee_id: number;
  employee_name: string;
  employee_job_title: string;
  employee_status: EmployeeStatus;
  month: string;
  is_inactive: boolean;
  basic_salary: number | string;
  daily_rate: number | string;
  standard_working_days: number;
  attendance_days: number;
  payable_working_days: number;
  total_absence_days: number;
  paid_absence_days: number;
  unpaid_absence_days: number;
  unpaid_absence_deduction: number | string;
  extra_days: number;
  extra_days_amount: number | string;
  bonuses: ApiPayrollTransactionItem[];
  deductions: ApiPayrollTransactionItem[];
  loans: ApiPayrollLoanItem[];
  total_bonuses: number | string;
  total_deductions: number | string;
  total_loans: number | string;
  net_salary: number | string;
  status: PayrollStatus;
  paid_at: string | null;
  paid_by: number | null;
}

export interface MonthlyPayrollQueryParams {
  month?: string;
}

export interface MonthlyPayrollApiResponse {
  success: boolean;
  month: string;
  summary: {
    total_month_payroll: number | string;
  };
  data: ApiPayrollRecord[];
}

export interface MonthlyPayrollResult {
  month: string;
  summary: {
    totalMonthPayroll: number;
  };
  data: PayrollRecord[];
}

export interface PayrollDetailsQueryParams {
  employeeId: number;
  month?: string;
}

export interface PayrollDetailsApiResponse {
  success: boolean;
  data: ApiPayrollRecord;
}

export interface MarkPayrollPaidPayload {
  employeeId: number;
  month: string;
}

export interface MarkPayrollPaidApiResponse {
  success: boolean;
  message?: string;
  data: ApiPayrollRecord;
}
