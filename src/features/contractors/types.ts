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

export type ContractorsParams = PaginationParams & {
  search?: string;
};

export type ContractorsResponse = {
  success: boolean;
  data: Contractor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ContractorResponse = {
  success: boolean;
  message?: string;
  data: Contractor;
};

export type DeleteContractorResponse = {
  success: boolean;
  message: string;
};

export type AvailableContractor = {
  id: number;
  name: string;
  phone: string;
};

export type LinkContractorPayload = {
  contractor_id: number;
  project_id?: number;
};

export type LinkContractorResponse = {
  success: boolean;
  message: string;
};

export type ContractorsResult = {
  data: Contractor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ContractorProject = {
  id: number;
  name: string;
};

export type UnlinkContractorPayload = {
  contractorId: number;
  project_ids?: number[];
};

export type ChangeContractorStatusPayload = {
  id: number;
  status: "ACTIVE" | "INACTIVE";
};
