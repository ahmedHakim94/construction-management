import { z } from "zod";
import {
  equipmentSchema,
  updateEquipmentSchema,
} from "./schemas/equipment.schema";
import type { PaginationParams } from "@/types";

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
  projectId: number | null; // New
}

export type EquipmentFormValues = z.infer<typeof equipmentSchema>;

export type EquipmentUpdateValues = z.infer<typeof updateEquipmentSchema>;

export type EquipmentParams = PaginationParams & {
  search?: string;
};

export type EquipmentResponse = {
  success: boolean;
  message?: string;
  data: Equipment;
};

export type EquipmentListResponse = {
  success: boolean;
  data: Equipment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DeleteEquipmentResponse = {
  success: boolean;
  message: string;
};

export type EquipmentResult = {
  data: Equipment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
