import { memo, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import { AppActions } from "@/components/ui/AppActions";
import type { PayrollRecord } from "../types";

const MONEY_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const LTR_NUM_SX = {
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
} as const;

const EMPLOYEE_CELL_SX = {
  py: 0.5,
} as const;

interface PayrollTableProps {
  rows: PayrollRecord[];
  loading?: boolean;
  canManage: boolean;
  isFutureMonth?: boolean;
  onViewDetails: (record: PayrollRecord) => void;
  onMarkAsPaid: (record: PayrollRecord) => void;
}

export const PayrollTable = memo(function PayrollTable({
  rows,
  loading = false,
  canManage,
  isFutureMonth = false,
  onViewDetails,
  onMarkAsPaid,
}: PayrollTableProps) {
  const { t } = useTranslation(["hr", "common"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "employeeName",
        headerName: t("hr:employeeName"),
        flex: 1.4,
        minWidth: 185,
        renderCell: ({ row }: { row: PayrollRecord }) => (
          <Box sx={EMPLOYEE_CELL_SX}>
            <Typography
              variant="body2"
              fontWeight={600}
              color={row.isInactive ? "text.secondary" : "text.primary"}
            >
              {row.employeeName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                {row.employeeCode}
              </Box>
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
          >
            {row.isInactive ? (
              "—"
            ) : (
              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                {MONEY_FORMATTER.format(row.basicSalary)}
              </Box>
            )}
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
          >
            {row.isInactive ? (
              "—"
            ) : (
              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                {MONEY_FORMATTER.format(row.payableWorkingDays)}
              </Box>
            )}
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
          >
            {row.isInactive ? (
              "—"
            ) : (
              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                {MONEY_FORMATTER.format(row.totalBonuses)}
              </Box>
            )}
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
          >
            {row.isInactive ? (
              "—"
            ) : (
              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                {MONEY_FORMATTER.format(row.totalDeductions)}
              </Box>
            )}
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
          >
            {row.isInactive ? (
              "—"
            ) : (
              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                {MONEY_FORMATTER.format(row.totalLoans)}
              </Box>
            )}
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
          >
            {row.isInactive ? (
              "—"
            ) : (
              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                {MONEY_FORMATTER.format(row.netSalary)}
              </Box>
            )}
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
            canManage &&
            !isFutureMonth &&
            !row.isInactive &&
            row.status === "PENDING";

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
    [t, canManage, isFutureMonth, onViewDetails, onMarkAsPaid],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      loading={loading}
      getRowHeight={() => "auto"}
      showPagination
      emptyMessage={t("hr:noPayrollRecordsFound")}
    />
  );
});
