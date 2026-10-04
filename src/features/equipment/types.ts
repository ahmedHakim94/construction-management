import { z } from "zod";
import { equipmentSchema } from "./schemas/equipment.schema";

export interface Equipment {
  id: number;
  contractorId: number;
  contractorName: string;
  equipmentTypeId: number;
  equipmentTypeName: string;
  hourlyPrice: number;
  model?: string;
  plateNumber?: string;
  notes?: string;
  createdAt: string;
}

export type EquipmentFormValues = z.infer<typeof equipmentSchema>;