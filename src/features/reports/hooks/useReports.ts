import { useEffect, useState, useMemo } from "react";
import type { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { projectService } from "@/features/settings/projects/services/project.service";
import { dailyWorkService } from "@/features/daily-work/services/dailyWork.service";
import { paymentService } from "@/features/payments/services/payment.service";
import { contractorService } from "@/features/contractors/services/contractor.service";
import { equipmentService } from "@/features/equipment/services/equipment.service";
import { taskService } from "@/features/settings/task/services/task.service";
import type { DailyWork } from "@/features/daily-work/types";
import type { Payment } from "@/features/payments/types";
import type { Project } from "@/features/settings/projects/types";
import type { Contractor } from "@/features/contractors/types";
import type { Equipment } from "@/features/equipment/types";
import type { Task } from "@/features/settings/task/types";
import type {
  ProjectReportSummary,
  ReportSummary,
  DailyWorkReport,
  ContractorReport,
  ProjectReport,
} from "../types";

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
    activePaymentKeys.add(
      `${record.projectId}|${record.contractorId}|${monthKey}`,
    );
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

const aggregateContractorData = (
  contractors: Contractor[],
  equipment: Equipment[],
  filteredDailyWork: DailyWork[],
  filteredPayments: Payment[],
): ContractorReport[] => {
  const summaries: Record<string, {
    totalWorkingHours: number;
    totalCost: number;
    totalDeductions: number;
    totalPaid: number;
  }> = {};

  for (const contractor of contractors) {
    summaries[contractor.id] = {
      totalWorkingHours: 0,
      totalCost: 0,
      totalDeductions: 0,
      totalPaid: 0,
    };
  }

  for (const record of filteredDailyWork) {
    const summary = summaries[record.contractorId];
    if (summary) {
      summary.totalWorkingHours += record.workingHours ?? 0;
      summary.totalCost += record.cost ?? 0;
      summary.totalDeductions += record.deduction ?? 0;
    }
  }

  for (const payment of filteredPayments) {
    const summary = summaries[payment.contractorId];
    if (summary) {
      summary.totalPaid += payment.paidAmount ?? 0;
    }
  }

  const equipmentCounts: Record<string, number> = {};
  for (const eq of equipment) {
    equipmentCounts[eq.contractorId] = (equipmentCounts[eq.contractorId] ?? 0) + 1;
  }

  return contractors.map((contractor) => {
    const summary = summaries[contractor.id] ?? {
      totalWorkingHours: 0,
      totalCost: 0,
      totalDeductions: 0,
      totalPaid: 0,
    };
    const count = equipmentCounts[contractor.id] ?? 0;
    const netWorkAmount = summary.totalCost - summary.totalDeductions;

    return {
      id: contractor.id,
      contractorId: contractor.id,
      contractorName: contractor.name,
      equipmentCount: count,
      totalWorkingHours: summary.totalWorkingHours,
      totalCost: summary.totalCost,
      totalPaid: summary.totalPaid,
      remaining: netWorkAmount - summary.totalPaid,
    };
  });
};

const aggregateProjectData = (
  projects: Project[],
  filteredDailyWork: DailyWork[],
  filteredPayments: Payment[],
): ProjectReport[] => {
  const summaries: Record<string, {
    contractors: Set<string>;
    equipments: Set<string>;
    workRecords: number;
    totalWorkingHours: number;
    totalCost: number;
    totalDeductions: number;
    totalPaid: number;
  }> = {};

  for (const project of projects) {
    summaries[project.id] = {
      contractors: new Set<string>(),
      equipments: new Set<string>(),
      workRecords: 0,
      totalWorkingHours: 0,
      totalCost: 0,
      totalDeductions: 0,
      totalPaid: 0,
    };
  }

  for (const record of filteredDailyWork) {
    const summary = summaries[record.projectId];
    if (summary) {
      summary.workRecords += 1;
      summary.totalWorkingHours += record.workingHours ?? 0;
      summary.totalCost += record.cost ?? 0;
      summary.totalDeductions += record.deduction ?? 0;
      if (record.contractorId) {
        summary.contractors.add(record.contractorId);
      }
      if (record.equipmentId) {
        summary.equipments.add(record.equipmentId);
      }
    }
  }

  for (const payment of filteredPayments) {
    const summary = summaries[payment.projectId];
    if (summary) {
      summary.totalPaid += payment.paidAmount ?? 0;
    }
  }

  return projects.map((project) => {
    const summary = summaries[project.id] ?? {
      contractors: new Set<string>(),
      equipments: new Set<string>(),
      workRecords: 0,
      totalWorkingHours: 0,
      totalCost: 0,
      totalDeductions: 0,
      totalPaid: 0,
    };

    const netWorkAmount = summary.totalCost - summary.totalDeductions;

    return {
      id: project.id,
      projectId: project.id,
      projectName: project.name,
      contractorsCount: summary.contractors.size,
      equipmentCount: summary.equipments.size,
      workRecords: summary.workRecords,
      totalWorkingHours: summary.totalWorkingHours,
      totalCost: summary.totalCost,
      totalPaid: summary.totalPaid,
      remaining: netWorkAmount - summary.totalPaid,
    };
  });
};

const mapDailyWorkReports = (
  filteredRecords: DailyWork[],
  projects: Project[],
  contractors: Contractor[],
  equipment: Equipment[],
  tasks: Task[],
  _language: string,
): DailyWorkReport[] => {
  const projectsMap = new Map(projects.map((p) => [p.id, p.name]));
  const contractorsMap = new Map(contractors.map((c) => [c.id, c.name]));
  const equipmentMap = new Map(equipment.map((e) => [e.id, e.name ?? ""]));
  const tasksMap = new Map(tasks.map((t) => [t.id, t.name ?? ""]));

  return filteredRecords.map((record) => {
    const equipmentName = record.equipmentId
      ? (equipmentMap.get(record.equipmentId) ?? "")
      : (record.temporaryEquipmentName ?? "");

    const cost = record.cost ?? 0;
    const deduction = record.deduction ?? 0;

    return {
      id: record.id,
      date: record.date,
      projectId: record.projectId,
      projectName: projectsMap.get(record.projectId) ?? "",
      contractorId: record.contractorId,
      contractorName: contractorsMap.get(record.contractorId) ?? "",
      equipmentName,
      taskName: tasksMap.get(record.taskId) ?? "",
      workingHours: record.workingHours ?? 0,
      hourRate: record.hourRate ?? 0,
      fuelConsumption: record.fuelConsumption ?? 0,
      cost,
      deduction,
      deductionReason: record.deductionReason,
      netAmount: cost - deduction,
    };
  });
};

export function useReports() {
  const { i18n } = useTranslation();
  const [projectId, setProjectId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [dailyWork, setDailyWork] = useState<DailyWork[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadReportsData() {
      try {
        const [
          projectsData,
          dailyWorkData,
          contractorsData,
          equipmentData,
          tasksData,
        ] = await Promise.all([
          projectService.getAll(),
          dailyWorkService.getAll(),
          contractorService.getAll(),
          equipmentService.getAll(),
          taskService.getAll(),
        ]);

        const paymentsData =
          await paymentService.synchronizeFromDailyWork(dailyWorkData);

        if (!isMounted) return;

        setProjects(projectsData);
        setDailyWork(dailyWorkData);
        setPayments(paymentsData);
        setContractors(contractorsData);
        setEquipment(equipmentData);
        setTasks(tasksData);
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
    return aggregateReportData(
      projects,
      filteredDailyWork,
      filteredPayments,
      projectId,
    );
  }, [projects, filteredDailyWork, filteredPayments, projectId]);

  const summary = useMemo(() => {
    return calculateSummary(reports);
  }, [reports]);

  const dailyWorkReports = useMemo(() => {
    return mapDailyWorkReports(
      filteredDailyWork,
      projects,
      contractors,
      equipment,
      tasks,
      i18n.language,
    );
  }, [
    filteredDailyWork,
    projects,
    contractors,
    equipment,
    tasks,
    i18n.language,
  ]);

  const filteredPaymentsForReports = useMemo(() => {
    return payments.filter((payment) => {
      if (projectId && payment.projectId !== projectId) return false;
      if (dateFrom && payment.endDate < dateFrom.format("YYYY-MM-DD")) return false;
      if (dateTo && payment.startDate > dateTo.format("YYYY-MM-DD")) return false;
      return true;
    });
  }, [payments, projectId, dateFrom, dateTo]);

  const contractorReports = useMemo(() => {
    return aggregateContractorData(
      contractors,
      equipment,
      filteredDailyWork,
      filteredPaymentsForReports,
    );
  }, [contractors, equipment, filteredDailyWork, filteredPaymentsForReports]);

  const projectReports = useMemo(() => {
    return aggregateProjectData(
      projects,
      filteredDailyWork,
      filteredPaymentsForReports,
    );
  }, [projects, filteredDailyWork, filteredPaymentsForReports]);

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
    dailyWorkReports,
    contractorReports,
    projectReports,
    isLoading,
  };
}
