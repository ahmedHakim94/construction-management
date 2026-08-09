import { z } from "zod";

export const contractorSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(2, "Phone is required"),
  address: z.string().default(""),
  nationalId: z.string().default(""),
  notes: z.string().default(""),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type ContractorSchemaValues = z.infer<typeof contractorSchema>;
