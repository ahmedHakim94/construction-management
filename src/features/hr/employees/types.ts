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
  jobTitle: string;
  projectIds: number[];
  basicSalary: number;
  status: EmployeeStatus;
}

export interface EmployeeFormValues {
  name: string;
  phone: string;
  jobTitle: string;
  projectIds: number[];
  basicSalary: number;
  status: EmployeeStatus;
}

export type EmployeeDialogMode = "create" | "edit" | "view";
