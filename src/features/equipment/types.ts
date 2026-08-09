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
}

export interface EquipmentFormValues {
  contractorId: string;
  equipmentTypeId: string;
  model: string;
  plateNumber: string;
  equipmentNumber: string;
  hourRate: number;
  notes: string;
}
