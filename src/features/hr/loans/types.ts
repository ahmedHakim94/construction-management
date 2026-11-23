export interface Loan {
  id: number;
  employeeId: number;
  projectId: number;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface LoanFormValues {
  projectId: number;
  employeeId: number;
  amount: number;
  date: string; // YYYY-MM-DD
}

export type LoanDialogMode = "create" | "edit";
