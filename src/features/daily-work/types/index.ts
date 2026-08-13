import { z } from "zod";
import { dailyWorkSchema } from "../schemas/dailyWork.schema";

export interface DailyWork {
  id: string;
  date: string;
  projectId: string;
  contractorId: string;
  equipmentId?: string;
  temporaryEquipmentName?: string;
  hourRate: number;
  workingHours: number;
  fuelConsumption: number;
  taskId: string;
  cost: number;
  deduction: number;
  deductionReason?: string;
  notes?: string;
  createdAt: string;
}

export type DailyWorkFormValues = z.infer<typeof dailyWorkSchema>;
