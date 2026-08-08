export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface Payment {
  id: string;
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

export interface PaymentFormValues {
  contractorId: string;
  startDate: string;
  endDate: string;
}

export interface RecordPaymentFormValues {
  amount: number;
}
