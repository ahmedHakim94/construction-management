import { z } from "zod";

export const contractorSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(2, "Phone is required"),
  address: z.string().optional(),
  nationalId: z.string(),
  notes: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  equipment: z.array(
    z.object({
      id: z.string().optional(),
      equipmentTypeId: z.string().trim().min(1, "Equipment type is required"),
      model: z.string().optional(),
      plateNumber: z.string().optional(),
      hourRate: z.number().min(0, "Hour rate must be positive"),
      notes: z.string().optional(),
    })
  ).optional(),
});
