import { storage } from "@/core/storage/localStorage";
import { contractorsMockData } from "../mock/contractors";
import type { Contractor, ContractorFormValues } from "../types";

const STORAGE_KEY = "construction_contractors";

let contractors: Contractor[] = storage.get<Contractor[]>(
  STORAGE_KEY,
  contractorsMockData,
);

function generateCode(): string {
  const nextId = contractors.length + 1;
  return `CT-${String(nextId).padStart(4, "0")}`;
}

export const contractorService = {
  async getAll(): Promise<Contractor[]> {
    return [...contractors];
  },

  async getById(id: string): Promise<Contractor | undefined> {
    return contractors.find((item) => item.id === id);
  },

  async create(data: ContractorFormValues): Promise<Contractor> {
    const nextContractor: Contractor = {
      id: `c-${Date.now()}`,
      code: generateCode(),
      name: data.name,
      phone: data.phone,
      address: data.address || "",
      nationalId: data.nationalId || undefined,
      notes: data.notes || undefined,
      status: data.status,
      createdAt: new Date().toISOString().split("T")[0],
    };

    contractors = [nextContractor, ...contractors];
    storage.set(STORAGE_KEY, contractors);
    return nextContractor;
  },

  async update(id: string, data: ContractorFormValues): Promise<Contractor | undefined> {
    contractors = contractors.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        name: data.name,
        phone: data.phone,
        address: data.address || "",
        nationalId: data.nationalId || undefined,
        notes: data.notes || undefined,
        status: data.status,
      };
    });

    storage.set(STORAGE_KEY, contractors);
    return contractors.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    contractors = contractors.filter((item) => item.id !== id);
    storage.set(STORAGE_KEY, contractors);
  },
};

