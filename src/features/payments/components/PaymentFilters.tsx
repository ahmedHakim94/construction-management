import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppSelect } from "@/components/ui/AppSelect";
import type { SelectOption } from "@/components/ui/AppSelect";
import type { PaymentSchemaValues } from "../schemas/payment.schema";

interface PaymentFiltersProps {
  control: Control<PaymentSchemaValues>;
  projectOptions: readonly SelectOption[];
  yearOptions: readonly SelectOption[];
  monthOptions: readonly SelectOption[];
  onReset: () => void;
}

export function PaymentFilters({
  control,
  projectOptions,
  yearOptions,
  monthOptions,
  onReset,
}: PaymentFiltersProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "minmax(0, 1.5fr) repeat(3, minmax(0, 1fr)) auto",
        },
        alignItems: "end",
        gap: 2,
        width: "100%",
      }}
    >
      <Controller
        name="search"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            label={t("search")}
            placeholder={t("search")}
            size="small"
            fullWidth
          />
        )}
      />

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
            width="100%"
          />
        )}
      />

      <Controller
        name="year"
        control={control}
        render={({ field }) => (
          <AppSelect
            label={t("year")}
            options={yearOptions}
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder={t("selectYear")}
            width="100%"
          />
        )}
      />

      <Controller
        name="month"
        control={control}
        render={({ field }) => (
          <AppSelect
            label={t("month")}
            options={monthOptions}
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder={t("selectMonth")}
            width="100%"
          />
        )}
      />

      <Tooltip title={t("reset Filters")} arrow>
        <IconButton
          type="button"
          onClick={onReset}
          aria-label={t("resetFilters")}
          color="primary"
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            width: 40,
            height: 40,
            justifySelf: { xs: "start", md: "center" },
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <RestartAltIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}