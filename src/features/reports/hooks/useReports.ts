import { useState } from "react";
import type { Dayjs } from "dayjs";
import type { ReportSummary } from "../types";
import { useGetReportsQuery } from "../services/reportsApi";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";

const emptySummary: ReportSummary = {
  totalWorkRecords: 0,
  totalWorkingHours: 0,
  totalWorkCost: 0,
  totalDeductions: 0,
  netWorkAmount: 0,
  totalPaidAmount: 0,
  remainingBalance: 0,
};

export function useReports() {
  const [projectId, setProjectId] = useState("");
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);

  const { data, isLoading, isFetching } = useGetReportsQuery(
    {
      projectId,
      dateFrom: dateFrom?.format("YYYY-MM-DD"),
      dateTo: dateTo?.format("YYYY-MM-DD"),
    },
    {
      skip: Boolean(dateFrom && dateTo && dateFrom.isAfter(dateTo, "day")),
    },
  );

  // Independent projects list (not affected by report filters)
  const { data: projectsResponse } = useGetAllProjectsQuery();

  return {
    reports: data?.data.reports ?? [],
    summary: data?.data.summary ?? emptySummary,
    projects: projectsResponse ?? [],
    dailyWorkReports: data?.data.dailyWorkReports ?? [],
    contractorReports: (data?.data.contractorReports ?? []).filter(
      (contractor) => contractor.totalWorkingHours > 0,
    ),
    isLoading: isLoading || isFetching,
    filters: { projectId, dateFrom, dateTo },
    setFilters: { setProjectId, setDateFrom, setDateTo },
  };
}
