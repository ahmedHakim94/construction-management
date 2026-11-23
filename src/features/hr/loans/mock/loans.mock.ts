import dayjs from "dayjs";
import type { Loan } from "../types";

function getSafeCurrentMonthDate(preferredDay: number): string {
  const today = dayjs();
  const safeDay = Math.min(preferredDay, today.date());
  return today.date(safeDay).format("YYYY-MM-DD");
}

export const MOCK_LOANS: Loan[] = [
  {
    id: 1,
    employeeId: 1,
    projectId: 1,
    amount: 2000,
    date: getSafeCurrentMonthDate(2),
  },
  {
    id: 2,
    employeeId: 2,
    projectId: 1,
    amount: 1500,
    date: getSafeCurrentMonthDate(4),
  },
  {
    id: 3,
    employeeId: 3,
    projectId: 2,
    amount: 3000,
    date: getSafeCurrentMonthDate(5),
  },
  {
    id: 4,
    employeeId: 5,
    projectId: 3,
    amount: 1000,
    date: getSafeCurrentMonthDate(6),
  },
];
