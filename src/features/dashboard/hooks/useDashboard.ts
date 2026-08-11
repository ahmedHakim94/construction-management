import { useEffect, useState } from "react";
import { projectService } from "@/features/settings/projects/services/project.service";
import { contractorService } from "@/features/contractors/services/contractor.service";
import { equipmentService } from "@/features/equipment/services/equipment.service";
import { paymentService } from "@/features/payments/services/payment.service";
import { dailyWorkService } from "@/features/daily-work/services/dailyWork.service";
import type {
  DashboardStats,
  DashboardFinancials,
  DashboardPayment,
} from "../types";
import type { Payment } from "@/features/payments/types";
import type { Project } from "@/features/settings/projects/types";
import type { Contractor } from "@/features/contractors/types";

const calculateFinancials = (paymentsData: Payment[]): DashboardFinancials => {
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
  return { totalCost, totalPaid, remainingAmount };
};

const mapDashboardPayments = (
  paymentsData: Payment[],
  projectsData: Project[],
  contractorsData: Contractor[],
): DashboardPayment[] => {
  return paymentsData.map((payment) => {
    const project = projectsData.find((p) => p.id === payment.projectId);
    const contractor = contractorsData.find(
      (c) => c.id === payment.contractorId,
    );
    return {
      id: payment.id,
      projectName: project?.name ?? payment.projectId,
      contractorName: contractor?.name ?? payment.contractorId,
      startDate: payment.startDate,
      endDate: payment.endDate,
      netAmount: payment.netAmount,
      paidAmount: payment.paidAmount,
      remainingAmount: payment.remainingAmount,
      status: payment.status,
    };
  });
};

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
  const [payments, setPayments] = useState<DashboardPayment[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        // Fetch all required data in parallel to avoid duplicate service calls
        const [projectsData, contractorsData, equipmentData, dailyWorkData] =
          await Promise.all([
            projectService.getAll(),
            contractorService.getAll(),
            equipmentService.getAll(),
            dailyWorkService.getAll(),
          ]);

        if (!isMounted) return;

        // Set summary statistics
        setStats({
          projects: projectsData?.length ?? 0,
          contractors: contractorsData?.length ?? 0,
          equipment: equipmentData?.length ?? 0,
        });
        setIsLoading(false);

        // Recalculate payments using the existing synchronization logic
        const paymentsData =
          await paymentService.synchronizeFromDailyWork(dailyWorkData);

        // Calculate financials
        const calculatedFinancials = calculateFinancials(paymentsData);
        setFinancials(calculatedFinancials);

        // Map calculated payments resolving contractor/project names from the already-fetched data
        const mappedPayments = mapDashboardPayments(
          paymentsData,
          projectsData,
          contractorsData,
        );
        setPayments(mappedPayments);
        setIsFinancialLoading(false);
      } catch (err) {
        console.error("Error loading dashboard data", err);
        if (isMounted) {
          setIsLoading(false);
          setIsFinancialLoading(false);
        }
      }
    }

    void loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    stats,
    financials,
    payments,
    isLoading,
    isFinancialLoading,
  };
}
