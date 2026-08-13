import { z } from "zod";

export const contractorSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(2, "Phone is required"),
  address: z.string(),
  nationalId: z.string(),
  notes: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
