import type { DailyWork } from "../types";

export const dailyWorkMockData: DailyWork[] = [
  {
    id: "dw-1002",
    date: "2026-07-21",
    projectId: "project-2",
    contractorId: "c-system",
    equipmentId: undefined,
    temporaryEquipmentName: "خارجى",
    hourRate: 220,
    workingHours: 5,
    fuelConsumption: 6,
    taskId: "task-3",
    cost: 1100,
    deduction: 100,
    deductionReason: "Weather delay",
    notes: "Excavation with temporary equipment",
    createdAt: "2026-07-21",
  },
];
