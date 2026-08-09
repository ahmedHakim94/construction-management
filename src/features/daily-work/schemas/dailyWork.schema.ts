import { z } from "zod";

export const dailyWorkSchema = z.object({
  date: z.string().trim().min(1, "Date is required"),
  projectId: z.string().trim().min(1, "Project is required"),
  contractorId: z.string().trim().min(1, "Contractor is required"),
  equipmentId: z.string().optional(),
  temporaryEquipmentName: z.string().optional(),
  hourRate: z.number().min(0, "Hour rate is required"),
  workingHours: z.number().min(0, "Working hours is required"),
  fuelConsumption: z.number().min(0, "Fuel consumption is required"),
  taskId: z.string().trim().min(1, "Task is required"),
  cost: z.number().min(0, "Cost is required"),
  deduction: z.number().min(0, "Deduction is required"),
  deductionReason: z.string().optional(),
  notes: z.string().optional(),
});

export type DailyWorkSchemaValues = z.infer<typeof dailyWorkSchema>;
