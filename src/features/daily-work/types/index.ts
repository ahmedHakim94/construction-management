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

// export type DailyWorkFormValues = z.infer<typeof dailyWorkSchema>;

export interface DailyWorkFormValues {
  date: string;

  projectId: number | "";
  contractorId: number | "";

  isExternal: boolean;
  externalContractorId: number | "";

  equipmentId: number | "";
  temporaryEquipmentName?: string;

  startTime: string;
  endTime: string;

  hourRate: number;
  fuelConsumption: number;

  taskId: number | "";

  cost: number;

  deduction: number;
  deductionReason?: string;

  notes?: string;
}

export interface CreateDailyWorkPayload {
  projectId: number;
  contractorId: number;

  equipmentId: number | null;

  taskId: number;

  isExternal: boolean;

  temporaryEquipmentName?: string;

  startDatetime: string;
  endDatetime: string;

  hourRate: number;

  fuelConsumption: number;

  deduction: number;
  deductionReason?: string;

  notes?: string;
}

export interface DailyWorkList {
  id: number;
  projectId: number;
  projectName: string;
  contractorId: number;
  contractorName: string;
  isExternal: boolean | number;
  equipmentId: number | null;
  equipmentTypeName: string | null;
  temporaryEquipmentName: string | null;
  taskId: number;
  taskName: string;
  startDatetime: string;
  endDatetime: string;
  hourRate: number;
  cost: number;
  fuelConsumption: number;
  deduction: number;
  deductionReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  workingMinutes: number;
}

export interface GetDailyWorkParams {
  page?: number;
  limit?: number;
  search?: string;
  date?: string;
}

export interface GetDailyWorkResponse {
  success: boolean;
  data: DailyWorkList[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateDailyWorkResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
  };
}
