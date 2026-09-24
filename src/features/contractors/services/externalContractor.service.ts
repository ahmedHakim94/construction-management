import { storage } from "@/core/storage/localStorage";
import type {
  ExternalContractor,
  ExternalContractorFormValues,
} from "@/features/contractors/types";

const STORAGE_KEY = "construction_external_contractors";

let externalContractors: ExternalContractor[] = storage.get<
  ExternalContractor[]
>(STORAGE_KEY, []);

export const externalContractorService = {
  async getAll(): Promise<ExternalContractor[]> {
    return [...externalContractors];
  },

  async getById(id: string): Promise<ExternalContractor | undefined> {
    return externalContractors.find((item) => item.id === id);
  },

  async create(
    data: ExternalContractorFormValues,
  ): Promise<ExternalContractor> {
    const nextExternalContractor: ExternalContractor = {
      id: `external-${crypto.randomUUID()}`,
      name: data.name,
      createdAt: new Date().toISOString().split("T")[0],
    };

    externalContractors = [nextExternalContractor, ...externalContractors];
    storage.set(STORAGE_KEY, externalContractors);
    return nextExternalContractor;
  },
};
