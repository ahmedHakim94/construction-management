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
  isSystem?: boolean;
}

export interface ContractorFormValues {
  name: string;
  phone: string;
  address: string;
  nationalId: string;
  notes: string;
  status: ContractorStatus;
}
