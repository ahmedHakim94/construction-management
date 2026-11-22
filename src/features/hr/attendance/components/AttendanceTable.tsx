import { useMemo } from "react";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import { AppActions } from "@/components/ui/AppActions";
import type { EmployeeAttendanceSummary } from "../types";

interface AttendanceTableProps {
  rows: EmployeeAttendanceSummary[];
  canManage: boolean;
  onViewDetails: (employee: EmployeeAttendanceSummary) => void;
  onEdit: (employee: EmployeeAttendanceSummary) => void;
}

export function AttendanceTable({
  rows,
  canManage,
  onViewDetails,
  onEdit,
}: AttendanceTableProps) {
  const { t } = useTranslation(["hr", "common"]);

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }),
    [],
  );

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "code",
        headerName: t("hr:employeeCode"),
        width: 120,
      },
      {
        field: "name",
        headerName: t("hr:employeeName"),
        flex: 1.3,
        minWidth: 170,
      },
      {
        field: "jobTitle",
        headerName: t("hr:jobTitle"),
        flex: 1.1,
        minWidth: 150,
      },
      {
        field: "presentDays",
        headerName: t("hr:attendanceDays"),
        flex: 0.9,
        minWidth: 130,
        renderCell: ({ row }: { row: EmployeeAttendanceSummary }) => (
          <AppBadge
            label={numberFormatter.format(row.presentDays)}
            color="success"
            size="small"
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          />
        ),
      },
      {
        field: "absentDays",
        headerName: t("hr:recordedAbsences"),
        flex: 0.9,
        minWidth: 130,
        renderCell: ({ row }: { row: EmployeeAttendanceSummary }) => (
          <Typography
            variant="body2"
            fontWeight={600}
            color={row.absentDays > 0 ? "error.main" : "text.secondary"}
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {numberFormatter.format(row.absentDays)}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: t("common:actions"),
        sortable: false,
        filterable: false,
        width: 120,
        renderCell: ({ row }: { row: EmployeeAttendanceSummary }) => (
          <AppActions
            onView={canManage ? () => onViewDetails(row) : undefined}
            onEdit={canManage ? () => onEdit(row) : undefined}
            viewTooltip={t("hr:absenceDetails")}
            editTooltip={t("hr:editAttendance")}
          />
        ),
      },
    ],
    [t, numberFormatter, canManage, onViewDetails, onEdit],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      showPagination
      emptyMessage={t("hr:noAttendanceEmployees")}
    />
  );
}
