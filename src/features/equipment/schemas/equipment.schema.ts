import { z } from "zod";

export const equipmentSchema = z.object({
  contractorId: z.number().min(1, "Contractor is required"),
  equipmentTypeId: z.number().min(1, "Equipment type is required"),
  model: z.string().optional(),
  plateNumber: z.string().optional(),
  hourlyPrice: z.number().min(1, "Hour rate must be greater than 0"),
  notes: z.string().optional(),
});