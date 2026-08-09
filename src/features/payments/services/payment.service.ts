import { paymentsMockData } from "../mock/payments";
import { paymentTransactionsMockData } from "../mock/paymentTransactions";
import type { Payment, PaymentFormValues, PaymentTransaction } from "../types";

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

export const paymentService = {
  async getAll(): Promise<Payment[]> {
    return [...paymentRecords];
  },

  async getById(id: string): Promise<Payment | undefined> {
    return paymentRecords.find((item) => item.id === id);
  },

  async create(
    data: PaymentFormValues & {
      grossAmount: number;
      totalDeductions: number;
      netAmount: number;
    },
  ): Promise<Payment> {
    const existingPayment = paymentRecords.find(
      (item) =>
        item.contractorId === data.contractorId &&
        item.startDate === data.startDate &&
        item.endDate === data.endDate,
    );

    if (existingPayment) {
      const paidAmount = paymentTransactions
        .filter((item) => item.paymentId === existingPayment.id)
        .reduce((sum, item) => sum + item.amount, 0);
      const remainingAmount = Math.max(data.netAmount - paidAmount, 0);
      const status = calculateStatus(data.netAmount, paidAmount);

      const updatedPayment: Payment = {
        ...existingPayment,
        grossAmount: data.grossAmount,
        totalDeductions: data.totalDeductions,
        netAmount: data.netAmount,
        paidAmount,
        remainingAmount,
        status,
      };

      paymentRecords = paymentRecords.map((item) =>
        item.id === existingPayment.id ? updatedPayment : item,
      );

      return updatedPayment;
    }

    const nextRecord: Payment = {
      id: `p-${Date.now()}`,
      contractorId: data.contractorId,
      startDate: data.startDate,
      endDate: data.endDate,
      grossAmount: data.grossAmount,
      totalDeductions: data.totalDeductions,
      netAmount: data.netAmount,
      paidAmount: 0,
      remainingAmount: data.netAmount,
      status: calculateStatus(data.netAmount, 0),
      createdAt: new Date().toISOString().split("T")[0],
    };

    paymentRecords = [nextRecord, ...paymentRecords];
    return nextRecord;
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

    // Validate payment amount
    if (amount <= 0) {
      throw new Error("InvalidPaymentAmount");
    }

    // Calculate current paid amount from existing transactions
    const currentPaidAmount = paymentTransactions
      .filter((item) => item.paymentId === paymentId)
      .reduce((sum, item) => sum + item.amount, 0);

    const currentRemainingAmount = Math.max(
      payment.netAmount - currentPaidAmount,
      0,
    );

    // Prevent paying more than the remaining amount
    if (amount > currentRemainingAmount) {
      throw new Error("PaymentAmountExceedsRemaining");
    }

    // Create new payment transaction
    const transaction: PaymentTransaction = {
      id: `pt-${Date.now()}`,
      paymentId,
      amount,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
    };

    paymentTransactions = [transaction, ...paymentTransactions];

    // Recalculate total paid after adding the new transaction
    const paidAmount = paymentTransactions
      .filter((item) => item.paymentId === paymentId)
      .reduce((sum, item) => sum + item.amount, 0);

    const remainingAmount = Math.max(payment.netAmount - paidAmount, 0);

    const status = calculateStatus(payment.netAmount, paidAmount);

    // Update payment record
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

  async refreshSettlement(
    paymentId: string,
    data: {
      grossAmount: number;
      totalDeductions: number;
      netAmount: number;
    },
  ): Promise<Payment | undefined> {
    const payment = paymentRecords.find((item) => item.id === paymentId);

    if (!payment) {
      return undefined;
    }

    const paidAmount = paymentTransactions
      .filter((item) => item.paymentId === paymentId)
      .reduce((sum, item) => sum + item.amount, 0);

    const remainingAmount = Math.max(data.netAmount - paidAmount, 0);

    const status = calculateStatus(data.netAmount, paidAmount);

    const updatedPayment: Payment = {
      ...payment,
      grossAmount: data.grossAmount,
      totalDeductions: data.totalDeductions,
      netAmount: data.netAmount,
      paidAmount,
      remainingAmount,
      status,
    };

    paymentRecords = paymentRecords.map((item) =>
      item.id === paymentId ? updatedPayment : item,
    );

    return updatedPayment;
  },
};

export const getAll = paymentService.getAll;
export const getById = paymentService.getById;
export const create = paymentService.create;
export const deletePayment = paymentService.delete;
export const recordPayment = paymentService.recordPayment;
export const getTransactions = paymentService.getTransactions;
export const refreshSettlement = paymentService.refreshSettlement;
