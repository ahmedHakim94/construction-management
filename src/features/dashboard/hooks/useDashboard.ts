import { useGetDashboardSummaryQuery } from "../services/dashboard.api";
import type { DashboardDailyWork } from "../types";

export function useDashboard() {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetDashboardSummaryQuery();
  const summary = data?.data;
  const dailyWork: DashboardDailyWork[] = (summary?.recentDailyWork ?? []).map(
    (record) => ({
      ...record,
      equipmentName:
        record.equipmentTypeName || record.temporaryEquipmentName || "",
    }),
  );
  return {
    stats: summary?.stats ?? {
      projects: 0,
      contractors: 0,
      equipment: 0,
      workingHours: 0,
    },
    financials: summary?.financials ?? {
      totalCost: 0,
      totalDeductions: 0,
      totalDues: 0,
      totalPaid: 0,
      remainingAmount: 0,
    },
    workByProject: summary?.workByProject ?? [],
    dailyWork,
    isLoading,
    isFinancialLoading: isLoading,
    isFetching,
    isError,
    refetch,
  };
}
