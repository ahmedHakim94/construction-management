import { z } from "zod";

export const equipmentTypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type EquipmentTypeSchemaValues = z.infer<typeof equipmentTypeSchema>;
