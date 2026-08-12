import { useEffect, useState, useMemo } from "react";
import { projectService } from "@/features/settings/projects/services/project.service";
import { contractorService } from "@/features/contractors/services/contractor.service";
import { equipmentService } from "@/features/equipment/services/equipment.service";
import { paymentService } from "@/features/payments/services/payment.service";
import { dailyWorkService } from "@/features/daily-work/services/dailyWork.service";
import { taskService } from "@/features/settings/task/services/task.service";
import { useTranslation } from "react-i18next";
import type {
  DashboardStats,
  DashboardFinancials,
  DashboardPayment,
  DashboardDailyWork,
  DashboardProjectWork,
} from "../types";
import type { Payment } from "@/features/payments/types";
import type { Project } from "@/features/settings/projects/types";
import type { Contractor } from "@/features/contractors/types";
import type { Equipment } from "@/features/equipment/types";
import type { Task } from "@/features/settings/task/types";
import type { DailyWork } from "@/features/daily-work/types";

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

const mapDashboardDailyWork = (
  dailyWorkRecords: DailyWork[],
  projectsData: Project[],
  contractorsData: Contractor[],
  equipmentData: Equipment[],
  tasksData: Task[],
  language: string,
): DashboardDailyWork[] => {
  return dailyWorkRecords.map((record) => {
    const project = projectsData.find((p) => p.id === record.projectId);
    const contractor = contractorsData.find(
      (c) => c.id === record.contractorId,
    );

    const equipment = equipmentData.find((eq) => eq.id === record.equipmentId);
    const equipmentName = record.equipmentId
      ? (equipment?.name ?? "")
      : (record.temporaryEquipmentName ?? "");

    const task = tasksData.find((t) => t.id === record.taskId);
    const taskName = task?.name ?? "";

    return {
      id: record.id,
      date: record.date,
      projectName: project?.name ?? record.projectId,
      contractorName: contractor?.name ?? record.contractorId,
      equipmentName,
      taskName,
      workingHours: record.workingHours,
      cost: record.cost,
    };
  });
};

const mapWorkByProject = (
  dailyWorkRecords: DailyWork[],
  projectsData: Project[],
): DashboardProjectWork[] => {
  const projectGroups: Record<
    string,
    { workRecords: number; workingHours: number; totalCost: number }
  > = {};

  for (const record of dailyWorkRecords) {
    const projectId = record.projectId;
    if (!projectGroups[projectId]) {
      projectGroups[projectId] = {
        workRecords: 0,
        workingHours: 0,
        totalCost: 0,
      };
    }
    projectGroups[projectId].workRecords += 1;
    projectGroups[projectId].workingHours += record.workingHours ?? 0;
    projectGroups[projectId].totalCost += record.cost ?? 0;
  }

  return Object.entries(projectGroups).map(([projectId, stats]) => {
    const project = projectsData.find((p) => p.id === projectId);
    return {
      id: projectId,
      projectId,
      projectName: project?.name ?? projectId,
      workRecords: stats.workRecords,
      workingHours: stats.workingHours,
      totalCost: stats.totalCost,
    };
  });
};

export function useDashboard() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

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

  const [rawProjects, setRawProjects] = useState<Project[]>([]);
  const [rawContractors, setRawContractors] = useState<Contractor[]>([]);
  const [rawEquipment, setRawEquipment] = useState<Equipment[]>([]);
  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [rawDailyWork, setRawDailyWork] = useState<DailyWork[]>([]);
  const [rawPayments, setRawPayments] = useState<Payment[]>([]);

  const [workByProject, setWorkByProject] = useState<DashboardProjectWork[]>(
    [],
  );

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        // Fetch all required data in parallel to avoid duplicate service calls
        const [
          projectsData,
          contractorsData,
          equipmentData,
          dailyWorkData,
          tasksData,
        ] = await Promise.all([
          projectService.getAll(),
          contractorService.getAll(),
          equipmentService.getAll(),
          dailyWorkService.getAll(),
          taskService.getAll(),
        ]);

        if (!isMounted) return;

        // Set raw data to trigger useMemos
        setRawProjects(projectsData);
        setRawContractors(contractorsData);
        setRawEquipment(equipmentData);
        setRawTasks(tasksData);
        setRawDailyWork(dailyWorkData);

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
        setRawPayments(paymentsData);

        // Calculate financials
        const calculatedFinancials = calculateFinancials(paymentsData);
        setFinancials(calculatedFinancials);

        // Group work by project using the pure helper
        const workByProjectData = mapWorkByProject(dailyWorkData, projectsData);
        setWorkByProject(workByProjectData);

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

  const dailyWork = useMemo(() => {
    return mapDashboardDailyWork(
      rawDailyWork,
      rawProjects,
      rawContractors,
      rawEquipment,
      rawTasks,
      currentLang,
    );
  }, [
    rawDailyWork,
    rawProjects,
    rawContractors,
    rawEquipment,
    rawTasks,
    currentLang,
  ]);

  const payments = useMemo(() => {
    return mapDashboardPayments(rawPayments, rawProjects, rawContractors);
  }, [rawPayments, rawProjects, rawContractors]);

  return {
    stats,
    financials,
    payments,
    dailyWork,
    workByProject,
    isLoading,
    isFinancialLoading,
  };
}
