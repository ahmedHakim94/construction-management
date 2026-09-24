import { z } from "zod";
import { contractorSchema } from "./schemas/contractor.schema";

export type ContractorStatus = "ACTIVE" | "INACTIVE";

export interface Contractor {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  nationalId?: string;
  notes?: string;
  status: ContractorStatus;
  createdAt: string;
}

export type ContractorFormValues = z.infer<typeof contractorSchema>;

export interface ExternalContractor {
  id: string;
  name: string;
  createdAt: string;
}

export interface ExternalContractorFormValues {
  name: string;
}
