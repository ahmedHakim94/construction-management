import type { PaginationMeta, PaginationParams } from "@/types";

export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface EmployeeProject {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  code: string;
  name: string;
  phone: string;
  address?: string;
  jobTitle: string;
  hireDate?: string;
  projectIds: number[];
  projects?: EmployeeProject[];
  basicSalary: number;
  status: EmployeeStatus;
}

export interface EmployeeFormValues {
  name: string;
  phone: string;
  address: string;
  jobTitle: string;
  hireDate: string;
  projectIds: number[];
  basicSalary: number;
  status: EmployeeStatus;
}

export type EmployeeDialogMode = "create" | "edit" | "view";

export interface ApiEmployee {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  salary: number | string;
  status: EmployeeStatus;
  job_title: string | null;
  hire_date: string | null;
  project_ids: number[];
  projects: EmployeeProject[];
}

export interface EmployeesQueryParams extends PaginationParams {
  search?: string;
  status?: EmployeeStatus;
  project_id?: number;
}

export interface EmployeesApiResponse {
  success: boolean;
  data: ApiEmployee[];
  pagination: PaginationMeta;
}

export interface EmployeesResult {
  data: Employee[];
  pagination: PaginationMeta;
}

export interface EmployeeApiResponse {
  success: boolean;
  message?: string;
  data: ApiEmployee;
}

export interface DeleteEmployeeResponse {
  success: boolean;
  message?: string;
}

export interface EmployeeMutationPayload {
  name: string;
  phone: string;
  address: string | null;
  salary: number;
  status: EmployeeStatus;
  job_title: string | null;
  hire_date: string | null;
  project_ids?: number[];
}
