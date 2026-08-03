import type { Contractor } from "../types";

export const contractorsMockData: Contractor[] = [
  {
    id: "c-1001",
    code: "CT-1001",
    name: "Al Noor Builders",
    phone: "+966500123456",
    address: "Riyadh, Saudi Arabia",
    nationalId: "1001234567",
    notes: "Preferred for large-scale projects",
    status: "ACTIVE",
    createdAt: "2025-01-08",
  },
  {
    id: "c-1002",
    code: "CT-1002",
    name: "Blue Stone Contracting",
    phone: "+966550123456",
    address: "Jeddah, Saudi Arabia",
    nationalId: "1002345678",
    notes: "Specializes in interior works",
    status: "ACTIVE",
    createdAt: "2025-02-14",
  },
  {
    id: "c-1003",
    code: "CT-1003",
    name: "Golden Frame Co.",
    phone: "+966560123456",
    address: "Dammam, Saudi Arabia",
    nationalId: "1003456789",
    notes: "Works on finishing contracts",
    status: "INACTIVE",
    createdAt: "2025-03-21",
  },
];
