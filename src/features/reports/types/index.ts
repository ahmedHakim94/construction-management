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
