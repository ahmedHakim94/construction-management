import { z } from "zod";
import { equipmentSchema } from "./schemas/equipment.schema";

export type EquipmentStatus = "ACTIVE" | "INACTIVE";

export interface Equipment {
  id: string;
  contractorId: string;
  equipmentTypeId: string;
  model?: string;
  plateNumber?: string;
  equipmentNumber?: string;
  hourRate: number;
  notes?: string;
  createdAt: string;
  name?: string;
}

export type EquipmentFormValues = z.infer<typeof equipmentSchema>;
