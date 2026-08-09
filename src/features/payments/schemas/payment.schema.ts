import { z } from "zod";

export const paymentSchema = z.object({
  projectId: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive("paymentAmountInvalid"),
});

export type PaymentSchemaValues = z.infer<typeof paymentSchema>;
export type RecordPaymentSchemaValues = z.infer<typeof recordPaymentSchema>;
