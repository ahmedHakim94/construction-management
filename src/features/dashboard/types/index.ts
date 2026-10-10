import type { PaymentStatus } from "@/features/payments/types";

export interface DashboardStats {
  projects: number;
  contractors: number;
  equipment: number;
}

export interface DashboardFinancials {
  totalCost: number;
  totalPaid: number;
  remainingAmount: number;
}

export interface DashboardPayment {
  id: string;
  projectName: string;
  contractorName: string;
  startDate: string;
  endDate: string;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PaymentStatus;
}

export interface DashboardDailyWork {
  id: number;
  date: string;
  projectId?: number;
  contractorId?: number;
  projectName: string;
  contractorName: string;
  isExternal?: boolean | number;
  equipmentName: string;
  taskName: string;
  workingHours: number;
  cost: number;
}

export interface DashboardProjectWork {
  projectId: number;
  projectName: string;
  workingHours: number;
  totalCost: number;
  totalDeductions: number;
  netAmount: number;
}
