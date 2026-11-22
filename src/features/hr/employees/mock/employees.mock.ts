import type { Employee, EmployeeProject } from "../types";

export const MOCK_EMPLOYEE_PROJECTS: EmployeeProject[] = [
  { id: 1, name: "مشروع برج النيل الإداري" },
  { id: 2, name: "مشروع كمبوند الواحة السكني" },
  { id: 3, name: "مشروع تطوير الطريق الدائري" },
  { id: 4, name: "مشروع المستشفى التخصصي" },
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    code: "EMP-001",
    name: "أحمد محمود السيد",
    phone: "01012345678",
    jobTitle: "مهندس موقع",
    projectIds: [1, 2],
    basicSalary: 14500,
    status: "ACTIVE",
  },
  {
    id: 2,
    code: "EMP-002",
    name: "محمد حسن عبد الله",
    phone: "01123456789",
    jobTitle: "مشرف تنفيذ",
    projectIds: [1],
    basicSalary: 9500,
    status: "ACTIVE",
  },
  {
    id: 3,
    code: "EMP-003",
    name: "كريم طارق إبراهيم",
    phone: "01234567890",
    jobTitle: "مساح أراضي",
    projectIds: [2, 3],
    basicSalary: 11000,
    status: "ACTIVE",
  },
  {
    id: 4,
    code: "EMP-004",
    name: "يوسف سامي فؤاد",
    phone: "01545678901",
    jobTitle: "محاسب موقع",
    projectIds: [3],
    basicSalary: 10200,
    status: "INACTIVE",
  },
  {
    id: 5,
    code: "EMP-005",
    name: "عمر خالد مصطفى",
    phone: "01098765432",
    jobTitle: "فني سلامة وصحة مهنية",
    projectIds: [1, 3, 4],
    basicSalary: 12000,
    status: "ACTIVE",
  },
];
