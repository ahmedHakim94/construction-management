import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppSearchInput } from "@/components/ui/AppSearchInput";
import { useAppSelector } from "@/app/store/hooks";
import { useDialog } from "@/hooks/useDialog";
import {
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE_PROJECTS,
} from "@/features/hr/employees/mock/employees.mock";
import type { Employee } from "@/features/hr/employees/types";
import { AttendanceDetailsDialog } from "../components/AttendanceDetailsDialog";
import { AttendanceDialog } from "../components/AttendanceDialog";
import { AttendanceTable } from "../components/AttendanceTable";
import {
  MOCK_ATTENDANCE_RECORDS,
  buildAttendanceRecordId,
} from "../mock/attendance.mock";
import type {
  AttendanceDialogMode,
  AttendanceRecord,
  AttendanceSavePayload,
  EmployeeAttendanceSummary,
} from "../types";

export function AttendancePage() {
  const { t } = useTranslation(["hr", "common"]);
  const user = useAppSelector((state) => state.auth.user);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const canManage = isSuperAdmin || isAdmin;
  const adminProjectId =
    isAdmin && user?.project_id != null ? Number(user.project_id) : null;

  const [selectedMonthDate, setSelectedMonthDate] = useState<Dayjs | null>(
    dayjs(),
  );
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>(
    MOCK_ATTENDANCE_RECORDS,
  );
  const [dialogMode, setDialogMode] =
    useState<AttendanceDialogMode>("register");
  const [selectedEmployee, setSelectedEmployee] = useState<
    Employee | undefined
  >();
  const [detailsEmployee, setDetailsEmployee] = useState<
    EmployeeAttendanceSummary | undefined
  >();

  const registerDialog = useDialog();
  const detailsDialog = useDialog();

  const selectedMonth =
    selectedMonthDate && selectedMonthDate.isValid()
      ? selectedMonthDate.format("YYYY-MM")
      : dayjs().format("YYYY-MM");

  const scopedEmployees = useMemo(() => {
    if (isSuperAdmin) return MOCK_EMPLOYEES;
    if (isAdmin && adminProjectId !== null) {
      return MOCK_EMPLOYEES.filter((employee) =>
        employee.projectIds.includes(adminProjectId),
      );
    }
    return [];
  }, [isSuperAdmin, isAdmin, adminProjectId]);

  const employeeById = useMemo(
    () => new Map(scopedEmployees.map((employee) => [employee.id, employee])),
    [scopedEmployees],
  );

  const monthScopedRecords = useMemo(
    () =>
      records.filter((record) => {
        if (!record.date.startsWith(selectedMonth)) return false;
        if (isSuperAdmin) return true;
        if (isAdmin && adminProjectId !== null) {
          return record.projectId === adminProjectId;
        }
        return false;
      }),
    [records, selectedMonth, isSuperAdmin, isAdmin, adminProjectId],
  );

  const rows = useMemo<EmployeeAttendanceSummary[]>(() => {
    const presentDatesByEmployee = new Map<number, Set<string>>();
    const absentDatesByEmployee = new Map<number, Set<string>>();

    monthScopedRecords.forEach((record) => {
      const targetMap =
        record.status === "PRESENT"
          ? presentDatesByEmployee
          : absentDatesByEmployee;

      let dates = targetMap.get(record.employeeId);
      if (!dates) {
        dates = new Set<string>();
        targetMap.set(record.employeeId, dates);
      }
      dates.add(record.date);
    });

    const query = search.trim().toLowerCase();

    return scopedEmployees
      .filter((employee) => {
        if (!query) return true;
        return (
          employee.code.toLowerCase().includes(query) ||
          employee.name.toLowerCase().includes(query) ||
          employee.jobTitle.toLowerCase().includes(query)
        );
      })
      .map((employee) => ({
        id: employee.id,
        code: employee.code,
        name: employee.name,
        jobTitle: employee.jobTitle,
        projectIds: employee.projectIds,
        // Unique dates ensure attending multiple projects on the same day counts as 1 overall day.
        presentDays: presentDatesByEmployee.get(employee.id)?.size ?? 0,
        absentDays: absentDatesByEmployee.get(employee.id)?.size ?? 0,
      }));
  }, [scopedEmployees, monthScopedRecords, search]);

  const detailsAbsenceRecords = useMemo(() => {
    if (!detailsEmployee) return [];
    return monthScopedRecords.filter(
      (record) =>
        record.employeeId === detailsEmployee.id && record.status === "ABSENT",
    );
  }, [detailsEmployee, monthScopedRecords]);

  const handleOpenRegister = () => {
    if (!canManage) return;
    setDialogMode("register");
    setSelectedEmployee(undefined);
    registerDialog.openDialog();
  };

  const handleOpenEdit = (summary: EmployeeAttendanceSummary) => {
    if (!canManage) return;
    const employee = employeeById.get(summary.id);
    if (!employee) return;
    setDialogMode("edit");
    setSelectedEmployee(employee);
    registerDialog.openDialog();
  };

  const handleOpenDetails = (summary: EmployeeAttendanceSummary) => {
    if (!canManage) return;
    setDetailsEmployee(summary);
    detailsDialog.openDialog();
  };

  const handleCloseRegisterDialog = () => {
    registerDialog.closeDialog();
    setSelectedEmployee(undefined);
  };

  const handleCloseDetailsDialog = () => {
    detailsDialog.closeDialog();
    setDetailsEmployee(undefined);
  };

  const handleSaveAttendance = (payload: AttendanceSavePayload) => {
    if (!canManage) return;

    // Enforce Admin project boundary
    if (isAdmin && payload.projectId !== adminProjectId) return;

    setRecords((prev) => {
      const recordMap = new Map(prev.map((record) => [record.id, record]));

      // In Edit mode, if date or project changed, remove the original record to prevent stale duplicates.
      if (payload.mode === "edit" && payload.replaceRecord) {
        const oldId = buildAttendanceRecordId(
          payload.replaceRecord.employeeId,
          payload.replaceRecord.projectId,
          payload.replaceRecord.date,
        );
        recordMap.delete(oldId);
      }

      payload.entries.forEach(({ employeeId, status }) => {
        // In Edit mode, only allow modifying the targeted employee.
        if (
          payload.mode === "edit" &&
          selectedEmployee &&
          employeeId !== selectedEmployee.id
        ) {
          return;
        }

        const id = buildAttendanceRecordId(
          employeeId,
          payload.projectId,
          payload.date,
        );
        recordMap.set(id, {
          id,
          employeeId,
          projectId: payload.projectId,
          date: payload.date,
          status,
        });
      });

      return Array.from(recordMap.values());
    });

    handleCloseRegisterDialog();
  };

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("hr:attendance")}
          description={t("hr:attendanceDescription")}
          actions={
            canManage ? (
              <AppButton
                variant="contained"
                startIcon={<EventAvailableOutlined />}
                onClick={handleOpenRegister}
              >
                {t("hr:registerAttendance")}
              </AppButton>
            ) : undefined
          }
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("hr:selectMonth")}
                views={["year", "month"]}
                openTo="month"
                format="YYYY-MM"
                value={selectedMonthDate}
                onChange={(value) => setSelectedMonthDate(value)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { minWidth: 190 },
                  },
                }}
              />
            </LocalizationProvider>

            <AppSearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("hr:searchAttendance")}
            />
          </Box>

          <AttendanceTable
            rows={rows}
            canManage={canManage}
            onViewDetails={handleOpenDetails}
            onEdit={handleOpenEdit}
          />
        </AppCard>

        <AttendanceDialog
          open={registerDialog.open}
          mode={dialogMode}
          selectedMonth={selectedMonth}
          targetEmployee={selectedEmployee}
          employees={scopedEmployees}
          projects={MOCK_EMPLOYEE_PROJECTS}
          records={records}
          isSuperAdmin={isSuperAdmin}
          adminProjectId={adminProjectId}
          onClose={handleCloseRegisterDialog}
          onSave={handleSaveAttendance}
        />

        <AttendanceDetailsDialog
          open={detailsDialog.open}
          employee={detailsEmployee}
          monthLabel={selectedMonth}
          absenceRecords={detailsAbsenceRecords}
          projects={MOCK_EMPLOYEE_PROJECTS}
          onClose={handleCloseDetailsDialog}
        />
      </Box>
    </PageContainer>
  );
}
