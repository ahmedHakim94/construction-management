import { useEffect, useState } from "react";
import {
  paymentService,
  getTransactions,
  recordPayment as recordPaymentService,
} from "../services/payment.service";
import { dailyWorkService } from "@/features/daily-work/services/dailyWork.service";
import { contractorService } from "@/features/contractors/services/contractor.service";
import { projectService } from "@/features/settings/projects/services/project.service";
import { taskService } from "@/features/settings/task/services/task.service";
import type { Payment, PaymentTransaction } from "../types";
import type { Contractor } from "@/features/contractors/types";
import type { DailyWork } from "@/features/daily-work/types";
import type { Project } from "@/features/settings/projects/types";
import type { Task } from "@/features/settings/task/types";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [dailyWorkRecords, setDailyWorkRecords] = useState<DailyWork[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<
    PaymentTransaction[]
  >([]);
  const [recordLoading, setRecordLoading] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [
        paymentData,
        contractorData,
        dailyWorkData,
        projectData,
        taskData,
      ] = await Promise.all([
        paymentService.getAll(),
        contractorService.getAll(),
        dailyWorkService.getAll(),
        projectService.getAll(),
        taskService.getAll(),
      ]);

      setPayments(paymentData);
      setContractors(contractorData);
      setDailyWorkRecords(dailyWorkData);
      setProjects(projectData);
      setTasks(taskData);
    }

    loadData();
  }, []);

  const loadTransactions = async (paymentId: string) => {
    const transactions = await getTransactions(paymentId);
    setPaymentTransactions(transactions);
    return transactions;
  };

  const createOrUpdateSettlement = async (data: {
    contractorId: string;
    startDate: string;
    endDate: string;
    grossAmount: number;
    totalDeductions: number;
    netAmount: number;
  }) => {
    setSettlementLoading(true);

    try {
      const payment = await paymentService.create(data);

      setPayments((current) => {
        const existingIndex = current.findIndex(
          (item) => item.id === payment.id,
        );
        if (existingIndex >= 0) {
          return current.map((item) =>
            item.id === payment.id ? payment : item,
          );
        }
        return [payment, ...current];
      });

      return payment;
    } finally {
      setSettlementLoading(false);
    }
  };

  const recordPayment = async (paymentId: string, amount: number) => {
    setRecordLoading(true);

    try {
      await recordPaymentService(paymentId, amount);
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

  const refreshPaymentSettlement = async (
    payment: Payment,
    dailyWorkRecords: DailyWork[],
  ) => {
    const records = dailyWorkRecords.filter(
      (record) =>
        record.contractorId === payment.contractorId &&
        record.date >= payment.startDate &&
        record.date <= payment.endDate,
    );

    const grossAmount = records.reduce((sum, record) => sum + record.cost, 0);

    const totalDeductions = records.reduce(
      (sum, record) => sum + record.deduction,
      0,
    );

    const netAmount = grossAmount - totalDeductions;

    const updatedPayment = await paymentService.refreshSettlement(payment.id, {
      grossAmount,
      totalDeductions,
      netAmount,
    });

    if (updatedPayment) {
      setPayments((current) =>
        current.map((item) =>
          item.id === updatedPayment.id ? updatedPayment : item,
        ),
      );
    }

    return updatedPayment;
  };

  return {
    payments,
    contractors,
    dailyWorkRecords,
    projects,
    tasks,
    paymentTransactions,
    recordLoading,
    settlementLoading,
    deleteLoading,
    loadTransactions,
    createOrUpdateSettlement,
    recordPayment,
    deletePayment,
    refreshPaymentSettlement,
  };
}
