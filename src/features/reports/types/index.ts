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
