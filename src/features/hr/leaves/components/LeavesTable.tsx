import { memo, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import type { TablePaginationProps } from "@/types";
import type { EmployeeLeaveSummary } from "../types";

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const LTR_NUM_SX = {
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
} as const;

interface LeavesTableProps {
  rows: EmployeeLeaveSummary[];
  loading?: boolean;
  pagination?: TablePaginationProps;
}

export const LeavesTable = memo(function LeavesTable({
  rows,
  loading = false,
  pagination,
}: LeavesTableProps) {
  const { t } = useTranslation(["hr", "common"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "employeeName",
        headerName: t("hr:employeeName"),
        flex: 1.4,
        minWidth: 170,
        renderCell: ({ row }: { row: EmployeeLeaveSummary }) => (
          <Typography variant="body2" fontWeight={500}>
            {row.employeeName}
          </Typography>
        ),
      },
      {
        field: "jobTitle",
        headerName: t("hr:jobTitle"),
        flex: 1.1,
        minWidth: 150,
        renderCell: ({ row }: { row: EmployeeLeaveSummary }) => (
          <Typography
            variant="body2"
            color={row.jobTitle ? "text.primary" : "text.secondary"}
          >
            {row.jobTitle || "—"}
          </Typography>
        ),
      },
      {
        field: "paidLeaveDays",
        headerName: t("hr:paidLeaveDays"),
        flex: 0.9,
        minWidth: 130,
        renderCell: ({ row }: { row: EmployeeLeaveSummary }) => (
          <AppBadge
            label={
              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                {NUMBER_FORMATTER.format(row.paidLeaveDays)}
              </Box>
            }
            color="success"
            size="small"
          />
        ),
      },
      {
        field: "unpaidLeaveDays",
        headerName: t("hr:unpaidLeaveDays"),
        flex: 0.9,
        minWidth: 130,
        renderCell: ({ row }: { row: EmployeeLeaveSummary }) => (
          <AppBadge
            label={
              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                {NUMBER_FORMATTER.format(row.unpaidLeaveDays)}
              </Box>
            }
            color={row.unpaidLeaveDays > 0 ? "error" : "default"}
            size="small"
          />
        ),
      },
      {
        field: "totalLeaveDays",
        headerName: t("hr:totalLeaveDays"),
        flex: 0.9,
        minWidth: 130,
        renderCell: ({ row }: { row: EmployeeLeaveSummary }) => (
          <Typography variant="body2" fontWeight={600}>
            <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
              {NUMBER_FORMATTER.format(row.totalLeaveDays)}
            </Box>
          </Typography>
        ),
      },
    ],
    [t],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      loading={loading}
      pagination={pagination}
      emptyMessage={t("hr:noLeavesFound")}
    />
  );
});
