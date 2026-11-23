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
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  employeeJobTitle: string;
  employeeStatus: EmployeeStatus;
  month: string; // YYYY-MM
  isInactive: boolean;

  basicSalary: number;
  dailyRate: number;

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
  paidAt?: string;
}
