import { useCallback, useEffect, useMemo } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
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
  DialogLoadingOverlay,
} from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import { useInitialEditLoading } from "@/hooks/useInitialEditLoading";
import { useGetEmployeesQuery } from "@/features/hr/employees/services/employees.api";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import type {
  FinancialTransaction,
  TransactionDialogMode,
  TransactionFormValues,
} from "../types";
import {
  getTodayDateString,
  isAllowedTransactionDate,
} from "../utils/transactionDates";

const DIALOG_TITLE_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
} as const;

const TWO_COL_GRID_SX = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
  gap: 2,
  alignItems: "start",
} as const;

const DIALOG_ACTIONS_SX = { px: 2.5, py: 1.5 } as const;
const CLOSE_ICON = <Close fontSize="small" />;

interface DeductionDialogProps {
  open: boolean;
  mode: TransactionDialogMode;
  transaction?: FinancialTransaction;
  isSuperAdmin: boolean;
  adminProjectId: number | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues) => Promise<void> | void;
}

export function DeductionDialog({
  open,
  mode,
  transaction,
  isSuperAdmin,
  adminProjectId,
  submitting = false,
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
        projectId: isSuperAdmin
          ? z.coerce
              .number({ message: t("hr:transactionProjectRequired") })
              .min(1, t("hr:transactionProjectRequired"))
          : z.coerce.number(),
        employeeId: z.coerce
          .number({ message: t("hr:transactionEmployeeRequired") })
          .min(1, t("hr:transactionEmployeeRequired")),
        type: z.enum(["DEDUCTION", "BONUS"]),
        amount: z.coerce
          .number({ message: t("hr:transactionAmountRequired") })
          .positive(t("hr:transactionAmountInvalid")),
        reason: z.string(),
        date: z
          .string()
          .min(1, t("hr:transactionDateRequired"))
          .refine((val) => isAllowedTransactionDate(val), {
            message: t("hr:transactionDateOutOfRange"),
          }),
      }),
    [t, isSuperAdmin],
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
        date: getTodayDateString(),
      },
    });

  const watchedProjectId = useWatch({ control, name: "projectId" });

  const effectiveProjectId = isSuperAdmin
    ? Number(watchedProjectId) || null
    : adminProjectId;

  // Fetch live projects (scoped by backend: all for SuperAdmin, own project for Admin)
  const {
    data: rawProjects,
    isFetching: projectsLoading,
    isError: projectsError,
  } = useGetAllProjectsQuery(undefined, {
    skip: !open,
  });

  // Fetch live employees belonging to the selected project
  const {
    data: employeesResponse,
    isFetching: employeesLoading,
    isError: employeesError,
  } = useGetEmployeesQuery(
    {
      page: 1,
      limit: 100,
      project_id:
        isSuperAdmin && effectiveProjectId ? effectiveProjectId : undefined,
    },
    {
      skip: !open || !effectiveProjectId,
    },
  );

  const isInitialEditLoading = useInitialEditLoading({
    open,
    isEdit: mode === "edit",
    recordKey: transaction?.id,
    isFetching: projectsLoading || employeesLoading,
    isReady: Boolean(rawProjects) && Boolean(employeesResponse),
    hasError: projectsError || employeesError,
  });

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
        reason: transaction.reason ?? "",
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
      date: getTodayDateString(),
    });
  }, [open, mode, transaction, isSuperAdmin, adminProjectId, reset]);

  // Clear employee selection if SuperAdmin switches to a project where the chosen employee isn't assigned
  useEffect(() => {
    if (!open || !isSuperAdmin || !effectiveProjectId) return;
    const employees = employeesResponse?.data;
    if (!employees) return;

    const currentEmployeeId = Number(getValues("employeeId"));
    if (!currentEmployeeId) return;

    const employeeIds = new Set(employees.map((emp) => emp.id));
    if (!employeeIds.has(currentEmployeeId)) {
      setValue("employeeId", 0);
    }
  }, [open, isSuperAdmin, effectiveProjectId, employeesResponse?.data, getValues, setValue]);

  const projectOptions = useMemo<SelectOption[]>(() => {
    if (!rawProjects?.length) return [];
    const list: SelectOption[] = [];
    for (let i = 0; i < rawProjects.length; i += 1) {
      const project = rawProjects[i];
      list.push({ value: Number(project.id), label: project.name });
    }
    return list;
  }, [rawProjects]);

  const lockedAdminProjectName = useMemo(() => {
    const matched = rawProjects?.find(
      (project) => Number(project.id) === adminProjectId,
    );
    if (matched) return matched.name;
    if (transaction?.projectName) return transaction.projectName;
    return adminProjectId ? `#${adminProjectId}` : "";
  }, [rawProjects, adminProjectId, transaction?.projectName]);

  const employeeOptions = useMemo<SelectOption[]>(() => {
    const employees = employeesResponse?.data;
    if (!employees?.length) return [];
    const list: SelectOption[] = [];
    for (let i = 0; i < employees.length; i += 1) {
      const employee = employees[i];
      list.push({
        value: employee.id,
        label: `${employee.name} (#${employee.id})`,
      });
    }
    return list;
  }, [employeesResponse?.data]);

  const typeOptions = useMemo<SelectOption[]>(
    () => [
      { value: "DEDUCTION", label: t("hr:transactionTypeDeduction") },
      { value: "BONUS", label: t("hr:transactionTypeBonus") },
    ],
    [t],
  );

  const handleProjectChange = useCallback(
    (nextProjectId: number) => {
      setValue("projectId", nextProjectId, { shouldValidate: true });
    },
    [setValue],
  );

  const handleFormSubmit = async (values: TransactionFormValues) => {
    if (submitting) return;

    const resolvedProjectId = isSuperAdmin
      ? Number(values.projectId)
      : Number(adminProjectId);

    if (!isAllowedTransactionDate(values.date)) return;

    await onSubmit({
      ...values,
      projectId: resolvedProjectId,
      employeeId: Number(values.employeeId),
      amount: Number(values.amount),
      reason: values.reason.trim(),
    });
  };

  return (
    <AppDialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle dir={isArabic ? "rtl" : "ltr"} sx={DIALOG_TITLE_SX}>
        <span>
          {mode === "edit" ? t("hr:editTransaction") : t("hr:addTransaction")}
        </span>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={submitting}
          aria-label={t("hr:close")}
          sx={{ color: "text.secondary" }}
        >
          {CLOSE_ICON}
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent
          dir={isArabic ? "rtl" : "ltr"}
          sx={{
            position: "relative",
            minHeight: isInitialEditLoading ? 260 : undefined,
          }}
        >
          <DialogLoadingOverlay loading={isInitialEditLoading} />

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
                    loading={projectsLoading}
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
                  loading={employeesLoading}
                  disabled={isSuperAdmin && !effectiveProjectId}
                  placeholder={
                    isSuperAdmin && !effectiveProjectId
                      ? t("hr:selectProjectFirst")
                      : t("hr:selectTransactionEmployee")
                  }
                  error={fieldState.error?.message}
                />
              )}
            />

            <Box sx={TWO_COL_GRID_SX}>
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
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions dir={isArabic ? "rtl" : "ltr"} sx={DIALOG_ACTIONS_SX}>
          <AppButton
            type="submit"
            variant="contained"
            loading={submitting}
            disabled={isInitialEditLoading}
          >
            {t("common:save")}
          </AppButton>
          <AppButton
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={submitting}
          >
            {t("common:cancel")}
          </AppButton>
        </DialogActions>
      </Box>
    </AppDialog>
  );
}
