import { useEffect, useMemo } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog, AppInput, AppSelect } from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import type { Employee, EmployeeProject } from "@/features/hr/employees/types";
import type { Loan, LoanDialogMode, LoanFormValues } from "../types";

interface LoanDialogProps {
  open: boolean;
  mode: LoanDialogMode;
  loan?: Loan;
  employees: Employee[];
  projects: EmployeeProject[];
  isSuperAdmin: boolean;
  adminProjectId: number | null;
  onClose: () => void;
  onSubmit: (values: LoanFormValues) => void;
}

export function LoanDialog({
  open,
  mode,
  loan,
  employees,
  projects,
  isSuperAdmin,
  adminProjectId,
  onClose,
  onSubmit,
}: LoanDialogProps) {
  const { t, i18n } = useTranslation(["hr", "common"]);
  const isArabic = i18n.language === "ar";

  const schema = useMemo(
    () =>
      z.object({
        projectId: z.coerce
          .number({ message: t("hr:loanProjectRequired") })
          .min(1, t("hr:loanProjectRequired")),
        employeeId: z.coerce
          .number({ message: t("hr:loanEmployeeRequired") })
          .min(1, t("hr:loanEmployeeRequired")),
        amount: z.coerce
          .number({ message: t("hr:loanAmountRequired") })
          .positive(t("hr:loanAmountInvalid")),
        date: z.string().min(1, t("hr:loanDateRequired")),
      }),
    [t],
  );

  const { control, handleSubmit, reset, setValue, getValues } =
    useForm<LoanFormValues>({
      resolver: zodResolver(schema) as unknown as Resolver<LoanFormValues>,
      defaultValues: {
        projectId: isSuperAdmin ? 0 : (adminProjectId ?? 0),
        employeeId: 0,
        amount: 0,
        date: dayjs().format("YYYY-MM-DD"),
      },
    });

  const watchedProjectId = useWatch({ control, name: "projectId" });

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
      date: dayjs().format("YYYY-MM-DD"),
    });
  }, [open, mode, loan, isSuperAdmin, adminProjectId, reset]);

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

  const handleFormSubmit = (values: LoanFormValues) => {
    const effectiveProjectId = isSuperAdmin
      ? Number(values.projectId)
      : Number(adminProjectId);

    onSubmit({
      projectId: effectiveProjectId,
      employeeId: Number(values.employeeId),
      amount: Number(values.amount),
      date: values.date,
    });
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle dir={isArabic ? "rtl" : "ltr"}>
        {mode === "edit" ? t("hr:editLoan") : t("hr:addLoan")}
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
                    label={t("hr:loanProject")}
                    required
                    options={projectOptions}
                    value={field.value || ""}
                    onChange={(value) => handleProjectChange(Number(value))}
                    placeholder={t("hr:selectLoanProject")}
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
                  placeholder={
                    isSuperAdmin && !watchedProjectId
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
