import { equipmentMockData } from "../mock/equipment";
import type { Equipment, EquipmentFormValues } from "../types";
import {equipmentTypeService} from '@/features/settings/equipment-type/services/equipmentType.service'
let equipment: Equipment[] = [...equipmentMockData];


async function getEquipmentName(equipmentTypeId: string): Promise<string> {
  const equipmentType = await equipmentTypeService.getById(equipmentTypeId);
  return equipmentType?.name || "";
}


function generateEquipmentNumber() {
  const existingNumbers = new Set(
    equipment.map((item) => item.equipmentNumber).filter(Boolean),
  );

  let nextNumber = equipment.length + 1;
  let equipmentNumber = `EQ-${String(nextNumber).padStart(3, "0")}`;

  while (existingNumbers.has(equipmentNumber)) {
    nextNumber += 1;
    equipmentNumber = `EQ-${String(nextNumber).padStart(3, "0")}`;
  }

  return equipmentNumber;
}

export const equipmentService = {
  async getAll(): Promise<Equipment[]> {
    return [...equipment];
  },

  async getById(id: string): Promise<Equipment | undefined> {
    return equipment.find((item) => item.id === id);
  },
  

  async create(data: EquipmentFormValues): Promise<Equipment> {
    const nextEquipment: Equipment = {
      id: `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      contractorId: data.contractorId,
      equipmentTypeId: data.equipmentTypeId,
      model: data.model || undefined,
      plateNumber: data.plateNumber || undefined,
      equipmentNumber: generateEquipmentNumber(),
      hourRate: data.hourRate,
      notes: data.notes || undefined,
      createdAt: new Date().toISOString().split("T")[0],
      name: await getEquipmentName(data.equipmentTypeId),
    };

    equipment = [nextEquipment, ...equipment];
    return nextEquipment;
  },

  async update(
    id: string,
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
        model: data.model || undefined,
        plateNumber: data.plateNumber || undefined,
        // equipmentNumber: data.equipmentNumber || undefined,
        hourRate: data.hourRate,
        notes: data.notes || undefined,
         name: equipmentName
      };
    });

    return equipment.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    equipment = equipment.filter((item) => item.id !== id);
  },
};
