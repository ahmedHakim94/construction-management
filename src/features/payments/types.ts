import { z } from "zod";
import { recordPaymentSchema } from "./schemas/payment.schema";

export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface Payment {
  id: string;
  projectId: string;
  contractorId: string;
  startDate: string;
  endDate: string;
  grossAmount: number;
  totalDeductions: number;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  amount: number;
  date: string;
  createdAt: string;
}

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;
