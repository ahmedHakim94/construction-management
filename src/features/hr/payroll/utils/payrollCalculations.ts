import type { Employee, EmployeeProject } from "@/features/hr/employees/types";
import type { AttendanceRecord } from "@/features/hr/attendance/types";
import { MONTHLY_PAID_ABSENCE_ALLOWANCE } from "@/features/hr/attendance/mock/attendance.mock";
import type { FinancialTransaction } from "@/features/hr/deductions/types";
import type { Loan } from "@/features/hr/loans/types";
import type {
  PayrollLoanItem,
  PayrollRecord,
  PayrollTransactionItem,
} from "../types";

export const STANDARD_WORKING_DAYS = 26;

export function buildPayrollKey(employeeId: number, month: string): string {
  return `${employeeId}_${month}`;
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

interface CalculatePayrollParams {
  employee: Employee;
  month: string; // YYYY-MM
  attendanceRecords: AttendanceRecord[];
  transactions: FinancialTransaction[];
  loans: Loan[];
  projectNameById: Map<number, string>;
}

export function calculateEmployeeMonthlyPayroll({
  employee,
  month,
  attendanceRecords,
  transactions,
  loans,
  projectNameById,
}: CalculatePayrollParams): PayrollRecord {
  const id = buildPayrollKey(employee.id, month);
  const isInactive = employee.status === "INACTIVE";

  // Inactive employees are listed for visibility but their salary is not calculated or payable.
  if (isInactive) {
    return {
      id,
      employeeId: employee.id,
      employeeCode: employee.code,
      employeeName: employee.name,
      employeeJobTitle: employee.jobTitle,
      employeeStatus: employee.status,
      month,
      isInactive: true,
      basicSalary: employee.basicSalary,
      dailyRate: 0,
      attendanceDays: 0,
      payableWorkingDays: 0,
      totalAbsenceDays: 0,
      paidAbsenceDays: 0,
      unpaidAbsenceDays: 0,
      unpaidAbsenceDeduction: 0,
      extraDays: 0,
      extraDaysAmount: 0,
      bonuses: [],
      deductions: [],
      loans: [],
      totalBonuses: 0,
      totalDeductions: 0,
      totalLoans: 0,
      netSalary: 0,
      status: "PENDING",
    };
  }

  const rawDailyRate = employee.basicSalary / STANDARD_WORKING_DAYS;
  const dailyRate = roundMoney(rawDailyRate);

  // Deduplicate attendance & absence dates across all projects for the selected month.
  const presentDates = new Set<string>();
  const rawAbsentDates = new Set<string>();

  attendanceRecords.forEach((record) => {
    if (record.employeeId !== employee.id) return;
    if (!record.date.startsWith(month)) return;
    if (record.status === "PRESENT") {
      presentDates.add(record.date);
    } else if (record.status === "ABSENT") {
      rawAbsentDates.add(record.date);
    }
  });

  // If an employee was present on a date in any project, do not also count that date as absent.
  const absentDates = new Set<string>();
  rawAbsentDates.forEach((date) => {
    if (!presentDates.has(date)) {
      absentDates.add(date);
    }
  });

  const attendanceDays = presentDates.size;
  const totalAbsenceDays = absentDates.size;
  const paidAbsenceDays = Math.min(
    totalAbsenceDays,
    MONTHLY_PAID_ABSENCE_ALLOWANCE,
  );
  const unpaidAbsenceDays = Math.max(
    totalAbsenceDays - MONTHLY_PAID_ABSENCE_ALLOWANCE,
    0,
  );

  // Paid absence days count toward the 26-day salary entitlement.
  // Unregistered days are never treated as absence or deducted.
  const payableWorkingDays = attendanceDays + paidAbsenceDays;
  const extraDays = Math.max(payableWorkingDays - STANDARD_WORKING_DAYS, 0);
  const extraDaysAmount = roundMoney(extraDays * rawDailyRate);
  const unpaidAbsenceDeduction = roundMoney(unpaidAbsenceDays * rawDailyRate);

  const bonuses: PayrollTransactionItem[] = [];
  const deductions: PayrollTransactionItem[] = [];

  transactions.forEach((tx) => {
    if (tx.employeeId !== employee.id) return;
    if (!tx.date.startsWith(month)) return;

    const item: PayrollTransactionItem = {
      id: tx.id,
      projectId: tx.projectId,
      projectName: projectNameById.get(tx.projectId) ?? `#${tx.projectId}`,
      amount: roundMoney(tx.amount),
      reason: tx.reason,
      date: tx.date,
    };

    if (tx.type === "BONUS") {
      bonuses.push(item);
    } else {
      deductions.push(item);
    }
  });

  const employeeLoans: PayrollLoanItem[] = loans
    .filter(
      (loan) => loan.employeeId === employee.id && loan.date.startsWith(month),
    )
    .map((loan) => ({
      id: loan.id,
      projectId: loan.projectId,
      projectName: projectNameById.get(loan.projectId) ?? `#${loan.projectId}`,
      amount: roundMoney(loan.amount),
      date: loan.date,
    }));

  const totalBonuses = roundMoney(
    bonuses.reduce((sum, item) => sum + item.amount, 0),
  );
  const totalDeductions = roundMoney(
    deductions.reduce((sum, item) => sum + item.amount, 0),
  );
  const totalLoans = roundMoney(
    employeeLoans.reduce((sum, item) => sum + item.amount, 0),
  );

  const netSalary = roundMoney(
    employee.basicSalary +
      extraDaysAmount -
      unpaidAbsenceDeduction +
      totalBonuses -
      totalDeductions -
      totalLoans,
  );

  return {
    id,
    employeeId: employee.id,
    employeeCode: employee.code,
    employeeName: employee.name,
    employeeJobTitle: employee.jobTitle,
    employeeStatus: employee.status,
    month,
    isInactive: false,
    basicSalary: roundMoney(employee.basicSalary),
    dailyRate,
    attendanceDays,
    payableWorkingDays,
    totalAbsenceDays,
    paidAbsenceDays,
    unpaidAbsenceDays,
    unpaidAbsenceDeduction,
    extraDays,
    extraDaysAmount,
    bonuses,
    deductions,
    loans: employeeLoans,
    totalBonuses,
    totalDeductions,
    totalLoans,
    netSalary,
    status: "PENDING",
  };
}

export function buildProjectNameMap(
  projects: EmployeeProject[],
): Map<number, string> {
  return new Map(projects.map((project) => [project.id, project.name]));
}
