import { useEffect, useMemo, type ReactNode } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  type Theme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import Close from "@mui/icons-material/Close";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
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
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
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
  isSuperAdmin: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => Promise<void> | void;
}

const DEFAULT_VALUES: EmployeeFormValues = {
  name: "",
  phone: "",
  address: "",
  jobTitle: "",
  hireDate: "",
  projectIds: [],
  basicSalary: 0,
  status: "ACTIVE",
};

const EMPTY_PROJECTS: EmployeeProject[] = [];

const SALARY_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const getProjectChipSx = (theme: Theme) => ({
  height: 28,
  fontSize: "0.8125rem",
  fontWeight: 600,
  borderRadius: 1.5,
  bgcolor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
  "& .MuiChip-label": {
    px: 1.25,
  },
});

const getHeroCardSx = (theme: Theme) => ({
  p: 2,
  borderRadius: 2,
  bgcolor: alpha(theme.palette.primary.main, 0.045),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 1.5,
});

const getAvatarSx = (theme: Theme) => ({
  width: 48,
  height: 48,
  fontSize: "1rem",
  fontWeight: 700,
  bgcolor: alpha(theme.palette.primary.main, 0.12),
  color: theme.palette.primary.main,
  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.24)}`,
});

const getSalaryHighlightSx = (theme: Theme) => ({
  px: 2,
  py: 1.75,
  borderRadius: 2,
  bgcolor: alpha(theme.palette.secondary.main, 0.075),
  border: `1px solid ${alpha(theme.palette.secondary.main, 0.24)}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 1.5,
});

const getSalaryIconBoxSx = (theme: Theme) => ({
  width: 38,
  height: 38,
  borderRadius: 1.75,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: alpha(theme.palette.secondary.main, 0.14),
  color: theme.palette.secondary.dark,
  flexShrink: 0,
});

const getProjectsCountChipSx = (theme: Theme) => ({
  height: 22,
  minWidth: 24,
  fontSize: "0.75rem",
  fontWeight: 700,
  bgcolor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  "& .MuiChip-label": {
    px: 0.85,
  },
});

interface DetailInfoTileProps {
  icon: ReactNode;
  label: string;
  value?: string;
  ltr?: boolean;
}

function DetailInfoTile({
  icon,
  label,
  value,
  ltr = false,
}: DetailInfoTileProps) {
  const hasValue = Boolean(value && value.trim());
  const displayValue = hasValue ? value! : "—";

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.75,
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        spacing={0.75}
        useFlexGap
        alignItems="center"
        sx={{ mb: 0.6 }}
      >
        <Box
          sx={{
            display: "inline-flex",
            color: "primary.main",
            opacity: 0.85,
            "& svg": { fontSize: 16 },
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        fontWeight={hasValue ? 600 : 400}
        color={hasValue ? "text.primary" : "text.disabled"}
        sx={{ wordBreak: "break-word" }}
      >
        {ltr && hasValue ? (
          <Box
            component="bdi"
            dir="ltr"
            sx={{
              display: "inline-block",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {displayValue}
          </Box>
        ) : (
          displayValue
        )}
      </Typography>
    </Box>
  );
}

export function EmployeeDialog({
  open,
  mode,
  employee,
  isSuperAdmin,
  submitting = false,
  onClose,
  onSubmit,
}: EmployeeDialogProps) {
  const { t, i18n } = useTranslation(["hr", "common"]);
  const isArabic = i18n.language === "ar";
  const isViewMode = mode === "view" || !isSuperAdmin;

  // Fetch projects only when SuperAdmin opens Add/Edit dialog
  const { data: rawProjects, isFetching: projectsLoading } =
    useGetAllProjectsQuery(undefined, {
      skip: !open || isViewMode || !isSuperAdmin,
    });

  const projects = useMemo<EmployeeProject[]>(
    () =>
      (rawProjects ?? []).map((project) => ({
        id: Number(project.id),
        name: project.name,
      })),
    [rawProjects],
  );

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t("hr:employeeNameRequired")),
        phone: z.string().trim().min(6, t("hr:employeePhoneRequired")),
        address: z.string(),
        jobTitle: z.string(),
        hireDate: z.string(),
        projectIds: isSuperAdmin
          ? z.array(z.number()).min(1, t("hr:projectsRequired"))
          : z.array(z.number()),
        basicSalary: z.coerce
          .number({ message: t("hr:basicSalaryRequired") })
          .min(0, t("hr:basicSalaryInvalid")),
        status: z.enum(["ACTIVE", "INACTIVE"]),
      }),
    [t, isSuperAdmin],
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
      address: employee.address ?? "",
      jobTitle: employee.jobTitle ?? "",
      hireDate: employee.hireDate ?? "",
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

  const dialogTitle =
    mode === "view"
      ? t("hr:employeeDetails")
      : mode === "edit"
        ? t("hr:editEmployee")
        : t("hr:addEmployee");

  const handleFormSubmit = async (values: EmployeeFormValues) => {
    if (isViewMode || submitting) return;
    await onSubmit({
      ...values,
      name: values.name.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      jobTitle: values.jobTitle.trim(),
      hireDate: values.hireDate.trim(),
      projectIds: Array.from(new Set(values.projectIds)),
      basicSalary: Number(values.basicSalary),
    });
  };

  const viewProjects = employee?.projects ?? EMPTY_PROJECTS;

  return (
    <AppDialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        dir={isArabic ? "rtl" : "ltr"}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <span>{dialogTitle}</span>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={submitting}
          aria-label={t("hr:close")}
          sx={{ color: "text.secondary" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      {isViewMode ? (
        <>
          <DialogContent dir={isArabic ? "rtl" : "ltr"}>
            {employee ? (
              <Stack spacing={2} sx={{ pt: 0.5 }}>
                {/* Hero Profile Header */}
                <Box sx={getHeroCardSx}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    useFlexGap
                    alignItems="center"
                  >
                    <Avatar sx={getAvatarSx}>
                      {getInitials(employee.name)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="text.primary"
                        sx={{ lineHeight: 1.3 }}
                      >
                        {employee.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.25 }}
                      >
                        {employee.jobTitle || "—"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Chip
                      size="small"
                      label={
                        <Box
                          component="bdi"
                          dir="ltr"
                          sx={{
                            display: "inline-block",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          #{employee.id}
                        </Box>
                      }
                      sx={{
                        height: 26,
                        fontWeight: 700,
                        bgcolor: "background.paper",
                        color: "text.primary",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                    <AppBadge
                      label={t(
                        employee.status === "ACTIVE"
                          ? "common:active"
                          : "common:inactive",
                      )}
                      color={
                        employee.status === "ACTIVE" ? "success" : "default"
                      }
                      size="medium"
                    />
                  </Stack>
                </Box>

                {/* Highlighted Basic Salary Callout */}
                <Box sx={getSalaryHighlightSx}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    useFlexGap
                    alignItems="center"
                  >
                    <Box sx={getSalaryIconBoxSx}>
                      <PaymentsOutlined fontSize="small" />
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ display: "block" }}
                      >
                        {t("hr:basicSalary")}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="secondary.dark"
                        fontWeight={500}
                      >
                        {t("hr:monthlySalaryLabel")}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="secondary.dark"
                  >
                    <Box
                      component="bdi"
                      dir="ltr"
                      sx={{
                        display: "inline-block",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {SALARY_FORMATTER.format(employee.basicSalary)}
                    </Box>
                  </Typography>
                </Box>

                {/* Structured Info Grid */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 1.5,
                  }}
                >
                  <DetailInfoTile
                    icon={<PhoneOutlined />}
                    label={t("hr:employeePhone")}
                    value={employee.phone}
                    ltr
                  />

                  <DetailInfoTile
                    icon={<CalendarTodayOutlined />}
                    label={t("hr:hireDate")}
                    value={employee.hireDate}
                    ltr
                  />

                  <DetailInfoTile
                    icon={<WorkOutlineOutlined />}
                    label={t("hr:jobTitle")}
                    value={employee.jobTitle}
                  />

                  <DetailInfoTile
                    icon={<LocationOnOutlined />}
                    label={t("hr:employeeAddress")}
                    value={employee.address}
                  />
                </Box>

                {/* Assigned Projects Card */}
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 1.25,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.75}
                      useFlexGap
                      alignItems="center"
                    >
                      <ApartmentOutlined
                        sx={{ fontSize: 18, color: "primary.main" }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {t("hr:assignedProjects")}
                      </Typography>
                    </Stack>

                    {viewProjects.length > 0 ? (
                      <Chip
                        size="small"
                        label={
                          <Box
                            component="bdi"
                            dir="ltr"
                            sx={{
                              display: "inline-block",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {viewProjects.length}
                          </Box>
                        }
                        sx={getProjectsCountChipSx}
                      />
                    ) : null}
                  </Box>

                  {viewProjects.length > 0 ? (
                    <Stack
                      direction="row"
                      spacing={0.85}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      {viewProjects.map((project) => (
                        <Chip
                          key={project.id}
                          size="small"
                          label={project.name}
                          sx={getProjectChipSx}
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
            ) : null}
          </DialogContent>

          <DialogActions
            dir={isArabic ? "rtl" : "ltr"}
            sx={{ px: 2.5, py: 1.5 }}
          >
            <AppButton variant="outlined" onClick={onClose}>
              {t("hr:close")}
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
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="address"
                control={control}
                render={({ field, fieldState }) => (
                  <AppInput
                    {...field}
                    label={t("hr:employeeAddress")}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
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
                  name="hireDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label={t("hr:hireDate")}
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
                          field: { clearable: true },
                          textField: {
                            size: "small",
                            fullWidth: true,
                            error: Boolean(fieldState.error),
                            helperText: fieldState.error?.message,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Box>

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

              {isSuperAdmin ? (
                <Controller
                  name="projectIds"
                  control={control}
                  render={({ field, fieldState }) => {
                    const selectedSet = new Set(field.value);
                    const selectedProjects = projects.filter((project) =>
                      selectedSet.has(project.id),
                    );

                    return (
                      <Autocomplete
                        multiple
                        loading={projectsLoading}
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
                          <AppInput
                            {...params}
                            size="small"
                            label={t("hr:assignedProjects")}
                            required
                            placeholder={t("hr:selectProjectsPlaceholder")}
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    );
                  }}
                />
              ) : null}
            </Stack>
          </DialogContent>

          <DialogActions dir={isArabic ? "rtl" : "ltr"} sx={{ px: 3, pb: 2 }}>
            <AppButton type="submit" variant="contained" loading={submitting}>
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
      )}
    </AppDialog>
  );
}
