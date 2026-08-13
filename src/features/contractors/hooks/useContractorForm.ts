import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import type { SelectOption } from "@/components/ui/AppSelect";
import { contractorSchema } from "../schemas/contractor.schema";
import type { Contractor, ContractorFormValues } from "../types";
import { equipmentTypeService } from "@/features/settings/equipment-type/services/equipmentType.service";
import { equipmentService } from "@/features/equipment/services/equipment.service";

interface UseContractorFormProps {
  open: boolean;
  mode: "create" | "edit";
  contractor?: Contractor;
  onClose: () => void;
  onSubmit: (values: ContractorFormValues) => Promise<void>;
}

export function useContractorForm({
  open,
  mode,
  contractor,
  onClose,
  onSubmit,
}: UseContractorFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [loading, setLoading] = useState(false);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<readonly SelectOption[]>([]);

  const methods = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      nationalId: "",
      notes: "",
      status: "ACTIVE",
      equipment: [],
    },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    async function loadOptions() {
      try {
        const types = await equipmentTypeService.getAll();
        setEquipmentTypeOptions(
          types.map((item) => ({
            value: item.id,
            label: item.name,
          })),
        );
      } catch (error) {
        console.error("Failed to load equipment types:", error);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function loadContractorEquipment() {
      if (open) {
        let contractorEq: {
          id?: string;
          equipmentTypeId: string;
          model?: string;
          plateNumber?: string;
          hourRate: number;
          notes?: string;
        }[] = [];
        if (mode === "edit" && contractor) {
          try {
            const allEq = await equipmentService.getAll();
            contractorEq = allEq
              .filter((eq) => eq.contractorId === contractor.id)
              .map((eq) => ({
                id: eq.id,
                equipmentTypeId: eq.equipmentTypeId,
                model: eq.model || "",
                plateNumber: eq.plateNumber || "",
                hourRate: eq.hourRate,
                notes: eq.notes || "",
              }));
          } catch (error) {
            console.error("Failed to load contractor equipment:", error);
          }
        }

        reset({
          name: contractor?.name ?? "",
          phone: contractor?.phone ?? "",
          address: contractor?.address ?? "",
          nationalId: contractor?.nationalId ?? "",
          notes: contractor?.notes ?? "",
          status: contractor?.status ?? "ACTIVE",
          equipment: contractorEq,
        });
      }
    }

    loadContractorEquipment();
  }, [contractor, open, reset, mode]);

  const submit = async (values: ContractorFormValues) => {
    setLoading(true);
    try {
      await onSubmit(values);
      reset({
        name: "",
        phone: "",
        address: "",
        nationalId: "",
        notes: "",
        status: "ACTIVE",
        equipment: [],
      });
      onClose();
    } catch (error) {
      console.error("Failed to submit contractor form:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    methods,
    loading,
    equipmentTypeOptions,
    submit,
    handleSubmit,
    isArabic,
    t,
  };
}
