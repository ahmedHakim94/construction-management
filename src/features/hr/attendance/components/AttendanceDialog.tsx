import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog, AppInput, AppSelect } from "@/components/ui";
import { AppDatePicker } from "@/components/ui/AppDatePicker/AppDatePicker";
import type { SelectOption } from "@/components/ui/AppSelect";
import type { Employee, EmployeeProject } from "@/features/hr/employees/types";
import type {
  AttendanceDialogMode,
  AttendanceRecord,
  AttendanceSavePayload,
  AttendanceStatus,
} from "../types";

interface AttendanceDialogProps {
  open: boolean;
  mode: AttendanceDialogMode;
  selectedMonth: string; // YYYY-MM
  targetEmployee?: Employee;
  employees: Employee[];
  projects: EmployeeProject[];
  records: AttendanceRecord[];
  isSuperAdmin: boolean;
  adminProjectId: number | null;
  onClose: () => void;
  onSave: (payload: AttendanceSavePayload) => void;
}

export function AttendanceDialog({
  open,
  mode,
  selectedMonth,
  targetEmployee,
  employees,
  projects,
  records,
  isSuperAdmin,
  adminProjectId,
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

  // Tracks the originally loaded record in Edit mode so moving date/project replaces it cleanly without leaving stale duplicates.
  const originalEditRecordRef = useRef<{
    employeeId: number;
    projectId: number;
    date: string;
  } | null>(null);

  const availableProjects = useMemo(() => {
    if (!isSuperAdmin) {
      return projects.filter((project) => project.id === adminProjectId);
    }
    if (mode === "edit" && targetEmployee) {
      return projects.filter((project) =>
        targetEmployee.projectIds.includes(project.id),
      );
    }
    return projects;
  }, [isSuperAdmin, adminProjectId, mode, targetEmployee, projects]);

  const projectOptions = useMemo<SelectOption[]>(
    () =>
      availableProjects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    [availableProjects],
  );

  const lockedAdminProjectName = useMemo(
    () =>
      projects.find((project) => project.id === adminProjectId)?.name ?? "",
    [projects, adminProjectId],
  );

  // Initialize dialog state on open
  useEffect(() => {
    if (!open) return;

    setProjectError("");
    setDateError("");
    originalEditRecordRef.current = null;

    if (mode === "edit" && targetEmployee) {
      const matchingMonthRecords = records
        .filter(
          (record) =>
            record.employeeId === targetEmployee.id &&
            record.date.startsWith(selectedMonth) &&
            (isSuperAdmin || record.projectId === adminProjectId),
        )
        .sort((a, b) => b.date.localeCompare(a.date));

      const latestRecord = matchingMonthRecords[0];

      if (latestRecord) {
        setSelectedDate(dayjs(latestRecord.date));
        setSelectedProjectId(latestRecord.projectId);
        setStatusMap({ [targetEmployee.id]: latestRecord.status });
        originalEditRecordRef.current = {
          employeeId: targetEmployee.id,
          projectId: latestRecord.projectId,
          date: latestRecord.date,
        };
      } else {
        const defaultProjectId = isSuperAdmin
          ? (targetEmployee.projectIds[0] ?? "")
          : (adminProjectId ?? "");
        setSelectedDate(dayjs());
        setSelectedProjectId(defaultProjectId);
        setStatusMap({});
      }
      return;
    }

    // Register mode
    setSelectedDate(dayjs());
    setSelectedProjectId(isSuperAdmin ? "" : (adminProjectId ?? ""));
    setStatusMap({});
  }, [
    open,
    mode,
    targetEmployee,
    selectedMonth,
    isSuperAdmin,
    adminProjectId,
    records,
  ]);

  const displayedEmployees = useMemo(() => {
    if (mode === "edit" && targetEmployee) {
      return [targetEmployee];
    }
    if (!selectedProjectId) return [];
    return employees.filter((employee) =>
      employee.projectIds.includes(Number(selectedProjectId)),
    );
  }, [mode, targetEmployee, selectedProjectId, employees]);

  const formattedDate =
    selectedDate && selectedDate.isValid()
      ? selectedDate.format("YYYY-MM-DD")
      : "";

  // Preload existing statuses whenever (project, date) changes
  useEffect(() => {
    if (!open || !selectedProjectId || !formattedDate) return;

    const projectIdNum = Number(selectedProjectId);
    const nextMap: Record<number, AttendanceStatus | ""> = {};

    displayedEmployees.forEach((employee) => {
      const existing = records.find(
        (record) =>
          record.employeeId === employee.id &&
          record.projectId === projectIdNum &&
          record.date === formattedDate,
      );
      if (existing) {
        nextMap[employee.id] = existing.status;
      }
    });

    if (mode === "edit" && targetEmployee) {
      // If an existing record exists at the newly selected (project, date), preload it;
      // otherwise preserve the current selection so the user can move the original record cleanly.
      if (nextMap[targetEmployee.id]) {
        setStatusMap(nextMap);
      }
      return;
    }

    setStatusMap(nextMap);
  }, [
    open,
    mode,
    targetEmployee,
    selectedProjectId,
    formattedDate,
    displayedEmployees,
    records,
  ]);

  const handleSelectAllPresent = () => {
    if (displayedEmployees.length === 0) return;
    setStatusMap((prev) => {
      const next = { ...prev };
      displayedEmployees.forEach((employee) => {
        next[employee.id] = "PRESENT";
      });
      return next;
    });
  };

  const handleStatusChange = (employeeId: number, status: AttendanceStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [employeeId]: status,
    }));
  };

  const handleSubmit = () => {
    let hasError = false;

    if (!formattedDate) {
      setDateError(t("hr:attendanceDateRequired"));
      hasError = true;
    } else {
      setDateError("");
    }

    const effectiveProjectId = isSuperAdmin
      ? Number(selectedProjectId)
      : Number(adminProjectId);

    if (!effectiveProjectId || Number.isNaN(effectiveProjectId)) {
      setProjectError(t("hr:attendanceProjectRequired"));
      hasError = true;
    } else {
      setProjectError("");
    }

    if (hasError) return;

    const entries: AttendanceSavePayload["entries"] = [];
    displayedEmployees.forEach((employee) => {
      const status = statusMap[employee.id];
      if (status === "PRESENT" || status === "ABSENT") {
        entries.push({ employeeId: employee.id, status });
      }
    });

    const original = originalEditRecordRef.current;
    const shouldReplaceOld =
      mode === "edit" &&
      original !== null &&
      entries.length > 0 &&
      (original.projectId !== effectiveProjectId ||
        original.date !== formattedDate);

    onSave({
      mode,
      projectId: effectiveProjectId,
      date: formattedDate,
      entries,
      replaceRecord: shouldReplaceOld ? original : undefined,
    });
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle dir={isArabic ? "rtl" : "ltr"}>
        {mode === "edit"
          ? t("hr:editAttendance")
          : t("hr:registerAttendance")}
      </DialogTitle>

      <DialogContent dir={isArabic ? "rtl" : "ltr"}>
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
                setSelectedDate(value);
                if (dateError) setDateError("");
              }}
              error={Boolean(dateError)}
              helperText={dateError}
              fullWidth
            />

            {isSuperAdmin ? (
              <AppSelect
                label={t("hr:attendanceProject")}
                required
                options={projectOptions}
                value={selectedProjectId}
                onChange={(value) => {
                  setSelectedProjectId(Number(value));
                  if (projectError) setProjectError("");
                }}
                placeholder={t("hr:selectAttendanceProject")}
                error={projectError}
              />
            ) : (
              <AppInput
                label={t("hr:attendanceProject")}
                value={lockedAdminProjectName}
                disabled
              />
            )}
          </Box>

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

            {displayedEmployees.length > 0 && (
              <AppButton
                size="small"
                variant="outlined"
                onClick={handleSelectAllPresent}
              >
                {t("hr:selectAllPresent")}
              </AppButton>
            )}
          </Box>

          {!selectedProjectId && isSuperAdmin ? (
            <Typography variant="body2" color="text.secondary">
              {t("hr:selectProjectToLoadEmployees")}
            </Typography>
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
                        {employee.code} • {employee.jobTitle}
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
                        control={<Radio size="small" color="success" />}
                        label={t("hr:present")}
                      />
                      <FormControlLabel
                        value="ABSENT"
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

      <DialogActions dir={isArabic ? "rtl" : "ltr"} sx={{ px: 3, pb: 2 }}>
        <AppButton
          variant="contained"
          onClick={handleSubmit}
          disabled={displayedEmployees.length === 0}
        >
          {t("common:save")}
        </AppButton>
        <AppButton variant="outlined" color="inherit" onClick={onClose}>
          {t("common:cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
