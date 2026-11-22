import { useEffect, useMemo } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  AppBadge,
  AppButton,
  AppDialog,
  AppInput,
  AppSelect,
} from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import type {
  Employee,
  EmployeeDialogMode,
  EmployeeFormValues,
  EmployeeProject,
} from "../types";

interface EmployeeDialogProps {
  open: boolean;
  mode: EmployeeDialogMode;
  employee?: Employee;
  projects: EmployeeProject[];
  isSuperAdmin: boolean;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
}

const DEFAULT_VALUES: EmployeeFormValues = {
  name: "",
  phone: "",
  jobTitle: "",
  projectIds: [],
  basicSalary: 0,
  status: "ACTIVE",
};

export function EmployeeDialog({
  open,
  mode,
  employee,
  projects,
  isSuperAdmin,
  onClose,
  onSubmit,
}: EmployeeDialogProps) {
  const { t, i18n } = useTranslation(["hr", "common"]);
  const isArabic = i18n.language === "ar";
  const isViewMode = mode === "view" || !isSuperAdmin;

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t("hr:employeeNameRequired")),
        phone: z.string().trim().min(6, t("hr:employeePhoneRequired")),
        jobTitle: z.string().trim().min(2, t("hr:jobTitleRequired")),
        projectIds: z.array(z.number()),
        basicSalary: z.coerce
          .number({ message: t("hr:basicSalaryRequired") })
          .min(0, t("hr:basicSalaryInvalid")),
        status: z.enum(["ACTIVE", "INACTIVE"]),
      }),
    [t],
  );

  const { control, handleSubmit, reset } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<EmployeeFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "create" || !employee) {
      reset(DEFAULT_VALUES);
      return;
    }

    reset({
      name: employee.name,
      phone: employee.phone,
      jobTitle: employee.jobTitle,
      projectIds: employee.projectIds,
      basicSalary: employee.basicSalary,
      status: employee.status,
    });
  }, [open, mode, employee, reset]);

  const statusOptions = useMemo<SelectOption[]>(
    () => [
      { value: "ACTIVE", label: t("common:active") },
      { value: "INACTIVE", label: t("common:inactive") },
    ],
    [t],
  );

  const projectNameById = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const salaryFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [],
  );

  const dialogTitle =
    mode === "view"
      ? t("hr:employeeDetails")
      : mode === "edit"
        ? t("hr:editEmployee")
        : t("hr:addEmployee");

  const handleFormSubmit = (values: EmployeeFormValues) => {
    if (isViewMode) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      phone: values.phone.trim(),
      jobTitle: values.jobTitle.trim(),
      projectIds: Array.from(new Set(values.projectIds)),
      basicSalary: Number(values.basicSalary),
    });
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle dir={isArabic ? "rtl" : "ltr"}>{dialogTitle}</DialogTitle>

      {isViewMode ? (
        <>
          <DialogContent dir={isArabic ? "rtl" : "ltr"}>
            {employee && (
              <Stack spacing={2} sx={{ pt: 1 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("hr:employeeCode")}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {employee.code}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("common:status")}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <AppBadge
                        label={t(
                          employee.status === "ACTIVE"
                            ? "common:active"
                            : "common:inactive",
                        )}
                        color={
                          employee.status === "ACTIVE" ? "success" : "default"
                        }
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("hr:employeeName")}
                    </Typography>
                    <Typography variant="body1">{employee.name}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("hr:employeePhone")}
                    </Typography>
                    <Typography variant="body1">{employee.phone}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("hr:jobTitle")}
                    </Typography>
                    <Typography variant="body1">{employee.jobTitle}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("hr:basicSalary")}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {salaryFormatter.format(employee.basicSalary)}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    {t("hr:assignedProjects")}
                  </Typography>
                  {employee.projectIds.length > 0 ? (
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                      {employee.projectIds.map((projectId) => (
                        <Chip
                          key={projectId}
                          size="small"
                          label={
                            projectNameById.get(projectId) ?? `#${projectId}`
                          }
                          sx={(theme) => ({
                            height: 24,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            "& .MuiChip-label": {
                              px: 1,
                            },
                          })}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t("hr:noProjectsAssigned")}
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}
          </DialogContent>

          <DialogActions dir={isArabic ? "rtl" : "ltr"} sx={{ px: 3, pb: 2 }}>
            <AppButton variant="outlined" onClick={onClose}>
              {t("common:cancel")}
            </AppButton>
          </DialogActions>
        </>
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <DialogContent dir={isArabic ? "rtl" : "ltr"}>
            <Stack spacing={2.25} sx={{ pt: 1 }}>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <AppInput
                    {...field}
                    label={t("hr:employeeName")}
                    required
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field, fieldState }) => (
                  <AppInput
                    {...field}
                    label={t("hr:employeePhone")}
                    required
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="jobTitle"
                control={control}
                render={({ field, fieldState }) => (
                  <AppInput
                    {...field}
                    label={t("hr:jobTitle")}
                    required
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="basicSalary"
                control={control}
                render={({ field, fieldState }) => (
                  <AppInput
                    {...field}
                    type="number"
                    label={t("hr:basicSalary")}
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
                name="status"
                control={control}
                render={({ field, fieldState }) => (
                  <AppSelect
                    label={t("common:status")}
                    required
                    options={statusOptions}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    error={fieldState.error?.message}
                  />
                )}
              />

              {isSuperAdmin && (
                <Controller
                  name="projectIds"
                  control={control}
                  render={({ field, fieldState }) => {
                    const selectedProjects = projects.filter((project) =>
                      field.value.includes(project.id),
                    );

                    return (
                      <Autocomplete
                        multiple
                        options={projects}
                        value={selectedProjects}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        onChange={(_, newValue) =>
                          field.onChange(newValue.map((item) => item.id))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label={t("hr:assignedProjects")}
                            placeholder={t("hr:selectProjectsPlaceholder")}
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    );
                  }}
                />
              )}
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
      )}
    </AppDialog>
  );
}
