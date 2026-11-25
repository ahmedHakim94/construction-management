import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import type { SelectOption } from "@/components/ui/AppSelect";
import { useAppSelector } from "@/app/store/hooks";
import { useInitialEditLoading } from "@/hooks/useInitialEditLoading";
import { contractorSchema } from "../schemas/contractor.schema";
import type { Contractor, ContractorFormValues } from "../types";
import { useGetAllEquipmentTypeQuery } from "@/features/settings/equipment-type/services/equipmentType.api";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import {
  useGetContractorByIdQuery,
  useGetContractorProjectsQuery,
} from "../services/contractors.api";

interface UseContractorFormProps {
  open: boolean;
  mode: "create" | "edit";
  contractor?: Contractor;
  onClose: () => void;
  onSubmit: (values: ContractorFormValues) => Promise<void>;
}

const DEFAULT_VALUES: ContractorFormValues = {
  project_id: undefined,
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
  const role = useAppSelector((state) => state.auth.user?.role);
  const isSuperAdmin = role === "super_admin";

  const methods = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, reset, setError, setValue, getValues } = methods;

  const {
    data: projects,
    isFetching: projectsLoading,
    isError: projectsError,
  } = useGetAllProjectsQuery(undefined, {
    skip: !open || !isSuperAdmin,
  });

  const {
    data: equipmentTypes,
    isFetching: equipmentTypesLoading,
    isError: equipmentTypesError,
  } = useGetAllEquipmentTypeQuery(undefined, {
    skip: !open,
  });

  const {
    data: contractorDetails,
    isFetching: contractorDetailsLoading,
    isError: contractorDetailsError,
  } = useGetContractorByIdQuery(contractor?.id ?? 0, {
    skip: !open || mode !== "edit" || !contractor?.id,
  });

  const {
    data: contractorProjects,
    isFetching: contractorProjectsLoading,
    isError: contractorProjectsError,
  } = useGetContractorProjectsQuery(contractor?.id ?? 0, {
    skip: !open || mode !== "edit" || !contractor?.id || !isSuperAdmin,
  });

  const isInitialEditLoading = useInitialEditLoading({
    open,
    isEdit: mode === "edit",
    recordKey: contractor?.id,
    isFetching:
      contractorDetailsLoading ||
      equipmentTypesLoading ||
      (isSuperAdmin && (projectsLoading || contractorProjectsLoading)),
    isReady:
      Boolean(contractorDetails) &&
      Boolean(equipmentTypes) &&
      (!isSuperAdmin || (Boolean(projects) && Boolean(contractorProjects))),
    hasError:
      contractorDetailsError ||
      equipmentTypesError ||
      (isSuperAdmin && (projectsError || contractorProjectsError)),
  });

  const defaultProjectId = contractorProjects?.[0]?.id;

  const projectOptions = useMemo<readonly SelectOption[]>(
    () =>
      (projects ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [projects],
  );

  const equipmentTypeOptions = useMemo<readonly SelectOption[]>(
    () =>
      (equipmentTypes ?? []).map((item) => ({
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
      project_id: isSuperAdmin ? defaultProjectId : undefined,
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
  }, [open, mode, contractorDetails, isSuperAdmin, reset]);

  useEffect(() => {
    if (
      open &&
      mode === "edit" &&
      isSuperAdmin &&
      defaultProjectId &&
      !getValues("project_id")
    ) {
      setValue("project_id", defaultProjectId);
    }
  }, [open, mode, isSuperAdmin, defaultProjectId, getValues, setValue]);

  const submit = async (values: ContractorFormValues) => {
    if (isSuperAdmin && !values.project_id) {
      setError("project_id", {
        type: "manual",
        message: t("selectProject"),
      });
      return;
    }

    setLoading(true);

    try {
      const payload: ContractorFormValues = isSuperAdmin
        ? values
        : { ...values, project_id: undefined };
      await onSubmit(payload);
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
    isInitialEditLoading,
    projectsLoading,
    equipmentTypesLoading,
    isSuperAdmin,
    projectOptions,
    equipmentTypeOptions,
    submit,
    handleSubmit,
    isArabic,
    t,
  };
}
