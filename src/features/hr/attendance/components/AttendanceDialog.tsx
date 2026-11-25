import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import {
  AppButton,
  AppDialog,
  AppInput,
  AppSelect,
  DialogLoadingOverlay,
} from "@/components/ui";
import { AppDatePicker } from "@/components/ui/AppDatePicker/AppDatePicker";
import type { SelectOption } from "@/components/ui/AppSelect";
import { useInitialEditLoading } from "@/hooks/useInitialEditLoading";
import { useGetEmployeesQuery } from "@/features/hr/employees/services/employees.api";
import { useGetAllProjectsQuery } from "@/features/settings/projects/services/projects.api";
import { useGetEmployeeAttendanceDetailsQuery } from "../services/attendance.api";
import type {
  AttendanceDialogMode,
  AttendanceProject,
  AttendanceSavePayload,
  AttendanceStatus,
  EmployeeAttendanceRecord,
  EmployeeAttendanceSummary,
} from "../types";

interface DialogEmployeeItem {
  id: number;
  name: string;
  jobTitle: string;
}

const EMPTY_EDIT_RECORDS: EmployeeAttendanceRecord[] = [];

const LTR_NUM_SX = {
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
} as const;

interface AttendanceDialogProps {
  open: boolean;
  mode: AttendanceDialogMode;
  selectedMonth: string; // YYYY-MM
  targetEmployee?: EmployeeAttendanceSummary;
  isSuperAdmin: boolean;
  adminProjectId: number | null;
  submitting?: boolean;
  onClose: () => void;
  onSave: (payload: AttendanceSavePayload) => Promise<void> | void;
}

export function AttendanceDialog({
  open,
  mode,
  selectedMonth,
  targetEmployee,
  isSuperAdmin,
  adminProjectId,
  submitting = false,
  onClose,
  onSave,
}: AttendanceDialogProps) {
  const { t, i18n } = useTranslation(["hr", "common"]);
  const isArabic = i18n.language === "ar";

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [statusMap, setStatusMap] = useState<
    Record<number, AttendanceStatus | "">
  >({});
  const [projectError, setProjectError] = useState("");
  const [dateError, setDateError] = useState("");
  const [recordsError, setRecordsError] = useState("");
  const initializedEditSelectionRef = useRef(false);

  const formattedDate =
    selectedDate && selectedDate.isValid()
      ? selectedDate.format("YYYY-MM-DD")
      : "";

  const activeQueryMonth =
    selectedDate && selectedDate.isValid()
      ? selectedDate.format("YYYY-MM")
      : selectedMonth;

  const {
    data: rawProjects,
    isFetching: projectsLoading,
    isError: projectsError,
  } = useGetAllProjectsQuery(undefined, {
    skip: !open,
  });

  // In Edit mode, load the employee's real monthly records so we preload saved statuses & cross-project state
  const {
    data: editEmployeeDetails,
    isFetching: editDetailsLoading,
    isError: editDetailsError,
  } = useGetEmployeeAttendanceDetailsQuery(
    {
      employeeId: targetEmployee?.id ?? 0,
      month: activeQueryMonth,
    },
    {
      skip: !open || mode !== "edit" || !targetEmployee,
    },
  );

  const isInitialEditLoading = useInitialEditLoading({
    open,
    isEdit: mode === "edit",
    recordKey: `${targetEmployee?.id ?? ""}-${selectedMonth}`,
    isFetching: projectsLoading || editDetailsLoading,
    isReady: Boolean(rawProjects) && Boolean(editEmployeeDetails),
    hasError: projectsError || editDetailsError,
  });

  const editRecords = editEmployeeDetails?.records ?? EMPTY_EDIT_RECORDS;

  const allProjects = useMemo<AttendanceProject[]>(
    () =>
      (rawProjects ?? []).map((project) => ({
        id: Number(project.id),
        name: project.name,
      })),
    [rawProjects],
  );

  const availableProjects = useMemo<AttendanceProject[]>(() => {
    if (!isSuperAdmin) {
      return allProjects.filter((project) => project.id === adminProjectId);
    }

    if (mode === "edit" && targetEmployee) {
      if (targetEmployee.projects.length > 0) {
        return targetEmployee.projects;
      }
      const allowedSet = new Set(targetEmployee.projectIds);
      return allProjects.filter((project) => allowedSet.has(project.id));
    }

    return allProjects;
  }, [isSuperAdmin, adminProjectId, mode, targetEmployee, allProjects]);

  const projectOptions = useMemo<SelectOption[]>(
    () =>
      availableProjects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    [availableProjects],
  );

  const lockedAdminProjectName = useMemo(() => {
    const found = allProjects.find((project) => project.id === adminProjectId);
    if (found) return found.name;
    return adminProjectId ? `#${adminProjectId}` : "";
  }, [allProjects, adminProjectId]);

  const effectiveProjectId = isSuperAdmin
    ? selectedProjectId
      ? Number(selectedProjectId)
      : null
    : adminProjectId;

  // Fetch assigned employees for the chosen project in Register mode
  const { data: projectEmployeesData, isFetching: employeesLoading } =
    useGetEmployeesQuery(
      {
        page: 1,
        limit: 100,
        project_id:
          isSuperAdmin && effectiveProjectId ? effectiveProjectId : undefined,
      },
      {
        skip: !open || mode === "edit" || !effectiveProjectId,
      },
    );

  // Initialize dialog state on open
  useEffect(() => {
    if (!open) return;

    setProjectError("");
    setDateError("");
    setRecordsError("");
    setStatusMap({});
    initializedEditSelectionRef.current = false;

    const today = dayjs();
    const initialDate =
      today.format("YYYY-MM") === selectedMonth
        ? today
        : dayjs(`${selectedMonth}-01`);

    setSelectedDate(initialDate.isValid() ? initialDate : today);

    if (!isSuperAdmin) {
      setSelectedProjectId(adminProjectId ?? "");
      return;
    }

    if (mode === "edit" && targetEmployee) {
      const firstProjectId =
        targetEmployee.projects[0]?.id ?? targetEmployee.projectIds[0] ?? "";
      setSelectedProjectId(firstProjectId);
      return;
    }

    setSelectedProjectId("");
  }, [open, mode, targetEmployee, selectedMonth, isSuperAdmin, adminProjectId]);

  // In Edit mode, once saved records arrive on open, focus the most recent recorded date & project (preferring PRESENT on that date)
  useEffect(() => {
    if (
      !open ||
      mode !== "edit" ||
      !targetEmployee ||
      editDetailsLoading ||
      initializedEditSelectionRef.current
    ) {
      return;
    }

    initializedEditSelectionRef.current = true;
    if (editRecords.length === 0) return;

    const latestDate = editRecords[0].attendanceDate;
    const recordsOnLatestDate = editRecords.filter(
      (rec) => rec.attendanceDate === latestDate,
    );
    const preferredRecord =
      recordsOnLatestDate.find((rec) => rec.status === "PRESENT") ??
      recordsOnLatestDate[0];

    if (preferredRecord) {
      setSelectedDate(dayjs(preferredRecord.attendanceDate));
      if (isSuperAdmin) {
        setSelectedProjectId(preferredRecord.projectId);
      }
      setStatusMap({ [targetEmployee.id]: preferredRecord.status });
    }
  }, [open, mode, targetEmployee, editDetailsLoading, editRecords, isSuperAdmin]);

  // In Edit mode, keep the radio selection synced whenever date or project changes
  useEffect(() => {
    if (
      !open ||
      mode !== "edit" ||
      !targetEmployee ||
      !formattedDate ||
      !effectiveProjectId
    ) {
      return;
    }

    const matching = editRecords.find(
      (rec) =>
        rec.attendanceDate === formattedDate &&
        rec.projectId === effectiveProjectId,
    );

    setStatusMap({
      [targetEmployee.id]: matching ? matching.status : "",
    });
  }, [
    open,
    mode,
    targetEmployee,
    formattedDate,
    effectiveProjectId,
    editRecords,
  ]);

  const recordsOnSelectedDate = useMemo(() => {
    if (mode !== "edit" || !formattedDate) return EMPTY_EDIT_RECORDS;
    return editRecords.filter((rec) => rec.attendanceDate === formattedDate);
  }, [mode, formattedDate, editRecords]);

  const otherProjectPresentOnDate = useMemo(() => {
    if (!isSuperAdmin || mode !== "edit" || !effectiveProjectId) return false;
    return recordsOnSelectedDate.some(
      (rec) =>
        rec.projectId !== effectiveProjectId && rec.status === "PRESENT",
    );
  }, [isSuperAdmin, mode, effectiveProjectId, recordsOnSelectedDate]);

  const displayedEmployees = useMemo<DialogEmployeeItem[]>(() => {
    if (mode === "edit" && targetEmployee) {
      return [
        {
          id: targetEmployee.id,
          name: targetEmployee.name,
          jobTitle: targetEmployee.jobTitle,
        },
      ];
    }

    if (!effectiveProjectId) return [];

    return (projectEmployeesData?.data ?? []).map((emp) => ({
      id: emp.id,
      name: emp.name,
      jobTitle: emp.jobTitle,
    }));
  }, [mode, targetEmployee, effectiveProjectId, projectEmployeesData?.data]);

  const handleSelectAllPresent = () => {
    if (displayedEmployees.length === 0) return;
    setRecordsError("");
    setStatusMap((prev) => {
      const next = { ...prev };
      displayedEmployees.forEach((employee) => {
        next[employee.id] = "PRESENT";
      });
      return next;
    });
  };

  const handleStatusChange = (employeeId: number, status: AttendanceStatus) => {
    if (recordsError) setRecordsError("");
    setStatusMap((prev) => ({
      ...prev,
      [employeeId]: status,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    let hasError = false;

    if (!formattedDate) {
      setDateError(t("hr:attendanceDateRequired"));
      hasError = true;
    } else {
      setDateError("");
    }

    if (!effectiveProjectId || Number.isNaN(effectiveProjectId)) {
      setProjectError(t("hr:attendanceProjectRequired"));
      hasError = true;
    } else {
      setProjectError("");
    }

    const records: AttendanceSavePayload["records"] = [];
    displayedEmployees.forEach((employee) => {
      const status = statusMap[employee.id];
      if (status === "PRESENT" || status === "ABSENT") {
        records.push({ employee_id: employee.id, status });
      }
    });

    if (records.length === 0) {
      setRecordsError(t("hr:attendanceRecordsRequired"));
      hasError = true;
    } else {
      setRecordsError("");
    }

    if (hasError || !effectiveProjectId) return;

    await onSave({
      mode,
      projectId: effectiveProjectId,
      attendanceDate: formattedDate,
      records,
    });
  };

  const isLoadingList =
    mode === "register" ? employeesLoading : editDetailsLoading;

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
        <span>
          {mode === "edit"
            ? t("hr:editAttendance")
            : t("hr:registerAttendance")}
        </span>
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

      <DialogContent
        dir={isArabic ? "rtl" : "ltr"}
        sx={{
          position: "relative",
          minHeight: isInitialEditLoading ? 260 : undefined,
        }}
      >
        <DialogLoadingOverlay loading={isInitialEditLoading} />

        <Stack spacing={2.25} sx={{ pt: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
              alignItems: "start",
            }}
          >
            <AppDatePicker
              label={t("hr:attendanceDate")}
              value={selectedDate}
              onChange={(value) => {
                initializedEditSelectionRef.current = true;
                setSelectedDate(value);
                if (dateError) setDateError("");
              }}
              error={Boolean(dateError)}
              helperText={dateError}
              fullWidth
            />

            {isSuperAdmin ? (
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
                    ? `* ${t("hr:attendanceProject")}`
                    : `${t("hr:attendanceProject")} *`}
                </Typography>

                <AppSelect
                  label=""
                  required
                  options={projectOptions}
                  value={selectedProjectId}
                  onChange={(value) => {
                    initializedEditSelectionRef.current = true;
                    const nextId = Number(value);
                    setSelectedProjectId(nextId);
                    if (mode === "register") {
                      setStatusMap({});
                    }
                    if (projectError) setProjectError("");
                    if (recordsError) setRecordsError("");
                  }}
                  loading={projectsLoading}
                  placeholder={t("hr:selectAttendanceProject")}
                  error={projectError}
                />
              </Box>
            ) : (
              <AppInput
                label={t("hr:attendanceProject")}
                value={lockedAdminProjectName}
                disabled
              />
            )}
          </Box>

          {/* In Edit mode for SuperAdmin, show all recorded project statuses on this date */}
          {mode === "edit" &&
          isSuperAdmin &&
          recordsOnSelectedDate.length > 0 ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ display: "block", mb: 1 }}
              >
                {t("hr:recordedOnDate")}
              </Typography>
              <Stack
                direction="row"
                spacing={0.85}
                useFlexGap
                flexWrap="wrap"
              >
                {recordsOnSelectedDate.map((rec) => {
                  const isSelected = rec.projectId === effectiveProjectId;
                  return (
                    <Chip
                      key={rec.id}
                      size="small"
                      clickable
                      onClick={() => {
                        initializedEditSelectionRef.current = true;
                        setSelectedProjectId(rec.projectId);
                      }}
                      color={rec.status === "PRESENT" ? "success" : "error"}
                      variant={isSelected ? "filled" : "outlined"}
                      label={`${rec.projectName}: ${t(
                        rec.status === "PRESENT" ? "hr:present" : "hr:absent",
                      )}`}
                      sx={{ fontWeight: isSelected ? 700 : 500 }}
                    />
                  );
                })}
              </Stack>
              {otherProjectPresentOnDate ? (
                <Alert severity="info" sx={{ mt: 1.25, py: 0.25 }}>
                  {t("hr:presentPriorityHint")}
                </Alert>
              ) : null}
            </Box>
          ) : null}

          <Divider />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              {t("hr:employees")}
            </Typography>

            {displayedEmployees.length > 0 && !isLoadingList ? (
              <AppButton
                size="small"
                variant="outlined"
                onClick={handleSelectAllPresent}
                disabled={submitting}
              >
                {t("hr:selectAllPresent")}
              </AppButton>
            ) : null}
          </Box>

          {recordsError ? (
            <Alert severity="error" sx={{ py: 0.25 }}>
              {recordsError}
            </Alert>
          ) : null}

          {!effectiveProjectId && isSuperAdmin ? (
            <Typography variant="body2" color="text.secondary">
              {t("hr:selectProjectToLoadEmployees")}
            </Typography>
          ) : isLoadingList ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress size={26} />
            </Box>
          ) : displayedEmployees.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("hr:noEmployeesInProject")}
            </Typography>
          ) : (
            <Stack spacing={1.25} sx={{ maxHeight: 320, overflowY: "auto" }}>
              {displayedEmployees.map((employee) => {
                const value = statusMap[employee.id] ?? "";

                return (
                  <Box
                    key={employee.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                      p: 1.25,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {employee.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                          #{employee.id}
                        </Box>
                        {employee.jobTitle ? ` • ${employee.jobTitle}` : ""}
                      </Typography>
                    </Box>

                    <RadioGroup
                      row
                      value={value}
                      onChange={(event) =>
                        handleStatusChange(
                          employee.id,
                          event.target.value as AttendanceStatus,
                        )
                      }
                    >
                      <FormControlLabel
                        value="PRESENT"
                        disabled={submitting}
                        control={<Radio size="small" color="success" />}
                        label={t("hr:present")}
                      />
                      <FormControlLabel
                        value="ABSENT"
                        disabled={submitting}
                        control={<Radio size="small" color="error" />}
                        label={t("hr:absent")}
                      />
                    </RadioGroup>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions dir={isArabic ? "rtl" : "ltr"} sx={{ px: 2.5, py: 1.5 }}>
        <AppButton
          variant="contained"
          onClick={handleSubmit}
          loading={submitting}
          disabled={
            isInitialEditLoading ||
            isLoadingList ||
            displayedEmployees.length === 0
          }
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
    </AppDialog>
  );
}
