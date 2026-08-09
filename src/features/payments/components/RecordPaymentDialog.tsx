import { useEffect } from "react";
import { DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
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
  onSubmit: (values: RecordPaymentFormValues) => void;
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
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema) as any,
    defaultValues: {
      amount: 0,
    },
  });

  useEffect(() => {
    reset({ amount: 0 });
  }, [open, reset]);

  const handleFormSubmit = (values: any) => {
    const parsedValues = values as RecordPaymentFormValues;

    if (parsedValues.amount <= 0) {
      setError("amount", { type: "manual", message: t("paymentAmountInvalid") });
      return;
    }

    if (parsedValues.amount > remainingAmount) {
      setError("amount", { type: "manual", message: t("paymentAmountExceedsRemaining") });
      return;
    }

    onSubmit(parsedValues);
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("recordPayment")}</DialogTitle>
      <DialogContent>
        <Typography>{t("netDue")}: {netAmount}</Typography>
        <Typography>{t("paidAmount")}: {paidAmount}</Typography>
        <Typography>{t("remainingAmount")}: {remainingAmount}</Typography>

        <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
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
      </DialogContent>
      <DialogActions>
        <AppButton onClick={onClose}>{t("cancel")}</AppButton>
        <AppButton loading={loading} onClick={() => handleSubmit((values) => handleFormSubmit(values as RecordPaymentFormValues))()}>
          {t("recordPayment")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
