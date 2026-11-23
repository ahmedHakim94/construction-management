import type { PayrollRecord } from "../types";

const PAID_PAYROLLS_STORAGE_KEY = "hr_payroll_paid_records_v1";

/**
 * Isolated localStorage persistence for locked PAID payroll snapshots.
 * Designed to be cleanly swapped out for backend API persistence later.
 */
export function loadPaidPayrolls(): Record<string, PayrollRecord> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(PAID_PAYROLLS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as Record<string, PayrollRecord>;
  } catch {
    return {};
  }
}

export function savePaidPayrolls(
  records: Record<string, PayrollRecord>,
): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      PAID_PAYROLLS_STORAGE_KEY,
      JSON.stringify(records),
    );
  } catch {
    // Ignore storage quota or private-mode errors gracefully
  }
}
