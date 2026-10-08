import { z } from "zod";

export const paymentSchema = z.object({
  search: z.string(),
  projectId: z.string(),
  year: z.union([z.number(), z.literal("")]),
  month: z.union([z.number(), z.literal("")]),
});

export const recordPaymentSchema = z
  .object({
    amount: z.coerce.number<number>().positive(),
    paymentDate: z.string().min(1),
    paymentMethod: z.enum(["CASH", "TRANSFER"]),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.paymentMethod !== "TRANSFER" ||
      Boolean(data.referenceNumber?.trim()),
    {
      path: ["referenceNumber"],
      message: "Transfer reference number is required",
    },
  );

export type PaymentSchemaValues = z.infer<typeof paymentSchema>;
export type RecordPaymentSchemaValues = z.infer<typeof recordPaymentSchema>;
