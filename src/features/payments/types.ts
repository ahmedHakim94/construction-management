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

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;

export interface PaymentSummary {
  contractorId: number;
  contractorName: string;

  projectId: number;
  projectName: string;

  year: number;
  month: number;

  grossAmount: string;
  totalDeductions: string;
  netAmount: string;
  paidAmount: string;
  remainingAmount: string;

  status: PaymentStatus;
}

export interface RecordPaymentPayload {
  contractorId: number;
  projectId: number;
  year: number;
  month: number;
  amount: number;
  paymentDate: string;
  paymentMethod: "CASH" | "TRANSFER";
  referenceNumber?: string;
  notes?: string;
}

export interface RecordPaymentResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    paymentId: number;
    amount: string;
    remainingAmount: string;
  };
}

export interface PaymentDetailsParams {
  contractorId: number;
  projectId: number;
  year: number;
  month: number;
}

export interface PaymentTransaction {
  id: number;
  paymentId: number;
  amount: string;
  paymentDate: string;
  paymentMethod: "CASH" | "TRANSFER";
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PaymentDetails {
  summary: PaymentSummary;
  dailyWorks: PaymentDailyWork[];
  transactions: PaymentTransaction[];
}

export interface PaymentDetailsResponse {
  success: boolean;
  data: PaymentDetails;
}

export interface PaymentDailyWork {
  id: number;
  project_id: number;
  contractor_id: number;
  equipment_id: number | null;
  task_id: number | null;
  temporary_equipment_name: string | null;
  equipmentName: string | null;
  taskName: string | null;
  start_datetime: string;
  end_datetime: string;
  hour_rate: number;
  cost: string;
  deduction: string;
  deduction_reason: string | null;
  notes: string | null;
}

