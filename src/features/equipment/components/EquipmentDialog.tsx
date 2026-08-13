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
} from "@/components/ui";
import { equipmentSchema } from "../schemas/equipment.schema";
import type { Equipment, EquipmentFormValues } from "../types";
import { contractorService } from "@/features/contractors/services/contractor.service";
import { equipmentTypeService } from "@/features/settings/equipment-type/services/equipmentType.service";

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
  const [contractorOptions, setContractorOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      contractorId: "",
      equipmentTypeId: "",
      model: "",
      plateNumber: "",
      hourRate: 0,
      notes: "",
    },
  });

  useEffect(() => {
    async function loadOptions() {
      const contractors = await contractorService.getAll();
      const equipmentTypes = await equipmentTypeService.getAll();

      setContractorOptions(
        contractors.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );

      setEquipmentTypeOptions(
        equipmentTypes.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    }

    loadOptions();
  }, []);

  useEffect(() => {
    reset({
      contractorId: equipment?.contractorId ?? "",
      equipmentTypeId: equipment?.equipmentTypeId ?? "",
      model: equipment?.model ?? "",
      plateNumber: equipment?.plateNumber ?? "",
      hourRate: equipment?.hourRate ?? 0,
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
                value={field.value}
                onChange={field.onChange}
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
                value={field.value}
                onChange={field.onChange}
                placeholder={selectPlaceholder}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="hourRate"
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
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton
          loading={loading}
          onClick={handleSubmit(submit)}
          variant="contained"
        >
          {mode === "create" ? t("create") : t("save")}
        </AppButton>
        <AppButton variant="outlined" color="error" onClick={onClose}>
          {t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
