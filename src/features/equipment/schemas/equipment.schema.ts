import { z } from "zod";

export const equipmentSchema = z.object({
  contractorId: z.string().trim().min(1, "Contractor is required"),
  equipmentTypeId: z.string().trim().min(1, "Equipment type is required"),
  model: z.string().optional(),
  plateNumber: z.string().optional(),
  hourRate: z.number().min(0, "Hour rate must be positive"),
  notes: z.string().optional(),
});
