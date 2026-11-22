export type AttendanceStatus = "PRESENT" | "ABSENT";

export interface AttendanceRecord {
  id: string;
  employeeId: number;
  projectId: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface EmployeeAttendanceSummary {
  id: number;
  code: string;
  name: string;
  jobTitle: string;
  projectIds: number[];
  presentDays: number;
  absentDays: number;
}

export type AttendanceDialogMode = "register" | "edit";

export interface AttendanceSavePayload {
  mode: AttendanceDialogMode;
  projectId: number;
  date: string;
  entries: Array<{
    employeeId: number;
    status: AttendanceStatus;
  }>;
  replaceRecord?: {
    employeeId: number;
    projectId: number;
    date: string;
  };
}
