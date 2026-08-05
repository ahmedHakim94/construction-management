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
  onSubmit: (values: EquipmentTypeFormValues) => void;
}

export function EquipmentTypeDialog({
  open,
  mode,
  equipmentType,
  onClose,
  onSubmit,
}: EquipmentTypeDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<EquipmentTypeFormValues>({
    resolver: zodResolver(equipmentTypeSchema),
    defaultValues: {
    //   code: "",
      nameAr: "",
      nameEn: "",
    },
  });

  useEffect(() => {
    reset({
    //   code: equipmentType?.code ?? "",
      nameAr: equipmentType?.nameAr ?? "",
      nameEn: equipmentType?.nameEn ?? "",
    });
  }, [equipmentType, open, reset]);

  const submit = (values: EquipmentTypeFormValues) => {
    setLoading(true);
    setTimeout(() => {
      onSubmit(values);
      setLoading(false);
    }, 500);
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "create" ? t("addEquipmentType") : t("editEquipmentType")}
      </DialogTitle>

      <DialogContent>
        <form
          onSubmit={handleSubmit(submit)}
          style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8, direction: isArabic ? "rtl" : "ltr" }}
        >
          {/* <Controller
            name="code"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("code")}
                required
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          /> */}

          <Controller
            name="nameAr"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("arabicName")}
                required
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="nameEn"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("englishName")}
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
        <AppButton variant="outlined" color="error" onClick={onClose}>
          {t("cancel")}
        </AppButton>

        <AppButton loading={loading} onClick={handleSubmit(submit)}>
          {mode === "create" ? t("create") : t("save")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
