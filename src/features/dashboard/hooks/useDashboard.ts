import { useEffect, useState } from "react";
import { projectService } from "@/features/settings/projects/services/project.service";
import { contractorService } from "@/features/contractors/services/contractor.service";
import { equipmentService } from "@/features/equipment/services/equipment.service";
import { paymentService } from "@/features/payments/services/payment.service";
import { dailyWorkService } from "@/features/daily-work/services/dailyWork.service";
import type { DashboardStats, DashboardFinancials } from "../types";

export function useDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFinancialLoading, setIsFinancialLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    contractors: 0,
    equipment: 0,
  });
  const [financials, setFinancials] = useState<DashboardFinancials>({
    totalCost: 0,
    totalPaid: 0,
    remainingAmount: 0,
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const [projectsData, contractorsData, equipmentData] =
          await Promise.all([
            projectService.getAll(),
            contractorService.getAll(),
            equipmentService.getAll(),
          ]);
        if (isMounted) {
          setStats({
            projects: projectsData?.length ?? 0,
            contractors: contractorsData?.length ?? 0,
            equipment: equipmentData?.length ?? 0,
          });
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    void fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchFinancials() {
      try {
        const dailyWorkData = await dailyWorkService.getAll();

        const paymentsData =
          await paymentService.synchronizeFromDailyWork(dailyWorkData);

        if (isMounted) {
          const totalCost = paymentsData.reduce(
            (sum, item) => sum + (item.netAmount ?? 0),
            0,
          );
          const totalPaid = paymentsData.reduce(
            (sum, item) => sum + (item.paidAmount ?? 0),
            0,
          );
          const remainingAmount = paymentsData.reduce(
            (sum, item) => sum + (item.remainingAmount ?? 0),
            0,
          );
          setFinancials({
            totalCost,
            totalPaid,
            remainingAmount,
          });
        }
      } catch (err) {
        console.error("Error loading financial data", err);
      } finally {
        if (isMounted) {
          setIsFinancialLoading(false);
        }
      }
    }
    void fetchFinancials();
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    stats,
    financials,
    isLoading,
    isFinancialLoading,
  };
}
