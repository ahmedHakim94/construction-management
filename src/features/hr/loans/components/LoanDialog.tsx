import { useCallback, useEffect, useMemo } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
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
  DialogLoadingOverlay,
} from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import { useInitialEditLoading } from "@/hooks/useInitialEditLoading";
import { useGetEmployeesQuery } from "@/features/hr/employees/services/employees.api";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import type { Loan, LoanDialogMode, LoanFormValues } from "../types";

const DIALOG_TITLE_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
} as const;

const DIALOG_ACTIONS_SX = { px: 2.5, py: 1.5 } as const;
const CLOSE_ICON = <Close fontSize="small" />;

const getTodayDateString = (): string => dayjs().format("YYYY-MM-DD");

const isNotFutureLoanDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const parsed = dayjs(dateStr);
  if (!parsed.isValid()) return false;
  return parsed.format("YYYY-MM-DD") <= getTodayDateString();
};

interface LoanDialogProps {
  open: boolean;
  mode: LoanDialogMode;
  loan?: Loan;
  isSuperAdmin: boolean;
  adminProjectId: number | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: LoanFormValues) => Promise<void> | void;
}

export function LoanDialog({
  open,
  mode,
  loan,
  isSuperAdmin,
  adminProjectId,
  submitting = false,
  onClose,
  onSubmit,
}: LoanDialogProps) {
  const { t, i18n } = useTranslation(["hr", "common"]);
  const isArabic = i18n.language === "ar";

  const maxAllowedDate = useMemo(() => dayjs().endOf("day"), []);

  const schema = useMemo(
    () =>
      z.object({
        projectId: isSuperAdmin
          ? z.coerce
              .number({ message: t("hr:loanProjectRequired") })
              .min(1, t("hr:loanProjectRequired"))
          : z.coerce.number(),
        employeeId: z.coerce
          .number({ message: t("hr:loanEmployeeRequired") })
          .min(1, t("hr:loanEmployeeRequired")),
        amount: z.coerce
          .number({ message: t("hr:loanAmountRequired") })
          .positive(t("hr:loanAmountInvalid")),
        date: z
          .string()
          .min(1, t("hr:loanDateRequired"))
          .refine((val) => isNotFutureLoanDate(val), {
            message: t("hr:loanDateFutureInvalid"),
          }),
      }),
    [t, isSuperAdmin],
  );

  const { control, handleSubmit, reset, setValue, getValues } =
    useForm<LoanFormValues>({
      resolver: zodResolver(schema) as unknown as Resolver<LoanFormValues>,
      defaultValues: {
        projectId: isSuperAdmin ? 0 : (adminProjectId ?? 0),
        employeeId: 0,
        amount: 0,
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
    recordKey: loan?.id,
    isFetching: projectsLoading || employeesLoading,
    isReady: Boolean(rawProjects) && Boolean(employeesResponse),
    hasError: projectsError || employeesError,
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && loan) {
      reset({
        projectId: isSuperAdmin
          ? loan.projectId
          : (adminProjectId ?? loan.projectId),
        employeeId: loan.employeeId,
        amount: loan.amount,
        date: loan.date,
      });
      return;
    }

    reset({
      projectId: isSuperAdmin ? 0 : (adminProjectId ?? 0),
      employeeId: 0,
      amount: 0,
      date: getTodayDateString(),
    });
  }, [open, mode, loan, isSuperAdmin, adminProjectId, reset]);

  // Clear employee selection if SuperAdmin switches to a project that does not contain that employee
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
  }, [
    open,
    isSuperAdmin,
    effectiveProjectId,
    employeesResponse?.data,
    getValues,
    setValue,
  ]);

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
    if (loan?.projectName) return loan.projectName;
    return adminProjectId ? `#${adminProjectId}` : "";
  }, [rawProjects, adminProjectId, loan?.projectName]);

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

  const handleProjectChange = useCallback(
    (nextProjectId: number) => {
      setValue("projectId", nextProjectId, { shouldValidate: true });
    },
    [setValue],
  );

  const handleFormSubmit = async (values: LoanFormValues) => {
    if (submitting) return;

    const resolvedProjectId = isSuperAdmin
      ? Number(values.projectId)
      : Number(adminProjectId);

    if (!isNotFutureLoanDate(values.date)) return;

    await onSubmit({
      projectId: resolvedProjectId,
      employeeId: Number(values.employeeId),
      amount: Number(values.amount),
      date: values.date,
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
        <span>{mode === "edit" ? t("hr:editLoan") : t("hr:addLoan")}</span>
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
                    label={t("hr:loanProject")}
                    required
                    options={projectOptions}
                    value={field.value || ""}
                    onChange={(value) => handleProjectChange(Number(value))}
                    placeholder={t("hr:selectLoanProject")}
                    loading={projectsLoading}
                    error={fieldState.error?.message}
                  />
                )}
              />
            ) : (
              <AppInput
                label={t("hr:loanProject")}
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
                      : t("hr:selectLoanEmployee")
                  }
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="amount"
              control={control}
              render={({ field, fieldState }) => (
                <AppInput
                  {...field}
                  type="number"
                  label={t("hr:loanAmount")}
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

            <Controller
              name="date"
              control={control}
              render={({ field, fieldState }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={t("hr:loanDate")}
                    format="YYYY-MM-DD"
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
