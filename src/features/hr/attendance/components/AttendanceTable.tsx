import { memo, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import { AppActions } from "@/components/ui/AppActions";
import type { TablePaginationProps } from "@/types";
import type { EmployeeAttendanceSummary } from "../types";

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const LTR_NUM_SX = {
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
} as const;

interface AttendanceTableProps {
  rows: EmployeeAttendanceSummary[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  canView: boolean;
  canManage: boolean;
  onViewDetails: (employee: EmployeeAttendanceSummary) => void;
  onEdit: (employee: EmployeeAttendanceSummary) => void;
}

export const AttendanceTable = memo(function AttendanceTable({
  rows,
  loading = false,
  pagination,
  canView,
  canManage,
  onViewDetails,
  onEdit,
}: AttendanceTableProps) {
  const { t } = useTranslation(["hr", "common"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "id",
        headerName: t("hr:employeeCode"),
        width: 110,
        renderCell: ({ row }: { row: EmployeeAttendanceSummary }) => (
          <Typography variant="body2" fontWeight={600}>
            <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
              {row.id}
            </Box>
          </Typography>
        ),
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
        renderCell: ({ row }: { row: EmployeeAttendanceSummary }) => (
          <Typography
            variant="body2"
            color={row.jobTitle ? "text.primary" : "text.secondary"}
          >
            {row.jobTitle || "—"}
          </Typography>
        ),
      },
      {
        field: "presentDays",
        headerName: t("hr:attendanceDays"),
        flex: 0.9,
        minWidth: 130,
        renderCell: ({ row }: { row: EmployeeAttendanceSummary }) => (
          <AppBadge
            label={
              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                {NUMBER_FORMATTER.format(row.presentDays)}
              </Box>
            }
            color="success"
            size="small"
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
          >
            <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
              {NUMBER_FORMATTER.format(row.absentDays)}
            </Box>
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
            onView={canView ? () => onViewDetails(row) : undefined}
            onEdit={canManage ? () => onEdit(row) : undefined}
            viewTooltip={t("hr:absenceDetails")}
            editTooltip={t("hr:editAttendance")}
          />
        ),
      },
    ],
    [t, canView, canManage, onViewDetails, onEdit],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      loading={loading}
      pagination={pagination}
      emptyMessage={t("hr:noAttendanceEmployees")}
    />
  );
});
