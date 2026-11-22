import dayjs from "dayjs";
import type { AttendanceRecord, AttendanceStatus } from "../types";

export const MONTHLY_PAID_ABSENCE_ALLOWANCE = 4;

export function buildAttendanceRecordId(
  employeeId: number,
  projectId: number,
  date: string,
): string {
  return `${employeeId}_${projectId}_${date}`;
}

function createRecord(
  employeeId: number,
  projectId: number,
  dayOfMonth: number,
  status: AttendanceStatus,
): AttendanceRecord {
  const monthPrefix = dayjs().format("YYYY-MM");
  const date = `${monthPrefix}-${String(dayOfMonth).padStart(2, "0")}`;
  return {
    id: buildAttendanceRecordId(employeeId, projectId, date),
    employeeId,
    projectId,
    date,
    status,
  };
}

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Employee 1 (Projects 1 & 2) — attends both Project 1 and Project 2 on day 2 (counts as 1 overall day for SuperAdmin)
  createRecord(1, 1, 1, "PRESENT"),
  createRecord(1, 1, 2, "PRESENT"),
  createRecord(1, 2, 2, "PRESENT"),
  createRecord(1, 2, 3, "PRESENT"),
  createRecord(1, 1, 4, "ABSENT"),

  // Employee 2 (Project 1)
  createRecord(2, 1, 1, "PRESENT"),
  createRecord(2, 1, 2, "PRESENT"),
  createRecord(2, 1, 3, "ABSENT"),
  createRecord(2, 1, 4, "ABSENT"),

  // Employee 3 (Projects 2 & 3) — attends both Project 2 and Project 3 on day 1
  createRecord(3, 2, 1, "PRESENT"),
  createRecord(3, 3, 1, "PRESENT"),
  createRecord(3, 2, 2, "PRESENT"),
  createRecord(3, 3, 3, "ABSENT"),

  // Employee 4 (Project 3)
  createRecord(4, 3, 1, "PRESENT"),
  createRecord(4, 3, 2, "ABSENT"),

  // Employee 5 (Projects 1, 3, 4)
  createRecord(5, 1, 1, "PRESENT"),
  createRecord(5, 3, 2, "PRESENT"),
  createRecord(5, 4, 3, "PRESENT"),
  createRecord(5, 1, 4, "PRESENT"),
];
