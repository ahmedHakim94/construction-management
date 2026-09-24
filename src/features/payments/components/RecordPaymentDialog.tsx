import { useEffect } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppDialog, AppInput } from "@/components/ui";
import { recordPaymentSchema } from "../schemas/payment.schema";
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

export function RecordPaymentDialog({
  open,
  netAmount,
  paidAmount,
  remainingAmount,
  loading = false,
  onClose,
  onSubmit,
}: RecordPaymentDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      amount: 0,
    },
  });

  useEffect(() => {
    reset({ amount: 0 });
  }, [open, reset]);

  const handleFormSubmit = async (values: RecordPaymentFormValues) => {
    if (values.amount <= 0) {
      setError("amount", {
        type: "manual",
        message: t("paymentAmountInvalid"),
      });
      return;
    }

    if (values.amount > remainingAmount) {
      setError("amount", {
        type: "manual",
        message: t("paymentAmountExceedsRemaining"),
      });
      return;
    }

    await onSubmit(values);
  };

  const summaryItems = [
    { label: t("netDue"), value: netAmount, color: "text.primary" },
    { label: t("paidAmount"), value: paidAmount, color: "success.main" },
    { label: t("remainingAmount"), value: remainingAmount, color: "warning.main" },
  ];

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("recordPayment")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }} dir={isArabic ? "rtl" : "ltr"}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1.5,
            }}
          >
            {summaryItems.map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500, display: "block", mb: 0.5 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: item.color,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.value.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <AppInput
                  label={t("paymentAmount")}
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              )}
            />
          </form>
        </Box>
      </DialogContent>
      <DialogActions>
        <AppButton
          loading={loading}
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
        >
          {t("recordPayment")}
        </AppButton>
        <AppButton variant="outlined" color="inherit" onClick={onClose}>
          {t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
