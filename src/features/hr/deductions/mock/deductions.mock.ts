import dayjs from "dayjs";
import type { FinancialTransaction } from "../types";

export function isCurrentMonthDate(dateStr: string): boolean {
  const parsed = dayjs(dateStr, "YYYY-MM-DD", true);
  if (!parsed.isValid()) return false;
  const now = dayjs();
  return parsed.year() === now.year() && parsed.month() === now.month();
}

export function isAllowedTransactionDate(dateStr: string): boolean {
  const parsed = dayjs(dateStr, "YYYY-MM-DD", true);
  if (!parsed.isValid()) return false;
  const startOfMonth = dayjs().startOf("month");
  const endOfToday = dayjs().endOf("day");
  return (
    !parsed.isBefore(startOfMonth, "day") && !parsed.isAfter(endOfToday, "day")
  );
}

function getSafeCurrentMonthDate(preferredDay: number): string {
  const today = dayjs();
  const safeDay = Math.min(preferredDay, today.date());
  return today.date(safeDay).format("YYYY-MM-DD");
}

function getPreviousMonthDate(dayOfMonth: number): string {
  const prevMonth = dayjs().subtract(1, "month");
  const safeDay = Math.min(dayOfMonth, prevMonth.daysInMonth());
  return prevMonth.date(safeDay).format("YYYY-MM-DD");
}

const sameDay = getSafeCurrentMonthDate(2);
const anotherDay = getSafeCurrentMonthDate(5);
const prevMonthDay = getPreviousMonthDate(20);

export const MOCK_TRANSACTIONS: FinancialTransaction[] = [
  // Employee 1 — two independent deductions + one bonus on the SAME date (never merged)
  {
    id: 1,
    employeeId: 1,
    projectId: 1,
    type: "DEDUCTION",
    amount: 250,
    reason: "تأخير عن موعد الحضور الصباحي",
    date: sameDay,
  },
  {
    id: 2,
    employeeId: 1,
    projectId: 1,
    type: "DEDUCTION",
    amount: 150,
    reason: "فقدان أداة عمل بالموقع",
    date: sameDay,
  },
  {
    id: 3,
    employeeId: 1,
    projectId: 2,
    type: "BONUS",
    amount: 500,
    reason: "إنجاز تسليم المرحلة قبل الموعد",
    date: sameDay,
  },
  // Employee 2 — two independent bonuses on the same date
  {
    id: 4,
    employeeId: 2,
    projectId: 1,
    type: "BONUS",
    amount: 300,
    reason: "عمل إضافي في عطلة نهاية الأسبوع",
    date: anotherDay,
  },
  {
    id: 5,
    employeeId: 2,
    projectId: 1,
    type: "BONUS",
    amount: 200,
    reason: "مكافأة الالتزام بمعايير السلامة",
    date: anotherDay,
  },
  // Employee 3 — deduction in Project 3
  {
    id: 6,
    employeeId: 3,
    projectId: 3,
    type: "DEDUCTION",
    amount: 400,
    reason: "مخالفة تعليمات الموقع",
    date: anotherDay,
  },
  // Previous month record (read-only: edit/delete disabled)
  {
    id: 7,
    employeeId: 5,
    projectId: 1,
    type: "BONUS",
    amount: 600,
    reason: "مكافأة أداء الشهر السابق",
    date: prevMonthDay,
  },
];
