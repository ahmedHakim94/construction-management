import { z } from "zod";

export const paymentSchema = z
  .object({
    contractorId: z.string().min(1, "contractorRequired"),
    startDate: z.string().min(1, "startDateRequired"),
    endDate: z.string().min(1, "endDateRequired"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "invalidDateRange",
  });

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive("paymentAmountInvalid"),
});

export type PaymentSchemaValues = z.infer<typeof paymentSchema>;
export type RecordPaymentSchemaValues = z.infer<typeof recordPaymentSchema>;
