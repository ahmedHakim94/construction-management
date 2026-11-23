import { useMemo } from "react";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import type { EmployeeLeaveSummary } from "../types";

interface LeavesTableProps {
  rows: EmployeeLeaveSummary[];
}

export function LeavesTable({ rows }: LeavesTableProps) {
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
        field: "employeeName",
        headerName: t("hr:employeeName"),
        flex: 1.5,
        minWidth: 180,
        renderCell: ({ row }: { row: EmployeeLeaveSummary }) => (
          <Typography variant="body2" fontWeight={500}>
            {row.employeeName}
          </Typography>
        ),
      },
      {
        field: "paidLeaveDays",
        headerName: t("hr:paidLeaveDays"),
        flex: 1,
        minWidth: 140,
        renderCell: ({ row }: { row: EmployeeLeaveSummary }) => (
          <AppBadge
            label={numberFormatter.format(row.paidLeaveDays)}
            color="success"
            size="small"
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          />
        ),
      },
      {
        field: "unpaidLeaveDays",
        headerName: t("hr:unpaidLeaveDays"),
        flex: 1,
        minWidth: 140,
        renderCell: ({ row }: { row: EmployeeLeaveSummary }) => (
          <AppBadge
            label={numberFormatter.format(row.unpaidLeaveDays)}
            color={row.unpaidLeaveDays > 0 ? "error" : "default"}
            size="small"
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          />
        ),
      },
      {
        field: "totalLeaveDays",
        headerName: t("hr:totalLeaveDays"),
        flex: 1,
        minWidth: 140,
        renderCell: ({ row }: { row: EmployeeLeaveSummary }) => (
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {numberFormatter.format(row.totalLeaveDays)}
          </Typography>
        ),
      },
    ],
    [t, numberFormatter],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      showPagination
      emptyMessage={t("hr:noLeavesFound")}
    />
  );
}
