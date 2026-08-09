import { paymentsMockData } from "../mock/payments";
import { paymentTransactionsMockData } from "../mock/paymentTransactions";
import type { DailyWork } from "../../daily-work/types";
import type { Payment, PaymentTransaction } from "../types";

let paymentRecords: Payment[] = [...paymentsMockData];
let paymentTransactions: PaymentTransaction[] = [
  ...paymentTransactionsMockData,
];

function calculateStatus(netAmount: number, paidAmount: number) {
  if (paidAmount <= 0) {
    return "UNPAID" as const;
  }

  if (paidAmount >= netAmount) {
    return "PAID" as const;
  }

  return "PARTIALLY_PAID" as const;
}

function getMonthKey(date: string) {
  return date.slice(0, 7);
}

function getMonthPeriod(date: string) {
  const [year, month] = date.split("-").map(Number);
  const paddedMonth = String(month).padStart(2, "0");
  const endDay = new Date(year, month, 0).getDate();

  return {
    monthKey: `${year}-${paddedMonth}`,
    startDate: `${year}-${paddedMonth}-01`,
    endDate: `${year}-${paddedMonth}-${String(endDay).padStart(2, "0")}`,
  };
}

function getPaidAmount(paymentId: string) {
  return paymentTransactions
    .filter((item) => item.paymentId === paymentId)
    .reduce((sum, item) => sum + item.amount, 0);
}

function calculateRemainingAmount(netAmount: number, paidAmount: number) {
  return netAmount - paidAmount;
}

function calculateAmounts(records: DailyWork[]) {
  const grossAmount = records.reduce((sum, record) => sum + record.cost, 0);
  const totalDeductions = records.reduce((sum, record) => sum + record.deduction, 0);
  const netAmount = grossAmount - totalDeductions;

  return { grossAmount, totalDeductions, netAmount };
}

function buildPaymentKey(projectId: string, contractorId: string, monthKey: string) {
  return `${projectId}|${contractorId}|${monthKey}`;
}

export const paymentService = {
  async getAll(): Promise<Payment[]> {
    return [...paymentRecords];
  },

  async getById(id: string): Promise<Payment | undefined> {
    return paymentRecords.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    paymentRecords = paymentRecords.filter((item) => item.id !== id);
    paymentTransactions = paymentTransactions.filter(
      (item) => item.paymentId !== id,
    );
  },

  async recordPayment(
    paymentId: string,
    amount: number,
  ): Promise<PaymentTransaction> {
    const payment = paymentRecords.find((item) => item.id === paymentId);

    if (!payment) {
      throw new Error("PaymentNotFound");
    }

    if (amount <= 0) {
      throw new Error("InvalidPaymentAmount");
    }

    const currentPaidAmount = getPaidAmount(paymentId);
    const currentRemainingAmount = calculateRemainingAmount(
      payment.netAmount,
      currentPaidAmount,
    );

    if (amount > currentRemainingAmount) {
      throw new Error("PaymentAmountExceedsRemaining");
    }

    const transaction: PaymentTransaction = {
      id: `pt-${Date.now()}`,
      paymentId,
      amount,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
    };

    paymentTransactions = [transaction, ...paymentTransactions];

    const paidAmount = getPaidAmount(paymentId);
    const remainingAmount = calculateRemainingAmount(
      payment.netAmount,
      paidAmount,
    );
    const status = calculateStatus(payment.netAmount, paidAmount);

    paymentRecords = paymentRecords.map((item) =>
      item.id === paymentId
        ? {
            ...item,
            paidAmount,
            remainingAmount,
            status,
          }
        : item,
    );

    return transaction;
  },

  async getTransactions(paymentId: string): Promise<PaymentTransaction[]> {
    return paymentTransactions.filter((item) => item.paymentId === paymentId);
  },

  async synchronizeFromDailyWork(dailyWorkRecords: DailyWork[]): Promise<Payment[]> {
    const groupedDailyWork = new Map<
      string,
      {
        projectId: string;
        contractorId: string;
        startDate: string;
        endDate: string;
        records: DailyWork[];
      }
    >();

    for (const record of dailyWorkRecords) {
      const { monthKey, startDate, endDate } = getMonthPeriod(record.date);
      const groupKey = buildPaymentKey(record.projectId, record.contractorId, monthKey);
      const existingGroup = groupedDailyWork.get(groupKey);

      if (existingGroup) {
        existingGroup.records.push(record);
      } else {
        groupedDailyWork.set(groupKey, {
          projectId: record.projectId,
          contractorId: record.contractorId,
          startDate,
          endDate,
          records: [record],
        });
      }
    }

    const updatedPayments: Payment[] = paymentRecords.map((payment) => {
      const paymentKey = buildPaymentKey(
        payment.projectId,
        payment.contractorId,
        getMonthKey(payment.startDate),
      );
      const group = groupedDailyWork.get(paymentKey);

      if (!group) {
        return payment;
      }

      groupedDailyWork.delete(paymentKey);

      const { grossAmount, totalDeductions, netAmount } = calculateAmounts(group.records);
      const paidAmount = getPaidAmount(payment.id);

      return {
        ...payment,
        startDate: group.startDate,
        endDate: group.endDate,
        grossAmount,
        totalDeductions,
        netAmount,
        paidAmount,
        remainingAmount: calculateRemainingAmount(netAmount, paidAmount),
        status: calculateStatus(netAmount, paidAmount),
      };
    });

    const newPayments: Payment[] = [];

    for (const group of groupedDailyWork.values()) {
      const { grossAmount, totalDeductions, netAmount } = calculateAmounts(group.records);
      const paidAmount = 0;

      const nextRecord: Payment = {
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        projectId: group.projectId,
        contractorId: group.contractorId,
        startDate: group.startDate,
        endDate: group.endDate,
        grossAmount,
        totalDeductions,
        netAmount,
        paidAmount,
        remainingAmount: netAmount,
        status: calculateStatus(netAmount, paidAmount),
        createdAt: new Date().toISOString().split("T")[0],
      };

      newPayments.push(nextRecord);
    }

    paymentRecords = [...newPayments, ...updatedPayments];
    return [...paymentRecords];
  },
};

export const getTransactions = paymentService.getTransactions;
export const recordPayment = paymentService.recordPayment;
