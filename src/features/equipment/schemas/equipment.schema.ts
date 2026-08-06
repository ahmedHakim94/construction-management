import { z } from "zod";

export const equipmentSchema = z.object({
  contractorId: z.string().trim().min(1, "Contractor is required"),
  equipmentTypeId: z.string().trim().min(1, "Equipment type is required"),
  model: z.string().optional(),
  plateNumber: z.string().optional(),
  equipmentNumber: z.string().optional(),
  hourRate: z.number({ invalid_type_error: "Hour rate is required" }).min(0, "Hour rate must be positive"),
  notes: z.string().optional(),
});

export type EquipmentSchemaValues = z.infer<typeof equipmentSchema>;
