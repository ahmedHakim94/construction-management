import { Controller } from "react-hook-form";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppInput, AppSelect } from "@/components/ui";
import type { useDailyWorkForm } from "../hooks/useDailyWorkForm";
import type { Equipment } from "@/features/equipment/types";
import { useGetAllTasksQuery } from "@/features/settings/task/services/task.api";
import { useMemo } from "react";

type DailyWorkForm = ReturnType<typeof useDailyWorkForm>;

interface DailyWorkDetailsFieldsProps {
  control: DailyWorkForm["control"];
  isExternal: DailyWorkForm["isExternal"];
  workingDuration: DailyWorkForm["workingDuration"];
  selectedEquipment: Equipment | undefined;
  open: boolean;
}

export function DailyWorkDetailsFields({
  control,
  isExternal,
  workingDuration,
  selectedEquipment,
  open,
}: DailyWorkDetailsFieldsProps) {
  console.log("🚀 ~ DailyWorkDetailsFields ~ isExternal:", isExternal)
  const { t } = useTranslation();
  const { data: tasks } = useGetAllTasksQuery(undefined, { skip: !open });


  const taskOptions = useMemo(() => (
    tasks?.map((item) => ({
      value: item.id,
      label: item.name,
    })) || []
  ), [tasks])

  return (
    <>
      {/* Task */}
      <Controller
        name="taskId"
        control={control}
        render={({ field, fieldState }) => (
          <AppSelect
            label={t("task")}
            required
            options={taskOptions}
            value={field.value}
            onChange={field.onChange}
            placeholder={t("selectTask")}
            error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
          />
        )}
      />

      {/* Start / End Time */}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 1,
            minWidth: 0,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Typography
            sx={{
              whiteSpace: "nowrap",
              color: "text.secondary",
              fontSize: "1rem",
              fontWeight: 400,
            }}
          >
            {t("startTime")} *
          </Typography>

          <Controller
            name="startTime"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                {...field}
                type="time"
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ? t(fieldState.error.message) : undefined}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  "& input": {
                    direction: "ltr",
                    textAlign: "left",
                  },
                }}
              />
            )}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            flex: 1,
            minWidth: 0,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Typography
            sx={{
              whiteSpace: "nowrap",
              color: "text.secondary",
              fontSize: "1rem",
              fontWeight: 400,
            }}
          >
            {t("endTime")} *
          </Typography>

          <Controller
            name="endTime"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                {...field}
                type="time"
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ? t(fieldState.error.message) : undefined}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  "& input": {
                    direction: "ltr",
                    textAlign: "left",
                  },
                }}
              />
            )}
          />
        </Box>
      </Box>

      {/* Working Duration */}

      <AppInput
        label={t("workingHours")}

        value={workingDuration}

        InputProps={{
          readOnly: true,
        }}
      />

      {/* Hour Rate */}

      <Controller
        name="hourRate"
        control={control}
        render={({ field, fieldState }) => (
          <AppInput
            label={t("hourRate")}
            type="number"
            required={Boolean(isExternal)}
            inputProps={{
              min: 0,
              step: 0.01,
            }}
            {...field}
            onChange={(event) => field.onChange(Number(event.target.value))}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ? t(fieldState.error.message) : undefined}
            InputProps={{
              readOnly: !isExternal ,
            }}
          />
        )}
      />

      {/* Cost */}
      <Controller
        name="cost"
        control={control}
        render={({ field }) => (
          <AppInput
            label={t("cost")}
            type="number"
            {...field}
            InputProps={{
              readOnly: true,
            }}
          />
        )}
      />

      {/* Deduction */}

      <Controller
        name="deduction"
        control={control}
        render={({ field, fieldState }) => (
          <AppInput
            label={t("deduction")}
            type="number"
            inputProps={{
              min: 0,
              step: 0.01,
            }}
            {...field}
            onChange={(event) => field.onChange(Number(event.target.value))}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ? t(fieldState.error.message) : undefined}
          />
        )}
      />

      {/* Deduction Reason */}
      <Controller
        name="deductionReason"
        control={control}
        render={({ field }) => (
          <AppInput label={t("deductionReason")} {...field} />
        )}
      />

      {/* Fuel */}

      <Controller
        name="fuelConsumption"
        control={control}
        render={({ field, fieldState }) => (
          <AppInput
            label={t("fuelConsumption")}
            type="number"
            inputProps={{
              min: 0,
              step: 0.1,
            }}
            {...field}
            onChange={(event) => field.onChange(Number(event.target.value))}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ? t(fieldState.error.message) : undefined}
          />
        )}
      />

      {/* Notes */}
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <AppInput label={t("notes")} multiline minRows={3} {...field} />
        )}
      />
    </>
  );
}
