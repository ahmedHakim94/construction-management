import type { Dayjs } from "dayjs";

export interface ProjectReportSummary {
  id: string; // matches projectId, required for AppCustomTable rendering
  projectId: string;
  projectName: string;
  totalWorkRecords: number;
  totalWorkingHours: number;
  totalWorkCost: number;
  totalDeductions: number;
  netWorkAmount: number;
  totalPaidAmount: number;
  remainingBalance: number;
}

export interface ReportFilters {
  projectId: string;
  dateFrom: Dayjs | null;
  dateTo: Dayjs | null;
}

export interface ReportSummary {
  totalWorkCost: number;
  totalDeductions: number;
  netWorkAmount: number;
  totalPaidAmount: number;
  remainingBalance: number;
}

export interface DailyWorkReport {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  contractorId: string;
  contractorName: string;
  equipmentName: string;
  taskName: string;
  workingHours: number;
  hourRate: number;
  fuelConsumption: number;
  cost: number;
  deduction: number;
  deductionReason?: string;
  netAmount: number;
}
