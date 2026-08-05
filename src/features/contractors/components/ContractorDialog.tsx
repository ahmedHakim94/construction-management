import { useEffect, useMemo, useState } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from "@mui/material";
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
import { contractorSchema } from "../schemas/contractor.schema";
import type { Contractor, ContractorFormValues } from "../types";
import "./ContractorDialog.scss";

interface ContractorDialogProps {
  open: boolean;
  mode: "create" | "edit";
  contractor?: Contractor;
  onClose: () => void;
  onSubmit: (values: ContractorFormValues) => void;
}

export function ContractorDialog({
  open,
  mode,
  contractor,
  onClose,
  onSubmit,
}: ContractorDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [loading, setLoading] = useState(false)

  // const statusOptions = useMemo(
  //   () =>
  //     [
  //       { value: "ACTIVE", label: t("active") },
  //       { value: "INACTIVE", label: t("inactive") },
  //     ] as const,
  //   [t],
  // );

  const statusOptions = [
    {
      value: "ACTIVE",
      label: t("active"),
    },
    {
      value: "INACTIVE",
      label: t("inactive"),
    },
  ];

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: "",
      phone: "",
      // address: "",
      nationalId: "",
      notes: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    reset({
      name: contractor?.name ?? "",
      phone: contractor?.phone ?? "",
      // address: contractor?.address ?? "",
      nationalId: contractor?.nationalId ?? "",
      notes: contractor?.notes ?? "",
      status: contractor?.status ?? "ACTIVE",
    });
  }, [contractor, open, reset]);

  const submit = (values: ContractorFormValues) => {
    setLoading(true)
    setTimeout(() => {

      onSubmit(values);
      reset({
        name: "",
        phone: "",
        // address: "",
        nationalId: "",
        notes: "",
        status: "ACTIVE",
      });
      onClose();
    }, 1000);
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="contractor_Dialog"
    >
      <DialogTitle>
        {mode === "create" ? t("addContractor") : t("editContractor")}
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
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("name")}
                required
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("phone")}
                required
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          {/* <Controller
            name="address"
            control={control}
            render={({ field }) => <AppInput label={t("address")} {...field} />}
          /> */}
          <Controller
            name="nationalId"
            control={control}
            render={({ field }) => (
              <AppInput label={t("nationalId")} {...field} />
            )}
          />
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <AppTextarea label={t("notes")} {...field} />
            )}
          />
          {/* <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <AppInput select label={t("status")} {...field}>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </AppInput>
            )}
          /> */}
          <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("status")}
                required
                options={statusOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="react_select_status"

              />
            )}
          />
        </Box>
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
