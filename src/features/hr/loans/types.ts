import type { PaginationMeta } from "@/types";

export interface Loan {
  id: number;
  employeeId: number;
  employeeName?: string;
  projectId: number;
  projectName?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt?: string;
}

export interface LoanFormValues {
  projectId: number;
  employeeId: number;
  amount: number;
  date: string; // YYYY-MM-DD
}

export type LoanDialogMode = "create" | "edit";

export interface ApiEmployeeLoan {
  id: number;
  employee_id: number;
  employee_name: string;
  project_id: number;
  project_name: string;
  amount: number | string;
  loan_date: string;
  created_at?: string;
}

export interface EmployeeLoansQueryParams {
  page?: number;
  limit?: number;
  employee_id?: number;
  date?: string; // YYYY-MM-DD
  project_id?: number;
}

export interface EmployeeLoansApiResponse {
  success: boolean;
  data: ApiEmployeeLoan[];
  pagination: PaginationMeta;
}

export interface EmployeeLoansResult {
  data: Loan[];
  pagination: PaginationMeta;
}

export interface EmployeeLoanMutationPayload {
  employee_id: number;
  project_id?: number;
  amount: number;
  loan_date: string; // YYYY-MM-DD
}

export interface EmployeeLoanApiResponse {
  success: boolean;
  message?: string;
  data: ApiEmployeeLoan;
}

export interface DeleteEmployeeLoanResponse {
  success: boolean;
  message?: string;
}
