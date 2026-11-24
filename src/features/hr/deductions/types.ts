import type { PaginationMeta } from "@/types";

export type TransactionType = "DEDUCTION" | "BONUS";

export interface FinancialTransaction {
  id: number;
  employeeId: number;
  employeeName?: string;
  projectId: number;
  projectName?: string;
  type: TransactionType;
  amount: number;
  reason: string;
  date: string; // YYYY-MM-DD
  createdAt?: string;
}

export interface TransactionFormValues {
  projectId: number;
  employeeId: number;
  type: TransactionType;
  amount: number;
  reason: string;
  date: string; // YYYY-MM-DD
}

export type TransactionDialogMode = "create" | "edit";

export interface ApiEmployeeTransaction {
  id: number;
  employee_id: number;
  employee_name: string;
  project_id: number;
  project_name: string;
  type: TransactionType;
  amount: number | string;
  reason: string | null;
  transaction_date: string;
  created_at?: string;
}

export interface EmployeeTransactionsQueryParams {
  page?: number;
  limit?: number;
  employee_id?: number;
  date?: string; // YYYY-MM-DD
  type?: TransactionType;
  project_id?: number;
}

export interface EmployeeTransactionsApiResponse {
  success: boolean;
  data: ApiEmployeeTransaction[];
  pagination: PaginationMeta;
}

export interface EmployeeTransactionsResult {
  data: FinancialTransaction[];
  pagination: PaginationMeta;
}

export interface EmployeeTransactionMutationPayload {
  employee_id: number;
  project_id?: number;
  type: TransactionType;
  amount: number;
  reason: string | null;
  transaction_date: string; // YYYY-MM-DD
}

export interface EmployeeTransactionApiResponse {
  success: boolean;
  message?: string;
  data: ApiEmployeeTransaction;
}

export interface DeleteEmployeeTransactionResponse {
  success: boolean;
  message?: string;
}
