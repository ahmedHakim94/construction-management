import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import type { SelectOption } from "@/components/ui/AppSelect";
import { contractorSchema } from "../schemas/contractor.schema";
import type { Contractor, ContractorFormValues } from "../types";
import { useGetAllEquipmentTypeQuery } from "@/features/settings/equipment-type/services/equipmentType.api";
import { useGetContractorByIdQuery } from "../services/contractors.api";

interface UseContractorFormProps {
  open: boolean;
  mode: "create" | "edit";
  contractor?: Contractor;
  onClose: () => void;
  onSubmit: (values: ContractorFormValues) => Promise<void>;
}

const DEFAULT_VALUES: ContractorFormValues = {
  name: "",
  phone: "",
  notes: "",
  status: "ACTIVE",
  equipment: [],
};

export function useContractorForm({
  open,
  mode,
  contractor,
  onClose,
  onSubmit,
}: UseContractorFormProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  const isArabic = i18n.language === "ar";

  const methods = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, reset } = methods;

  const { data: equipmentTypes = [] } = useGetAllEquipmentTypeQuery();

  const { data: contractorDetails } = useGetContractorByIdQuery(
    contractor?.id ?? 0,
    {
      skip: !open || mode !== "edit" || !contractor?.id,
    },
  );

  const equipmentTypeOptions = useMemo<readonly SelectOption[]>(
    () =>
      equipmentTypes.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [equipmentTypes],
  );

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      reset(DEFAULT_VALUES);
      return;
    }

    if (!contractorDetails) return;

    reset({
      name: contractorDetails.name,
      phone: contractorDetails.phone,
      notes: contractorDetails.notes ?? "",
      status: contractorDetails.status,

      equipment: contractorDetails.equipment.map((item) => ({
        id: item.id,
        equipmentTypeId: item.equipmentTypeId,
        model: item.model ?? "",
        plateNumber: item.plateNumber ?? "",
        hourlyPrice: Number(item.hourlyPrice),
        notes: item.notes ?? "",
      })),
    });
  }, [open, mode, contractorDetails, reset]);
  const submit = async (values: ContractorFormValues) => {
    setLoading(true);

    try {
      await onSubmit(values);
      reset(DEFAULT_VALUES);
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
