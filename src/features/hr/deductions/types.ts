export type TransactionType = "DEDUCTION" | "BONUS";

export interface FinancialTransaction {
  id: number;
  employeeId: number;
  projectId: number;
  type: TransactionType;
  amount: number;
  reason: string;
  date: string; // YYYY-MM-DD
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
