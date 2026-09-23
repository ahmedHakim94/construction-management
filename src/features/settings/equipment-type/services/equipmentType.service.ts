import { storage } from "@/core/storage/localStorage";
import { equipmentTypesMockData } from "../mock/equipmentTypes";
import type { EquipmentType, EquipmentTypeFormValues } from "../types";

// let equipmentTypes: EquipmentType[] = [...equipmentTypesMockData];

const STORAGE_KEY = "construction_equipment_types";

let equipmentTypes = storage.get<EquipmentType[]>(
  STORAGE_KEY,
  equipmentTypesMockData,
);

export const equipmentTypeService = {
  async getAll(): Promise<EquipmentType[]> {
    return [...equipmentTypes];
  },

  async getById(id: string): Promise<EquipmentType | undefined> {
    return equipmentTypes.find((item) => item.id === id);
  },

  async create(data: EquipmentTypeFormValues): Promise<EquipmentType> {
    const nextEquipmentType: EquipmentType = {
      id: `et-${Date.now()}`,
      name: data.name,
      createdAt: new Date().toISOString().split("T")[0],
    };

    equipmentTypes = [nextEquipmentType, ...equipmentTypes];
    storage.set(STORAGE_KEY, equipmentTypes);
    return nextEquipmentType;
  },

  async update(
    id: string,
    data: EquipmentTypeFormValues,
  ): Promise<EquipmentType | undefined> {
    equipmentTypes = equipmentTypes.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        name: data.name,
      };
    });
    storage.set(STORAGE_KEY, equipmentTypes);
    return equipmentTypes.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    equipmentTypes = equipmentTypes.filter((item) => item.id !== id);
    storage.set(STORAGE_KEY, equipmentTypes);
  },
};
