import { dailyWorkMockData } from "../mock/dailyWork";
import type { DailyWork, DailyWorkFormValues } from "../types";

let dailyWorkRecords: DailyWork[] = [...dailyWorkMockData];


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
      contractorId: data.contractorId,
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
    return nextRecord;
  },

  async update(id: string, data: DailyWorkFormValues): Promise<DailyWork | undefined> {
    dailyWorkRecords = dailyWorkRecords.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        date: data.date,
        projectId: data.projectId,
        contractorId: data.contractorId,
        equipmentId: data.equipmentId || undefined,
        temporaryEquipmentName: data.temporaryEquipmentName || undefined,
        hourRate: data.hourRate,
        workingHours: data.workingHours,
        fuelConsumption: data.fuelConsumption,
        taskId: data.taskId,
        cost: data.cost,
        notes: data.notes || undefined,
      };
    });

    return dailyWorkRecords.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    dailyWorkRecords = dailyWorkRecords.filter((item) => item.id !== id);
  },
};

export const getAll = dailyWorkService.getAll;
export const getById = dailyWorkService.getById;
export const create = dailyWorkService.create;
export const update = dailyWorkService.update;
export const deleteDailyWork = dailyWorkService.delete;
