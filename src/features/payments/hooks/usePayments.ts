import { useEffect, useState } from "react";
import { paymentService } from "../services/payment.service";
import { dailyWorkService } from "@/features/daily-work/services/dailyWork.service";
import { contractorService } from "@/features/contractors/services/contractor.service";
import { projectService } from "@/features/settings/projects/services/project.service";
import { taskService } from "@/features/settings/task/services/task.service";
import type { Payment, PaymentTransaction } from "../types";
import type { Contractor } from "@/features/contractors/types";
import type { DailyWork } from "@/features/daily-work/types";
import type { Project } from "@/features/settings/projects/types";
import type { Task } from "@/features/settings/task/types";
import { equipmentService } from "@/features/equipment/services/equipment.service";
import type { Equipment } from "@/features/equipment/types";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [dailyWorkRecords, setDailyWorkRecords] = useState<DailyWork[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<
    PaymentTransaction[]
  >([]);
  const [recordLoading, setRecordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [
        contractorData,
        dailyWorkData,
        projectData,
        taskData,
        equipmentData,
      ] = await Promise.all([
        contractorService.getAll(),
        dailyWorkService.getAll(),
        projectService.getAll(),
        taskService.getAll(),
        equipmentService.getAll(),
      ]);

      setContractors(contractorData);
      setDailyWorkRecords(dailyWorkData);
      setProjects(projectData);
      setTasks(taskData);
      setEquipment(equipmentData);

      const syncedPayments =
        await paymentService.synchronizeFromDailyWork(dailyWorkData);
      setPayments(syncedPayments);
    }

    loadData();
  }, []);

  const loadTransactions = async (paymentId: string) => {
    const transactions = await paymentService.getTransactions(paymentId);
    setPaymentTransactions(transactions);
    return transactions;
  };

  const recordPayment = async (paymentId: string, amount: number) => {
    setRecordLoading(true);

    try {
      await paymentService.recordPayment(paymentId, amount);
      const updatedPayment = await paymentService.getById(paymentId);

      if (updatedPayment) {
        setPayments((current) =>
          current.map((item) =>
            item.id === updatedPayment.id ? updatedPayment : item,
          ),
        );
      }

      await loadTransactions(paymentId);
      return updatedPayment;
    } finally {
      setRecordLoading(false);
    }
  };

  const deletePayment = async (paymentId: string) => {
    setDeleteLoading(true);

    try {
      await paymentService.delete(paymentId);
      setPayments((current) => current.filter((item) => item.id !== paymentId));
      setPaymentTransactions((current) =>
        current.filter((item) => item.paymentId !== paymentId),
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const refreshPaymentFromDailyWork = async (
    payment: Payment,
    dailyWorkRecords: DailyWork[],
  ) => {
    const syncedPayments =
      await paymentService.synchronizeFromDailyWork(dailyWorkRecords);
    setPayments(syncedPayments);
    return syncedPayments.find((item) => item.id === payment.id) ?? payment;
  };

  return {
    payments,
    contractors,
    dailyWorkRecords,
    projects,
    tasks,
    equipment,
    paymentTransactions,
    recordLoading,
    deleteLoading,
    loadTransactions,
    recordPayment,
    deletePayment,
    refreshPaymentFromDailyWork,
  };
}
