import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog, AppInput } from "@/components/ui";
import { equipmentTypeSchema } from "../schemas/equipmentType.schema";
import type { EquipmentType, EquipmentTypeFormValues } from "../types";

interface EquipmentTypeDialogProps {
  open: boolean;
  mode: "create" | "edit";
  equipmentType?: EquipmentType;
  onClose: () => void;
  onSubmit: (values: EquipmentTypeFormValues) => Promise<void>;
}

export function EquipmentTypeDialog({
  open,
  mode,
  equipmentType,
  onClose,
  onSubmit,
}: EquipmentTypeDialogProps) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<EquipmentTypeFormValues>({
    resolver: zodResolver(equipmentTypeSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    reset({
      name: equipmentType?.name ?? "",
    });
  }, [equipmentType, open, reset]);

  const submit = async (values: EquipmentTypeFormValues) => {
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "create" ? t("addEquipmentType") : t("editEquipmentType")}
      </DialogTitle>

      <DialogContent>
        <form
          onSubmit={handleSubmit(submit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingTop: 8,
          }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("equipmentTypeName")}
                required
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton variant="contained" loading={loading} onClick={handleSubmit(submit)}>
          {mode === "create" ? t("create") : t("save")}
        </AppButton>
        <AppButton variant="outlined" color="error" onClick={onClose}>
          {t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
