import { Box } from "@mui/material";
import dayjs from "dayjs";
import type { FormEventHandler } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/ui/AppButton";
import { AppFilters } from "@/components/ui/AppFilters";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import { AppSelect } from "@/components/ui/AppSelect";
import type { Control } from "react-hook-form";
import type { PaymentFormValues } from "../types";
import type { SelectOption } from "@/components/ui/AppSelect";

interface PaymentFiltersProps {
  control: Control<PaymentFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  contractorOptions: readonly SelectOption[];
  loading: boolean;
}

export function PaymentFilters({ control, onSubmit, contractorOptions, loading }: PaymentFiltersProps) {
  const { t } = useTranslation();

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
      <AppFilters>
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
              placeholder={t("selectContractor")}
              error={fieldState.error?.message}
              width="30%"
            />
          )}
        />

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Controller
            name="startDate"
            control={control}
            render={({ field, fieldState }) => (
              <AppDatePicker
                label={t("fromDate")}
                value={field.value ? dayjs(field.value) : null}
                onChange={(value) => field.onChange(value ? value.format("YYYY-MM-DD") : "")}
                format="DD/MM/YYYY"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field, fieldState }) => (
              <AppDatePicker
                label={t("toDate")}
                value={field.value ? dayjs(field.value) : null}
                onChange={(value) => field.onChange(value ? value.format("YYYY-MM-DD") : "")}
                format="DD/MM/YYYY"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>

        <AppButton type="submit" loading={loading}>
          {t("settlePayment")}
        </AppButton>
      </AppFilters>
    </Box>
  );
}
