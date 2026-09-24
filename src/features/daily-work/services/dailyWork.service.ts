import { storage } from "@/core/storage/localStorage";
import type { DailyWork, DailyWorkFormValues } from "../types";

const STORAGE_KEY = "construction_daily_work";

let dailyWorkRecords: DailyWork[] = storage.get<DailyWork[]>(
  STORAGE_KEY,
  [],
);

export const dailyWorkService = {
  async getAll(): Promise<DailyWork[]> {
    return [...dailyWorkRecords];
  },

  async getById(id: string): Promise<DailyWork | undefined> {
    return dailyWorkRecords.find((item) => item.id === id);
  },

  async create(data: DailyWorkFormValues): Promise<DailyWork> {
    const nextRecord: DailyWork = {
      id: `dw-${Date.now()}`,
      date: data.date,
      projectId: data.projectId,
      contractorId: data.contractorId ?? "",
      equipmentId: data.equipmentId || undefined,
      temporaryEquipmentName: data.temporaryEquipmentName || undefined,
      hourRate: data.hourRate,
      workingHours: data.workingHours,
      fuelConsumption: data.fuelConsumption,
      taskId: data.taskId,
      cost: data.cost,
      deduction: data.deduction,
      deductionReason: data.deductionReason || undefined,
      notes: data.notes || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };

    dailyWorkRecords = [nextRecord, ...dailyWorkRecords];
    storage.set(STORAGE_KEY, dailyWorkRecords);
    return nextRecord;
  },

  async update(
    id: string,
    data: DailyWorkFormValues,
  ): Promise<DailyWork | undefined> {
    dailyWorkRecords = dailyWorkRecords.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        date: data.date,
        projectId: data.projectId,
        contractorId: data.contractorId ?? item.contractorId,
        equipmentId: data.equipmentId || undefined,
        temporaryEquipmentName: data.temporaryEquipmentName || undefined,
        hourRate: data.hourRate,
        workingHours: data.workingHours,
        fuelConsumption: data.fuelConsumption,
        taskId: data.taskId,
        cost: data.cost,
        deduction: data.deduction,
        deductionReason: data.deductionReason || undefined,
        notes: data.notes || undefined,
      };
    });

    storage.set(STORAGE_KEY, dailyWorkRecords);
    return dailyWorkRecords.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    dailyWorkRecords = dailyWorkRecords.filter((item) => item.id !== id);
    storage.set(STORAGE_KEY, dailyWorkRecords);
  },
};

