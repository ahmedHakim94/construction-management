import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppCard, AppPageHeader, AppSelect } from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import { useAppSelector } from "@/app/store/hooks";
import { MOCK_EMPLOYEES } from "@/features/hr/employees/mock/employees.mock";
import {
  MOCK_ATTENDANCE_RECORDS,
  MONTHLY_PAID_ABSENCE_ALLOWANCE,
} from "@/features/hr/attendance/mock/attendance.mock";
import { LeavesTable } from "../components/LeavesTable";
import type { EmployeeLeaveSummary } from "../types";

export function LeavesPage() {
  const { t } = useTranslation(["hr", "common"]);
  const user = useAppSelector((state) => state.auth.user);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const adminProjectId =
    isAdmin && user?.project_id != null ? Number(user.project_id) : null;

  const [selectedMonthDate, setSelectedMonthDate] = useState<Dayjs | null>(
    dayjs(),
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");

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

  const employeeOptions = useMemo<SelectOption[]>(
    () => [
      { value: "", label: t("hr:allEmployees") },
      ...scopedEmployees.map((employee) => ({
        value: employee.id,
        label: `${employee.name} (${employee.code})`,
      })),
    ],
    [scopedEmployees, t],
  );

  const rows = useMemo<EmployeeLeaveSummary[]>(() => {
    // Collect distinct manually-recorded ABSENT dates per employee for the selected month.
    // SuperAdmin aggregates across all projects combined; Admin considers only their assigned project.
    const absentDatesByEmployee = new Map<number, Set<string>>();

    MOCK_ATTENDANCE_RECORDS.forEach((record) => {
      if (record.status !== "ABSENT") return;
      if (!record.date.startsWith(selectedMonth)) return;

      if (isAdmin) {
        if (adminProjectId === null || record.projectId !== adminProjectId) {
          return;
        }
      } else if (!isSuperAdmin) {
        return;
      }

      let dates = absentDatesByEmployee.get(record.employeeId);
      if (!dates) {
        dates = new Set<string>();
        absentDatesByEmployee.set(record.employeeId, dates);
      }
      dates.add(record.date);
    });

    return scopedEmployees
      .filter((employee) =>
        selectedEmployeeId === ""
          ? true
          : employee.id === Number(selectedEmployeeId),
      )
      .map((employee) => {
        const totalLeaveDays = absentDatesByEmployee.get(employee.id)?.size ?? 0;
        const paidLeaveDays = Math.min(
          totalLeaveDays,
          MONTHLY_PAID_ABSENCE_ALLOWANCE,
        );
        const unpaidLeaveDays = Math.max(
          totalLeaveDays - MONTHLY_PAID_ABSENCE_ALLOWANCE,
          0,
        );

        return {
          id: employee.id,
          employeeName: employee.name,
          paidLeaveDays,
          unpaidLeaveDays,
          totalLeaveDays,
        };
      });
  }, [
    scopedEmployees,
    selectedMonth,
    selectedEmployeeId,
    isSuperAdmin,
    isAdmin,
    adminProjectId,
  ]);

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("hr:leaves")}
          description={t("hr:leavesDescription")}
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
                    sx: { minWidth: { xs: "100%", sm: 190 } },
                  },
                }}
              />
            </LocalizationProvider>

            <Box sx={{ minWidth: { xs: "100%", sm: 240 } }}>
              <AppSelect
                options={employeeOptions}
                value={selectedEmployeeId}
                onChange={(value) =>
                  setSelectedEmployeeId(value === "" ? "" : Number(value))
                }
                placeholder={t("hr:allEmployees")}
              />
            </Box>
          </Box>

          <LeavesTable rows={rows} />
        </AppCard>
      </Box>
    </PageContainer>
  );
}
