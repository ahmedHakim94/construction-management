import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import { AppActions } from "@/components/ui/AppActions";
import type { PayrollRecord } from "../types";

interface PayrollTableProps {
  rows: PayrollRecord[];
  canManage: boolean;
  onViewDetails: (record: PayrollRecord) => void;
  onMarkAsPaid: (record: PayrollRecord) => void;
}

export function PayrollTable({
  rows,
  canManage,
  onViewDetails,
  onMarkAsPaid,
}: PayrollTableProps) {
  const { t } = useTranslation(["hr", "common"]);

  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [],
  );

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "employeeName",
        headerName: t("hr:employeeName"),
        flex: 1.4,
        minWidth: 185,
        renderCell: ({ row }: { row: PayrollRecord }) => (
          <Box sx={{ py: 0.5 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              color={row.isInactive ? "text.secondary" : "text.primary"}
            >
              {row.employeeName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.employeeCode}
            </Typography>
          </Box>
        ),
      },
      {
        field: "basicSalary",
        headerName: t("hr:basicSalary"),
        flex: 0.9,
        minWidth: 115,
        renderCell: ({ row }: { row: PayrollRecord }) => (
          <Typography
            variant="body2"
            color={row.isInactive ? "text.disabled" : "text.primary"}
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {row.isInactive ? "—" : moneyFormatter.format(row.basicSalary)}
          </Typography>
        ),
      },
      {
        field: "payableWorkingDays",
        headerName: t("hr:workingDays"),
        flex: 0.8,
        minWidth: 105,
        renderCell: ({ row }: { row: PayrollRecord }) => (
          <Typography
            variant="body2"
            color={row.isInactive ? "text.disabled" : "text.primary"}
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {row.isInactive
              ? "—"
              : moneyFormatter.format(row.payableWorkingDays)}
          </Typography>
        ),
      },
      {
        field: "totalBonuses",
        headerName: t("hr:payrollBonuses"),
        flex: 0.85,
        minWidth: 105,
        renderCell: ({ row }: { row: PayrollRecord }) => (
          <Typography
            variant="body2"
            fontWeight={row.totalBonuses > 0 ? 600 : 400}
            color={
              row.isInactive
                ? "text.disabled"
                : row.totalBonuses > 0
                  ? "success.main"
                  : "text.secondary"
            }
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {row.isInactive ? "—" : moneyFormatter.format(row.totalBonuses)}
          </Typography>
        ),
      },
      {
        field: "totalDeductions",
        headerName: t("hr:payrollDeductions"),
        flex: 0.85,
        minWidth: 105,
        renderCell: ({ row }: { row: PayrollRecord }) => (
          <Typography
            variant="body2"
            fontWeight={row.totalDeductions > 0 ? 600 : 400}
            color={
              row.isInactive
                ? "text.disabled"
                : row.totalDeductions > 0
                  ? "error.main"
                  : "text.secondary"
            }
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {row.isInactive ? "—" : moneyFormatter.format(row.totalDeductions)}
          </Typography>
        ),
      },
      {
        field: "totalLoans",
        headerName: t("hr:loans"),
        flex: 0.85,
        minWidth: 105,
        renderCell: ({ row }: { row: PayrollRecord }) => (
          <Typography
            variant="body2"
            fontWeight={row.totalLoans > 0 ? 600 : 400}
            color={
              row.isInactive
                ? "text.disabled"
                : row.totalLoans > 0
                  ? "warning.dark"
                  : "text.secondary"
            }
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {row.isInactive ? "—" : moneyFormatter.format(row.totalLoans)}
          </Typography>
        ),
      },
      {
        field: "netSalary",
        headerName: t("hr:netSalary"),
        flex: 0.95,
        minWidth: 120,
        renderCell: ({ row }: { row: PayrollRecord }) => (
          <Typography
            variant="body2"
            fontWeight={700}
            color={row.isInactive ? "text.disabled" : "text.primary"}
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {row.isInactive ? "—" : moneyFormatter.format(row.netSalary)}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: t("common:status"),
        flex: 0.85,
        minWidth: 115,
        renderCell: ({ row }: { row: PayrollRecord }) => {
          if (row.isInactive) {
            return (
              <AppBadge
                label={t("common:inactive")}
                color="default"
                size="small"
              />
            );
          }

          return (
            <AppBadge
              label={t(
                row.status === "PAID"
                  ? "hr:payrollStatusPaid"
                  : "hr:payrollStatusPending",
              )}
              color={row.status === "PAID" ? "success" : "warning"}
              size="small"
            />
          );
        },
      },
      {
        field: "actions",
        headerName: t("common:actions"),
        sortable: false,
        filterable: false,
        width: 115,
        renderCell: ({ row }: { row: PayrollRecord }) => {
          const canMarkPaid =
            canManage && !row.isInactive && row.status === "PENDING";

          return (
            <AppActions
              onView={canManage ? () => onViewDetails(row) : undefined}
              onActivate={canMarkPaid ? () => onMarkAsPaid(row) : undefined}
              viewTooltip={t("hr:payrollDetails")}
              activateTooltip={t("hr:markAsPaid")}
            />
          );
        },
      },
    ],
    [t, moneyFormatter, canManage, onViewDetails, onMarkAsPaid],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      getRowHeight={() => "auto"}
      showPagination
      emptyMessage={t("hr:noPayrollRecordsFound")}
    />
  );
}
