import { z } from "zod";

export const equipmentTypeSchema = z.object({
//   code: z.string().trim().min(1, "Code is required"),
  nameAr: z.string().trim().min(1, "Arabic name is required"),
  nameEn: z.string().trim().min(1, "English name is required"),
});

export type EquipmentTypeSchemaValues = z.infer<typeof equipmentTypeSchema>;
