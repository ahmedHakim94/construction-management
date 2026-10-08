import { useEffect } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog } from "@/components/ui";
import type { RecordPaymentFormValues } from "../types";

interface RecordPaymentDialogProps {
  open: boolean;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: RecordPaymentFormValues) => Promise<void>;
}

const today = () => {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export function RecordPaymentDialog({
  open,
  netAmount,
  paidAmount,
  remainingAmount,
  loading = false,
  onClose,
  onSubmit,
}: RecordPaymentDialogProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecordPaymentFormValues>({
    defaultValues: {
      amount: 0,
      paymentDate: today(),
      paymentMethod: "CASH",
      referenceNumber: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open)
      reset({
        amount: 0,
        paymentDate: today(),
        paymentMethod: "CASH",
        referenceNumber: "",
        notes: "",
      });
  }, [open, reset]);

  const method = watch("paymentMethod");
  const busy = loading || isSubmitting;

  return (
    <AppDialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t("recordPayment")}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
              mb: 3,
            }}
          >
            {[
              { label: t("netAmount"), value: netAmount },
              { label: t("paidAmount"), value: paidAmount },
              { label: t("remainingAmount"), value: remainingAmount },
            ].map(({ label, value }) => (
              <Box key={label}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography fontWeight={600}>
                  {Number(value).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Controller
              name="amount"
              control={control}
              rules={{
                required: t("required"),
                validate: (value) =>
                  (Number(value) > 0 && Number(value) <= remainingAmount) ||
                  `Amount must be between 0 and ${remainingAmount}`,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label={t("paymentAmount")}
                  inputProps={{ min: 0.01, max: remainingAmount, step: 0.01 }}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ""
                        ? 0
                        : Number(event.target.value),
                    )
                  }
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              )}
            />
            <Controller
              name="paymentDate"
              control={control}
              rules={{ required: t("required") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label={t("date")}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.paymentDate}
                  helperText={errors.paymentDate?.message}
                />
              )}
            />
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label={t("paymentMethod")}
                >
                  <MenuItem value="CASH">{t("cash")}</MenuItem>
                  <MenuItem value="TRANSFER">{t("transfer")}</MenuItem>
                </TextField>
              )}
            />
            {method === "TRANSFER" && (
              <Controller
                name="referenceNumber"
                control={control}
                rules={{
                  validate: (value) =>
                    method !== "TRANSFER" || !!value?.trim() || t("required"),
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    fullWidth
                    label={t("transferReferenceNumber")}
                    error={!!errors.referenceNumber}
                    helperText={errors.referenceNumber?.message}
                  />
                )}
              />
            )}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ""}
                  fullWidth
                  multiline
                  rows={3}
                  label={t("notes")}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <AppButton onClick={onClose} disabled={busy}>
            {t("close")}
          </AppButton>
          <AppButton
            type="submit"
            variant="contained"
            disabled={busy || remainingAmount <= 0}
          >
            {t("recordPayment")}
          </AppButton>
        </DialogActions>
      </Box>
    </AppDialog>
  );
}
