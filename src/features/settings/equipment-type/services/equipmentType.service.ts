import { equipmentTypesMockData } from "../mock/equipmentTypes";
import type { EquipmentType, EquipmentTypeFormValues } from "../types";

let equipmentTypes: EquipmentType[] = [...equipmentTypesMockData];

export const equipmentTypeService = {
  async getAll(): Promise<EquipmentType[]> {
    return [...equipmentTypes];
  },

  async create(data: EquipmentTypeFormValues): Promise<EquipmentType> {
    const nextEquipmentType: EquipmentType = {
      id: `et-${Date.now()}`,
    //   code: data.code,
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      createdAt: new Date().toISOString().split("T")[0],
    };

    equipmentTypes = [nextEquipmentType, ...equipmentTypes];
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
        // code: data.code,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
      };
    });

    return equipmentTypes.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    equipmentTypes = equipmentTypes.filter((item) => item.id !== id);
  },
};

export const getAll = equipmentTypeService.getAll;
export const create = equipmentTypeService.create;
export const update = equipmentTypeService.update;
export const deleteEquipmentType = equipmentTypeService.delete;
