import type { PaginationMeta } from "@/types";

export interface ApiLeaveSummaryItem {
  id: number;
  name: string;
  job_title: string | null;
  total_leave_days: number;
  paid_leave_days: number;
  unpaid_leave_days: number;
}

export interface EmployeeLeaveSummary {
  id: number;
  employeeName: string;
  jobTitle: string;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  totalLeaveDays: number;
}

export interface LeavesQueryParams {
  page?: number;
  limit?: number;
  month?: string; // YYYY-MM
  employee_id?: number;
  search?: string;
  project_id?: number;
}

export interface LeavesApiResponse {
  success: boolean;
  month: string;
  data: ApiLeaveSummaryItem[];
  pagination: PaginationMeta;
}

export interface LeavesResult {
  month: string;
  data: EmployeeLeaveSummary[];
  pagination: PaginationMeta;
}
