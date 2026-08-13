import { Box } from "@mui/material";
import type { FormEventHandler } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AppFilters } from "@/components/ui/AppFilters";
import { AppSelect } from "@/components/ui/AppSelect";
import type { Control } from "react-hook-form";
import type { PaymentSchemaValues } from "../schemas/payment.schema";
import type { SelectOption } from "@/components/ui/AppSelect";

interface PaymentFiltersProps {
  control: Control<PaymentSchemaValues>;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  projectOptions: readonly SelectOption[];
  loading?: boolean;
}

export function PaymentFilters({ control, onSubmit, projectOptions }: PaymentFiltersProps) {
  const { t } = useTranslation();

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
      <AppFilters>
        <Controller
          name="projectId"
          control={control}
          render={({ field }) => (
            <AppSelect
              label={t("project")}
              options={projectOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder={t("selectProject")}
              width={{ xs: "100%", sm: "30%" }}
            />
          )}
        />
      </AppFilters>
    </Box>
  );
}
