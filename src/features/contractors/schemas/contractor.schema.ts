import { z } from "zod";

export const contractorEquipmentSchema = z.object({
  id: z.number().optional(),

  equipmentTypeId: z
    .number({
      message: "Equipment type is required",
    })
    .min(1, "Equipment type is required"),

  model: z.string().optional(),
  plateNumber: z.string().optional(),

  hourlyPrice: z.number().min(1, "Hour rate must be greater than 0"),
  notes: z.string().optional(),
});

export const contractorSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(2, "Phone is required"),
  notes: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  equipment: z.array(contractorEquipmentSchema),
});
