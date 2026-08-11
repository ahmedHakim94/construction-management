import { useEffect, useState } from "react";
import { projectService } from "@/features/settings/projects/services/project.service";
import { dailyWorkService } from "@/features/daily-work/services/dailyWork.service";
import { paymentService } from "@/features/payments/services/payment.service";
import type { ProjectReportSummary } from "../types";

export function useReports() {
  const [reports, setReports] = useState<ProjectReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadReportsData() {
      try {
        const [projectsData, dailyWorkData] = await Promise.all([
          projectService.getAll(),
          dailyWorkService.getAll(),
        ]);

        // Sync and load payments from daily work
        const paymentsData = await paymentService.synchronizeFromDailyWork(dailyWorkData);

        if (!isMounted) return;

        // Initialize mapping summaries for each project
        const summaries: Record<string, ProjectReportSummary> = {};
        for (const project of projectsData) {
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

        // Aggregate daily work entries
        for (const record of dailyWorkData) {
          const summary = summaries[record.projectId];
          if (summary) {
            summary.totalWorkRecords += 1;
            summary.totalWorkingHours += record.workingHours ?? 0;
            summary.totalWorkCost += record.cost ?? 0;
            summary.totalDeductions += record.deduction ?? 0;
          }
        }

        // Calculate net work amounts
        for (const projectId in summaries) {
          const summary = summaries[projectId];
          summary.netWorkAmount = summary.totalWorkCost - summary.totalDeductions;
        }

        // Accumulate payment paid amounts
        for (const payment of paymentsData) {
          const summary = summaries[payment.projectId];
          if (summary) {
            summary.totalPaidAmount += payment.paidAmount ?? 0;
          }
        }

        // Finalize remaining balance calculation and convert to list
        const reportList = Object.values(summaries).map((summary) => {
          summary.remainingBalance = summary.netWorkAmount - summary.totalPaidAmount;
          return summary;
        });

        setReports(reportList);
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

  return {
    reports,
    isLoading,
  };
}
