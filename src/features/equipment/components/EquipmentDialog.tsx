import { useEffect, useState } from "react";
import { Box, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
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
import { equipmentSchema } from "../schemas/equipment.schema";
import type { Equipment, EquipmentFormValues } from "../types";
import { useGetAllContractorsQuery } from "@/features/contractors/services/contractors.api";
import { useGetAllEquipmentTypeQuery } from "@/features/settings/equipment-type/services/equipmentType.api";

interface EquipmentDialogProps {
  open: boolean;
  mode: "create" | "edit";
  equipment?: Equipment;
  onClose: () => void;
  onSubmit: (values: EquipmentFormValues) => Promise<void>;
}

export function EquipmentDialog({
  open,
  mode,
  equipment,
  onClose,
  onSubmit,
}: EquipmentDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [contractorOptions, setContractorOptions] = useState<SelectOption[]>([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      contractorId: 0,
      equipmentTypeId: 0,
      model: "",
      plateNumber: "",
      hourlyPrice: 0,
      notes: "",
    },
  });

  const { data: contractors } = useGetAllContractorsQuery();
  const { data: equipment_type } = useGetAllEquipmentTypeQuery();

  useEffect(() => {
    if (contractors) {
      setContractorOptions(
        contractors.map((item) => ({
          value: String(item.id),
          label: item.name,
        })),
      );
    }
  }, [contractors]);

  useEffect(() => {
    if (equipment_type) {
      setEquipmentTypeOptions(
        equipment_type.map((item) => ({
          value: String(item.id),
          label: item.name,
        })),
      );
    }
  }, [equipment_type]);

  useEffect(() => {
    reset({
      contractorId: equipment?.contractorId ?? 0,
      equipmentTypeId: equipment?.equipmentTypeId ?? 0,
      model: equipment?.model ?? "",
      plateNumber: equipment?.plateNumber ?? "",
      hourlyPrice: Number(equipment?.hourlyPrice) || 0,
      notes: equipment?.notes ?? "",
    });
  }, [equipment, open, reset]);

  const submit = async (values: EquipmentFormValues) => {
    setLoading(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectPlaceholder = t("selectPlaceholder");

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "create" ? t("addEquipment") : t("editEquipment")}
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(submit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 1,
            direction: isArabic ? "rtl" : "ltr",
          }}
        >
          <Controller
            name="contractorId"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("contractor")}
                required
                options={contractorOptions}
                value={field.value ? String(field.value) : ""}
                onChange={(val) => field.onChange(val ? Number(val) : 0)}
                placeholder={selectPlaceholder}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="equipmentTypeId"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("equipmentType")}
                required
                options={equipmentTypeOptions}
                value={field.value ? String(field.value) : ""}
                onChange={(val) => field.onChange(val ? Number(val) : 0)}
                placeholder={selectPlaceholder}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="hourlyPrice"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                type="number"
                label={t("hourRate")}
                required
                value={field.value}
                onChange={(event) => field.onChange(Number(event.target.value))}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                inputProps={{ min: 0 }}
              />
            )}
          />

          <Controller
            name="model"
            control={control}
            render={({ field }) => <AppInput label={t("model")} {...field} />}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <AppButton
          loading={loading}
          onClick={handleSubmit(submit)}
          variant="contained"
        >
          {mode === "create" ? t("create") : t("save")}
        </AppButton>
        <AppButton variant="outlined" color="inherit" onClick={onClose}>
          {t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}

