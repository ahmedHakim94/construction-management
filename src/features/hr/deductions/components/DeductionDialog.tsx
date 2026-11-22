import { useEffect, useMemo } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  AppButton,
  AppDialog,
  AppInput,
  AppSelect,
  AppTextarea,
} from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import type { Employee, EmployeeProject } from "@/features/hr/employees/types";
import { isAllowedTransactionDate } from "../mock/deductions.mock";
import type {
  FinancialTransaction,
  TransactionDialogMode,
  TransactionFormValues,
} from "../types";

interface DeductionDialogProps {
  open: boolean;
  mode: TransactionDialogMode;
  transaction?: FinancialTransaction;
  employees: Employee[];
  projects: EmployeeProject[];
  isSuperAdmin: boolean;
  adminProjectId: number | null;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues) => void;
}

export function DeductionDialog({
  open,
  mode,
  transaction,
  employees,
  projects,
  isSuperAdmin,
  adminProjectId,
  onClose,
  onSubmit,
}: DeductionDialogProps) {
  const { t, i18n } = useTranslation(["hr", "common"]);
  const isArabic = i18n.language === "ar";

  const minAllowedDate = useMemo(() => dayjs().startOf("month"), []);
  const maxAllowedDate = useMemo(() => dayjs().endOf("day"), []);

  const schema = useMemo(
    () =>
      z.object({
        projectId: z.coerce
          .number({ message: t("hr:transactionProjectRequired") })
          .min(1, t("hr:transactionProjectRequired")),
        employeeId: z.coerce
          .number({ message: t("hr:transactionEmployeeRequired") })
          .min(1, t("hr:transactionEmployeeRequired")),
        type: z.enum(["DEDUCTION", "BONUS"]),
        amount: z.coerce
          .number({ message: t("hr:transactionAmountRequired") })
          .positive(t("hr:transactionAmountInvalid")),
        reason: z.string().trim().min(2, t("hr:transactionReasonRequired")),
        date: z
          .string()
          .min(1, t("hr:transactionDateRequired"))
          .refine((val) => isAllowedTransactionDate(val), {
            message: t("hr:transactionDateOutOfRange"),
          }),
      }),
    [t],
  );

  const { control, handleSubmit, reset, setValue, getValues } =
    useForm<TransactionFormValues>({
      resolver: zodResolver(
        schema,
      ) as unknown as Resolver<TransactionFormValues>,
      defaultValues: {
        projectId: isSuperAdmin ? 0 : (adminProjectId ?? 0),
        employeeId: 0,
        type: "DEDUCTION",
        amount: 0,
        reason: "",
        date: dayjs().format("YYYY-MM-DD"),
      },
    });

  const watchedProjectId = useWatch({ control, name: "projectId" });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && transaction) {
      reset({
        projectId: isSuperAdmin
          ? transaction.projectId
          : (adminProjectId ?? transaction.projectId),
        employeeId: transaction.employeeId,
        type: transaction.type,
        amount: transaction.amount,
        reason: transaction.reason,
        date: transaction.date,
      });
      return;
    }

    reset({
      projectId: isSuperAdmin ? 0 : (adminProjectId ?? 0),
      employeeId: 0,
      type: "DEDUCTION",
      amount: 0,
      reason: "",
      date: dayjs().format("YYYY-MM-DD"),
    });
  }, [open, mode, transaction, isSuperAdmin, adminProjectId, reset]);

  const projectOptions = useMemo<SelectOption[]>(
    () =>
      projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    [projects],
  );

  const lockedAdminProjectName = useMemo(
    () =>
      projects.find((project) => project.id === adminProjectId)?.name ?? "",
    [projects, adminProjectId],
  );

  const filteredEmployees = useMemo(() => {
    const effectiveProjectId = isSuperAdmin
      ? Number(watchedProjectId)
      : Number(adminProjectId);
    if (!effectiveProjectId) return [];
    return employees.filter((employee) =>
      employee.projectIds.includes(effectiveProjectId),
    );
  }, [employees, isSuperAdmin, watchedProjectId, adminProjectId]);

  const employeeOptions = useMemo<SelectOption[]>(
    () =>
      filteredEmployees.map((employee) => ({
        value: employee.id,
        label: `${employee.name} (${employee.code})`,
      })),
    [filteredEmployees],
  );

  const typeOptions = useMemo<SelectOption[]>(
    () => [
      { value: "DEDUCTION", label: t("hr:transactionTypeDeduction") },
      { value: "BONUS", label: t("hr:transactionTypeBonus") },
    ],
    [t],
  );

  const handleProjectChange = (nextProjectId: number) => {
    setValue("projectId", nextProjectId, { shouldValidate: true });
    const currentEmployeeId = getValues("employeeId");
    if (currentEmployeeId) {
      const stillAssigned = employees.some(
        (employee) =>
          employee.id === currentEmployeeId &&
          employee.projectIds.includes(nextProjectId),
      );
      if (!stillAssigned) {
        setValue("employeeId", 0);
      }
    }
  };

  const handleFormSubmit = (values: TransactionFormValues) => {
    const effectiveProjectId = isSuperAdmin
      ? Number(values.projectId)
      : Number(adminProjectId);

    if (!isAllowedTransactionDate(values.date)) return;

    onSubmit({
      ...values,
      projectId: effectiveProjectId,
      employeeId: Number(values.employeeId),
      amount: Number(values.amount),
      reason: values.reason.trim(),
    });
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle dir={isArabic ? "rtl" : "ltr"}>
        {mode === "edit" ? t("hr:editTransaction") : t("hr:addTransaction")}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent dir={isArabic ? "rtl" : "ltr"}>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            {isSuperAdmin ? (
              <Controller
                name="projectId"
                control={control}
                render={({ field, fieldState }) => (
                  <AppSelect
                    label={t("hr:transactionProject")}
                    required
                    options={projectOptions}
                    value={field.value || ""}
                    onChange={(value) => handleProjectChange(Number(value))}
                    placeholder={t("hr:selectTransactionProject")}
                    error={fieldState.error?.message}
                  />
                )}
              />
            ) : (
              <AppInput
                label={t("hr:transactionProject")}
                value={lockedAdminProjectName}
                disabled
              />
            )}

            <Controller
              name="employeeId"
              control={control}
              render={({ field, fieldState }) => (
                <AppSelect
                  label={t("hr:employeeName")}
                  required
                  options={employeeOptions}
                  value={field.value || ""}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder={
                    isSuperAdmin && !watchedProjectId
                      ? t("hr:selectProjectFirst")
                      : t("hr:selectTransactionEmployee")
                  }
                  error={fieldState.error?.message}
                />
              )}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 2,
                alignItems: "start",
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Typography
                  component="label"
                  sx={{
                    position: "absolute",
                    top: "-9px",
                    left: isArabic ? "auto" : "12px",
                    right: isArabic ? "12px" : "auto",
                    bgcolor: "background.paper",
                    px: 0.8,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "text.secondary",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                >
                  {isArabic
                    ? `* ${t("hr:transactionType")}`
                    : `${t("hr:transactionType")} *`}
                </Typography>

                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <AppSelect
                      label=""
                      required
                      options={typeOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Box>

              <Controller
                name="amount"
                control={control}
                render={({ field, fieldState }) => (
                  <AppInput
                    {...field}
                    type="number"
                    label={t("hr:transactionAmount")}
                    required
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? 0
                          : Number(event.target.value),
                      )
                    }
                  />
                )}
              />
            </Box>

            <Controller
              name="date"
              control={control}
              render={({ field, fieldState }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={t("hr:transactionDate")}
                    format="YYYY-MM-DD"
                    minDate={minAllowedDate}
                    maxDate={maxAllowedDate}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(value) =>
                      field.onChange(
                        value && value.isValid()
                          ? value.format("YYYY-MM-DD")
                          : "",
                      )
                    }
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        required: true,
                        error: Boolean(fieldState.error),
                        helperText: fieldState.error?.message,
                      },
                    }}
                  />
                </LocalizationProvider>
              )}
            />

            <Controller
              name="reason"
              control={control}
              render={({ field, fieldState }) => (
                <AppTextarea
                  {...field}
                  label={t("hr:transactionReason")}
                  required
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions dir={isArabic ? "rtl" : "ltr"} sx={{ px: 3, pb: 2 }}>
          <AppButton type="submit" variant="contained">
            {t("common:save")}
          </AppButton>
          <AppButton variant="outlined" color="inherit" onClick={onClose}>
            {t("common:cancel")}
          </AppButton>
        </DialogActions>
      </Box>
    </AppDialog>
  );
}
