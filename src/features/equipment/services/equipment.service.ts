import { equipmentTypeService } from "@/features/settings/equipment-type/services/equipmentType.service";
import { equipmentMockData } from "../mock/equipment";
import type { Equipment, EquipmentFormValues } from "../types";

let equipment: Equipment[] = [...equipmentMockData];

function generateEquipmentNumber(prefix: string) {
  const count = equipment.filter((x) =>
    x.equipmentNumber?.startsWith(prefix),
  ).length;

  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

export const equipmentService = {
  async getAll(): Promise<Equipment[]> {
    return [...equipment];
  },

  async getById(id: string): Promise<Equipment | undefined> {
    return equipment.find((item) => item.id === id);
  },

  async create(data: EquipmentFormValues): Promise<Equipment> {
    const equipmentType = await equipmentTypeService.getById(
      data.equipmentTypeId,
    );

    const nextEquipment: Equipment = {
      id: `e-${Date.now()}`,
      contractorId: data.contractorId,
      equipmentTypeId: data.equipmentTypeId,
      model: data.model || undefined,
      plateNumber: data.plateNumber || undefined,
      equipmentNumber:
        data.equipmentNumber || generateEquipmentNumber(equipmentType?.prefix ?? "EQ"),
      hourRate: data.hourRate,
      notes: data.notes || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };

    equipment = [nextEquipment, ...equipment];
    return nextEquipment;
  },

  async update(
    id: string,
    data: EquipmentFormValues,
  ): Promise<Equipment | undefined> {
    equipment = equipment.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        contractorId: data.contractorId,
        equipmentTypeId: data.equipmentTypeId,
        model: data.model || undefined,
        plateNumber: data.plateNumber || undefined,
        // equipmentNumber: data.equipmentNumber || undefined,
        hourRate: data.hourRate,
        notes: data.notes || undefined,
      };
    });

    return equipment.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    equipment = equipment.filter((item) => item.id !== id);
  },
};

export const getAll = equipmentService.getAll;
export const getById = equipmentService.getById;
export const create = equipmentService.create;
export const update = equipmentService.update;
export const deleteEquipment = equipmentService.delete;
