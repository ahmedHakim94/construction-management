import { useEffect, useState, useMemo } from "react";
import type { Dayjs } from "dayjs";
import { projectService } from "@/features/settings/projects/services/project.service";
import { dailyWorkService } from "@/features/daily-work/services/dailyWork.service";
import { paymentService } from "@/features/payments/services/payment.service";
import type { DailyWork } from "@/features/daily-work/types";
import type { Payment } from "@/features/payments/types";
import type { Project } from "@/features/settings/projects/types";
import type { ProjectReportSummary, ReportSummary } from "../types";

const filterDailyWork = (
  dailyWork: DailyWork[],
  projectId: string,
  dateFrom: Dayjs | null,
  dateTo: Dayjs | null,
): DailyWork[] => {
  return dailyWork.filter((record) => {
    if (projectId && record.projectId !== projectId) return false;
    if (dateFrom && record.date < dateFrom.format("YYYY-MM-DD")) return false;
    if (dateTo && record.date > dateTo.format("YYYY-MM-DD")) return false;
    return true;
  });
};

const filterPayments = (
  payments: Payment[],
  filteredDailyWork: DailyWork[],
): Payment[] => {
  const activePaymentKeys = new Set<string>();
  for (const record of filteredDailyWork) {
    const monthKey = record.date.slice(0, 7); // YYYY-MM
    activePaymentKeys.add(`${record.projectId}|${record.contractorId}|${monthKey}`);
  }

  return payments.filter((payment) => {
    const monthKey = payment.startDate.slice(0, 7); // YYYY-MM
    const key = `${payment.projectId}|${payment.contractorId}|${monthKey}`;
    return activePaymentKeys.has(key);
  });
};

const aggregateReportData = (
  projects: Project[],
  filteredDailyWork: DailyWork[],
  filteredPayments: Payment[],
  projectIdFilter: string,
): ProjectReportSummary[] => {
  const targetProjects = projectIdFilter
    ? projects.filter((p) => p.id === projectIdFilter)
    : projects;

  const summaries: Record<string, ProjectReportSummary> = {};
  for (const project of targetProjects) {
    summaries[project.id] = {
      id: project.id,
      projectId: project.id,
      projectName: project.name,
      totalWorkRecords: 0,
      totalWorkingHours: 0,
      totalWorkCost: 0,
      totalDeductions: 0,
      netWorkAmount: 0,
      totalPaidAmount: 0,
      remainingBalance: 0,
    };
  }

  for (const record of filteredDailyWork) {
    const summary = summaries[record.projectId];
    if (summary) {
      summary.totalWorkRecords += 1;
      summary.totalWorkingHours += record.workingHours ?? 0;
      summary.totalWorkCost += record.cost ?? 0;
      summary.totalDeductions += record.deduction ?? 0;
    }
  }

  for (const projectId in summaries) {
    const summary = summaries[projectId];
    summary.netWorkAmount = summary.totalWorkCost - summary.totalDeductions;
  }

  for (const payment of filteredPayments) {
    const summary = summaries[payment.projectId];
    if (summary) {
      summary.totalPaidAmount += payment.paidAmount ?? 0;
    }
  }

  return Object.values(summaries).map((summary) => {
    summary.remainingBalance = summary.netWorkAmount - summary.totalPaidAmount;
    return summary;
  });
};

const calculateSummary = (reports: ProjectReportSummary[]): ReportSummary => {
  return reports.reduce(
    (acc, row) => {
      acc.totalWorkCost += row.totalWorkCost;
      acc.totalDeductions += row.totalDeductions;
      acc.netWorkAmount += row.netWorkAmount;
      acc.totalPaidAmount += row.totalPaidAmount;
      acc.remainingBalance += row.remainingBalance;
      return acc;
    },
    {
      totalWorkCost: 0,
      totalDeductions: 0,
      netWorkAmount: 0,
      totalPaidAmount: 0,
      remainingBalance: 0,
    },
  );
};

export function useReports() {
  const [projectId, setProjectId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [dailyWork, setDailyWork] = useState<DailyWork[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadReportsData() {
      try {
        const [projectsData, dailyWorkData] = await Promise.all([
          projectService.getAll(),
          dailyWorkService.getAll(),
        ]);

        const paymentsData = await paymentService.synchronizeFromDailyWork(dailyWorkData);

        if (!isMounted) return;

        setProjects(projectsData);
        setDailyWork(dailyWorkData);
        setPayments(paymentsData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading reports data:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadReportsData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDailyWork = useMemo(() => {
    return filterDailyWork(dailyWork, projectId, dateFrom, dateTo);
  }, [dailyWork, projectId, dateFrom, dateTo]);

  const filteredPayments = useMemo(() => {
    return filterPayments(payments, filteredDailyWork);
  }, [payments, filteredDailyWork]);

  const reports = useMemo(() => {
    return aggregateReportData(projects, filteredDailyWork, filteredPayments, projectId);
  }, [projects, filteredDailyWork, filteredPayments, projectId]);

  const summary = useMemo(() => {
    return calculateSummary(reports);
  }, [reports]);

  return {
    reports,
    summary,
    projects,
    filters: {
      projectId,
      dateFrom,
      dateTo,
    },
    setFilters: {
      setProjectId,
      setDateFrom,
      setDateTo,
    },
    isLoading,
  };
}
