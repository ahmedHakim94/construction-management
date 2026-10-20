import { useEffect, useState } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import {
  AppButton,
  AppDialog,
  AppInput,
  AppSelect,
  AppTextarea,
  type SelectOption,
} from "@/components/ui";

import {
  equipmentSchema,
  updateEquipmentSchema,
} from "../schemas/equipment.schema";
import type {
  Equipment,
  EquipmentFormValues,
  EquipmentUpdateValues,
} from "../types";
import { useGetAllContractorsQuery } from "@/features/contractors/services/contractors.api";
import { useGetAllEquipmentTypeQuery } from "@/features/settings/equipment-type/services/equipmentType.api";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import {
  useGetAvailableEquipmentsQuery,
  useLinkEquipmentToProjectMutation,
} from "../services/equipment.api";
import { useAppSelector } from "@/app/store/hooks";

interface EquipmentDialogProps {
  open: boolean;
  mode: "create" | "edit";
  equipment?: Equipment;
  onClose: () => void;
  onSubmit: (
    values: EquipmentFormValues | EquipmentUpdateValues,
  ) => Promise<void>;
}

type CreateMode = "new" | "existing";

export function EquipmentDialog({
  open,
  mode,
  equipment,
  onClose,
  onSubmit,
}: EquipmentDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [loading, setLoading] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>("new");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(0);
  const [equipmentError, setEquipmentError] = useState("");

  const role = useAppSelector((state) => state.auth.user?.role);
  const isSuperAdmin = role === "super_admin";
  const isCreate = mode === "create";
  const isSuperAdminCreate = isSuperAdmin && isCreate;
  const isLinkMode = isCreate && createMode === "existing";

  const { control, handleSubmit, reset, setValue, setError, clearErrors } =
    useForm<EquipmentFormValues>({
      resolver: zodResolver(
        isCreate ? equipmentSchema : updateEquipmentSchema,
      ) as unknown as Resolver<EquipmentFormValues>,
      defaultValues: {
        project_id: undefined,
        contractorId: 0,
        equipmentTypeId: 0,
        model: "",
        plateNumber: "",
        hourlyPrice: 0,
        notes: "",
      },
    });

  const selectedProjectId = useWatch({
    control,
    name: "project_id",
  });

  const selectedContractorId = useWatch({
    control,
    name: "contractorId",
  });

  const { data: projects = [] } = useGetAllProjectsQuery(undefined, {
    skip: !open || !isSuperAdminCreate,
  });

  const { data: contractors = [] } = useGetAllContractorsQuery(
    isSuperAdminCreate ? selectedProjectId : undefined,
    {
      skip: !open || (isSuperAdminCreate && !selectedProjectId),
    },
  );

  const { data: equipmentTypes = [] } = useGetAllEquipmentTypeQuery(undefined, {
    skip: !open || isLinkMode,
  });

  const { data: availableEquipments = [], isFetching: loadingEquipments } =
    useGetAvailableEquipmentsQuery(
      {
        contractorId: selectedContractorId,
        ...(isSuperAdminCreate && selectedProjectId
          ? { project_id: selectedProjectId }
          : {}),
      },
      {
        skip:
          !open ||
          !isLinkMode ||
          !selectedContractorId ||
          (isSuperAdminCreate && !selectedProjectId),
      },
    );

  const [linkEquipment] = useLinkEquipmentToProjectMutation();

  const projectOptions: SelectOption[] = projects.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  const contractorOptions: SelectOption[] = contractors.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  const equipmentTypeOptions: SelectOption[] = equipmentTypes.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  const availableEquipmentOptions: SelectOption[] = availableEquipments.map(
    (item) => ({
      value: String(item.id),
      label:
        [item.equipmentTypeName, item.model, item.plateNumber]
          .filter(Boolean)
          .join(" - ") || `#${item.id}`,
    }),
  );

  useEffect(() => {
    if (!open) return;

    reset({
      project_id: undefined,
      contractorId: equipment?.contractorId ?? 0,
      equipmentTypeId: equipment?.equipmentTypeId ?? 0,
      model: equipment?.model ?? "",
      plateNumber: equipment?.plateNumber ?? "",
      hourlyPrice: Number(equipment?.hourlyPrice) || 0,
      notes: equipment?.notes ?? "",
    });

    setCreateMode("new");
    setSelectedEquipmentId(0);
    setEquipmentError("");
  }, [equipment, open, reset]);

  const handleCreateModeChange = (value: CreateMode) => {
    setCreateMode(value);
    setSelectedEquipmentId(0);
    setEquipmentError("");
    clearErrors();
  };

  const handleProjectChange = (value: string) => {
    setValue("project_id", value ? Number(value) : undefined);
    setValue("contractorId", 0);
    setSelectedEquipmentId(0);
    setEquipmentError("");
    clearErrors("project_id");
  };

  const handleContractorChange = (value: string) => {
    setValue("contractorId", value ? Number(value) : 0);
    setSelectedEquipmentId(0);
    setEquipmentError("");
    clearErrors("contractorId");
  };

  const submit = async (values: EquipmentFormValues) => {
    if (isSuperAdminCreate && !values.project_id) {
      setError("project_id", {
        type: "manual",
        message: t("required"),
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === "edit") {
        const updateValues = updateEquipmentSchema.parse(values);
        await onSubmit(updateValues);
      } else {
        await onSubmit(values);
      }

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitLink = async () => {
    if (isSuperAdminCreate && !selectedProjectId) {
      setError("project_id", {
        type: "manual",
        message: t("required"),
      });
      return;
    }

    if (!selectedContractorId) {
      setError("contractorId", {
        type: "manual",
        message: t("required"),
      });
      return;
    }

    if (!selectedEquipmentId) {
      setEquipmentError(t("required"));
      return;
    }

    setLoading(true);

    try {
      await linkEquipment({
        equipmentId: selectedEquipmentId,
        ...(isSuperAdminCreate ? { project_id: selectedProjectId } : {}),
      }).unwrap();

      onClose();
    } catch (error) {
      console.error(error);
      setEquipmentError(
        t("failedToLinkEquipment", {
          defaultValue: "Failed to link equipment",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const selectPlaceholder = t("selectPlaceholder");

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isCreate ? t("addEquipment") : t("editEquipment")}
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          onSubmit={
            isLinkMode
              ? (event) => {
                  event.preventDefault();
                  void submitLink();
                }
              : handleSubmit(submit)
          }
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 1,
            direction: isArabic ? "rtl" : "ltr",
          }}
        >
          {isCreate && (
            <RadioGroup
              row
              value={createMode}
              onChange={(event) =>
                handleCreateModeChange(event.target.value as CreateMode)
              }
              sx={{
                flexDirection: isArabic ? "row-reverse" : "row",
                justifyContent: "flex-start",
                marginInlineEnd:"15px"
              }}
            >
              <FormControlLabel
                value="new"
                control={<Radio />}
                label={t("createNewEquipment", {
                  defaultValue: "إنشاء معدة جديدة",
                })}
              />
              <FormControlLabel
                value="existing"
                control={<Radio />}
                label={t("linkExistingEquipment", {
                  defaultValue: "ربط معدة موجودة",
                })}
              />
            </RadioGroup>
          )}

          {isSuperAdminCreate && (
            <Controller
              name="project_id"
              control={control}
              render={({ field, fieldState }) => (
                <AppSelect
                  label={t("project")}
                  required
                  options={projectOptions}
                  value={field.value ? String(field.value) : ""}
                  onChange={handleProjectChange}
                  placeholder={selectPlaceholder}
                  error={fieldState.error?.message}
                />
              )}
            />
          )}

          {isCreate && (
            <Controller
              name="contractorId"
              control={control}
              render={({ field, fieldState }) => (
                <AppSelect
                  label={t("contractor")}
                  required
                  options={contractorOptions}
                  value={field.value ? String(field.value) : ""}
                  onChange={handleContractorChange}
                  placeholder={
                    isSuperAdminCreate && !selectedProjectId
                      ? t("selectProjectFirst", {
                          defaultValue: "اختار المشروع الأول",
                        })
                      : selectPlaceholder
                  }
                  error={fieldState.error?.message}
                />
              )}
            />
          )}

          {isLinkMode ? (
            <AppSelect
              label={t("equipment")}
              required
              options={availableEquipmentOptions}
              value={selectedEquipmentId ? String(selectedEquipmentId) : ""}
              onChange={(value) => {
                setSelectedEquipmentId(value ? Number(value) : 0);
                setEquipmentError("");
              }}
              placeholder={loadingEquipments ? t("loading") : selectPlaceholder}
              error={equipmentError}
            />
          ) : (
            <>
              {isCreate && (
                <Controller
                  name="equipmentTypeId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <AppSelect
                      label={t("equipmentType")}
                      required
                      options={equipmentTypeOptions}
                      value={field.value ? String(field.value) : ""}
                      onChange={(value) =>
                        field.onChange(value ? Number(value) : 0)
                      }
                      placeholder={selectPlaceholder}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              )}

              <Controller
                name="hourlyPrice"
                control={control}
                render={({ field, fieldState }) => (
                  <AppInput
                    type="number"
                    label={t("hourRate")}
                    required
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    inputProps={{ min: 0 }}
                  />
                )}
              />

              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <AppInput label={t("model")} {...field} />
                )}
              />

              <Controller
                name="plateNumber"
                control={control}
                render={({ field }) => (
                  <AppInput label={t("plateNumber")} {...field} />
                )}
              />

              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <AppTextarea label={t("notes")} {...field} />
                )}
              />
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <AppButton
          loading={loading}
          onClick={isLinkMode ? submitLink : handleSubmit(submit)}
          variant="contained"
        >
          {isLinkMode
            ? t("linkEquipment", {
                defaultValue: "ربط المعدة",
              })
            : isCreate
              ? t("create")
              : t("save")}
        </AppButton>

        <AppButton variant="outlined" color="inherit" onClick={onClose}>
          {t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
