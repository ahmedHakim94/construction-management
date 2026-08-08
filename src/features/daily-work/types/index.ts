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

export interface DailyWorkFormValues {
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
}
