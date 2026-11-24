import type { PaginationMeta } from "@/types";

export type AttendanceStatus = "PRESENT" | "ABSENT";

export interface AttendanceProject {
  id: number;
  name: string;
}

/**
 * Legacy mock record shape still referenced by mock-backed Leaves & Payroll pages.
 */
export interface AttendanceRecord {
  id: string;
  employeeId: number;
  projectId: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface ApiAttendanceSummaryItem {
  id: number;
  name: string;
  job_title: string | null;
  status: "ACTIVE" | "INACTIVE";
  project_ids: number[];
  projects: AttendanceProject[];
  present_days: number;
  absent_days: number;
  paid_absence_days: number;
  unpaid_absence_days: number;
}

export interface EmployeeAttendanceSummary {
  id: number;
  code: string;
  name: string;
  jobTitle: string;
  status: "ACTIVE" | "INACTIVE";
  projectIds: number[];
  projects: AttendanceProject[];
  presentDays: number;
  absentDays: number;
  paidAbsenceDays: number;
  unpaidAbsenceDays: number;
}

export interface AttendanceQueryParams {
  page?: number;
  limit?: number;
  month?: string; // YYYY-MM
  search?: string;
  project_id?: number;
}

export interface AttendanceApiResponse {
  success: boolean;
  month: string;
  data: ApiAttendanceSummaryItem[];
  pagination: PaginationMeta;
}

export interface AttendanceResult {
  month: string;
  data: EmployeeAttendanceSummary[];
  pagination: PaginationMeta;
}

export interface EmployeeAttendanceDetailsQueryParams {
  employeeId: number;
  month?: string; // YYYY-MM
  project_id?: number;
}

export interface ApiAbsenceDateDetail {
  attendance_date: string;
  projects: AttendanceProject[];
}

export interface ApiEmployeeAttendanceRecord {
  id: number;
  project_id: number;
  project_name: string;
  attendance_date: string;
  status: AttendanceStatus;
}

export interface ApiEmployeeAttendanceDetails {
  employee: {
    id: number;
    name: string;
    job_title: string | null;
    status: "ACTIVE" | "INACTIVE";
  };
  month: string;
  paid_absence_allowance: number;
  present_days: number;
  absent_days: number;
  paid_absence_days: number;
  unpaid_absence_days: number;
  absence_dates: string[];
  absence_details: ApiAbsenceDateDetail[];
  records?: ApiEmployeeAttendanceRecord[];
}

export interface ApiEmployeeAttendanceDetailsResponse {
  success: boolean;
  data: ApiEmployeeAttendanceDetails;
}

export interface AbsenceDateDetail {
  attendanceDate: string;
  projects: AttendanceProject[];
}

export interface EmployeeAttendanceRecord {
  id: number;
  projectId: number;
  projectName: string;
  attendanceDate: string;
  status: AttendanceStatus;
}

export interface EmployeeAttendanceDetails {
  employee: {
    id: number;
    name: string;
    jobTitle: string;
    status: "ACTIVE" | "INACTIVE";
  };
  month: string;
  paidAbsenceAllowance: number;
  presentDays: number;
  absentDays: number;
  paidAbsenceDays: number;
  unpaidAbsenceDays: number;
  absenceDates: string[];
  absenceDetails: AbsenceDateDetail[];
  records: EmployeeAttendanceRecord[];
}

export interface BulkAttendanceRecordInput {
  employee_id: number;
  status: AttendanceStatus;
}

export interface BulkAttendancePayload {
  attendance_date: string; // YYYY-MM-DD
  project_id?: number;
  records: BulkAttendanceRecordInput[];
}

export interface BulkAttendanceApiResponse {
  success: boolean;
  message?: string;
  data: {
    attendance_date: string;
    project_id: number;
    records: Array<{
      id: number;
      employee_id: number;
      project_id: number;
      attendance_date: string;
      status: AttendanceStatus;
    }>;
  };
}

export type AttendanceDialogMode = "register" | "edit";

export interface AttendanceSavePayload {
  mode: AttendanceDialogMode;
  projectId: number;
  attendanceDate: string; // YYYY-MM-DD
  records: BulkAttendanceRecordInput[];
}
