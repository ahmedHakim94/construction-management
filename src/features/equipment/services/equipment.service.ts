import { storage } from "@/core/storage/localStorage";
import type { Equipment, EquipmentFormValues } from "../types";
import { equipmentTypeService } from "@/features/settings/equipment-type/services/equipmentType.service";

const STORAGE_KEY = "construction_equipment";

let equipment: Equipment[] = storage.get<Equipment[]>(STORAGE_KEY, []);

async function getEquipmentName(equipmentTypeId: number): Promise<string> {
  const equipmentType = await equipmentTypeService.getById(String(equipmentTypeId));
  return equipmentType?.name || "";
}

export const equipmentService = {
  async getAll(): Promise<Equipment[]> {
    return [...equipment];
  },

  async getById(id: number): Promise<Equipment | undefined> {
    return equipment.find((item) => item.id === id);
  },

  async create(data: EquipmentFormValues): Promise<Equipment> {
    const nextEquipment: Equipment = {
      id: Date.now(),
      contractorId: data.contractorId,
      contractorName: "",
      equipmentTypeId: data.equipmentTypeId,
      equipmentTypeName: await getEquipmentName(data.equipmentTypeId),
      model: data.model || undefined,
      plateNumber: data.plateNumber || undefined,
      hourlyPrice: data.hourlyPrice,
      notes: data.notes || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };

    equipment = [nextEquipment, ...equipment];
    storage.set(STORAGE_KEY, equipment);
    return nextEquipment;
  },

  async update(
    id: number,
    data: EquipmentFormValues,
  ): Promise<Equipment | undefined> {
    const equipmentName = await getEquipmentName(data.equipmentTypeId);

    equipment = equipment.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        contractorId: data.contractorId,
        equipmentTypeId: data.equipmentTypeId,
        equipmentTypeName: equipmentName,
        model: data.model || undefined,
        plateNumber: data.plateNumber || undefined,
        hourlyPrice: data.hourlyPrice,
        notes: data.notes || undefined,
      };
    });

    storage.set(STORAGE_KEY, equipment);
    return equipment.find((item) => item.id === id);
  },

  async delete(id: number): Promise<void> {
    equipment = equipment.filter((item) => item.id !== id);
    storage.set(STORAGE_KEY, equipment);
  },
};

