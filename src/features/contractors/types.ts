import { z } from "zod";
import { contractorSchema } from "./schemas/contractor.schema";

export type ContractorStatus = "ACTIVE" | "INACTIVE";

export interface Contractor {
  id: number;
  name: string;
  phone: string;
  status: ContractorStatus;
  notes?: string;
  createdAt: string;
}

export type ContractorFormValues = z.infer<typeof contractorSchema>;

export interface ExternalContractorFormValues {
  name: string;
  phone?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ContractorEquipment {
  id: number;
  equipmentTypeId: number;
  hourlyPrice: number;
  model?: string;
  plateNumber?: string;
  notes?: string;
}

export interface ContractorDetails extends Contractor {
  equipment: ContractorEquipment[];
}

export interface ExternalContractor {
  id: number;
  name: string;
  phone?: string | null;
  createdAt: string;
}
