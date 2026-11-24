import { memo, useMemo } from "react";
import { Box, Chip, Typography, type Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import { AppActions } from "@/components/ui/AppActions";
import type { TablePaginationProps } from "@/types";
import type { FinancialTransaction } from "../types";
import { isCurrentMonthDate } from "../utils/transactionDates";

const AMOUNT_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const LTR_NUM_SX = {
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
} as const;

const getProjectChipSx = (theme: Theme) => ({
  height: 24,
  fontSize: "0.75rem",
  fontWeight: 500,
  borderRadius: 1.5,
  bgcolor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  "& .MuiChip-label": {
    px: 1,
  },
});

interface DeductionsTableProps {
  rows: FinancialTransaction[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  canManage: boolean;
  onEdit: (transaction: FinancialTransaction) => void;
  onDelete: (transaction: FinancialTransaction) => void;
}

export const DeductionsTable = memo(function DeductionsTable({
  rows,
  loading = false,
  pagination,
  canManage,
  onEdit,
  onDelete,
}: DeductionsTableProps) {
  const { t } = useTranslation(["hr", "common"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "employeeName",
        headerName: t("hr:employeeName"),
        flex: 1.2,
        minWidth: 160,
        renderCell: ({ row }: { row: FinancialTransaction }) => (
          <Typography variant="body2" fontWeight={500}>
            {row.employeeName || `#${row.employeeId}`}
          </Typography>
        ),
      },
      {
        field: "projectName",
        headerName: t("hr:transactionProject"),
        flex: 1.2,
        minWidth: 165,
        renderCell: ({ row }: { row: FinancialTransaction }) => (
          <Chip
            size="small"
            label={row.projectName || `#${row.projectId}`}
            sx={getProjectChipSx}
          />
        ),
      },
      {
        field: "type",
        headerName: t("hr:transactionType"),
        flex: 0.85,
        minWidth: 120,
        renderCell: ({ row }: { row: FinancialTransaction }) => (
          <AppBadge
            label={t(
              row.type === "BONUS"
                ? "hr:transactionTypeBonus"
                : "hr:transactionTypeDeduction",
            )}
            color={row.type === "BONUS" ? "success" : "error"}
            size="small"
          />
        ),
      },
      {
        field: "amount",
        headerName: t("hr:transactionAmount"),
        flex: 0.8,
        minWidth: 115,
        renderCell: ({ row }: { row: FinancialTransaction }) => (
          <Typography
            variant="body2"
            fontWeight={600}
            color={row.type === "BONUS" ? "success.main" : "error.main"}
          >
            <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
              {AMOUNT_FORMATTER.format(row.amount)}
            </Box>
          </Typography>
        ),
      },
      {
        field: "reason",
        headerName: t("hr:transactionReason"),
        flex: 1.5,
        minWidth: 180,
        renderCell: ({ row }: { row: FinancialTransaction }) => (
          <Typography
            variant="body2"
            color={row.reason ? "text.primary" : "text.secondary"}
          >
            {row.reason || "—"}
          </Typography>
        ),
      },
      {
        field: "date",
        headerName: t("hr:transactionDate"),
        width: 125,
        renderCell: ({ row }: { row: FinancialTransaction }) => (
          <Typography variant="body2">
            <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
              {row.date}
            </Box>
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: t("common:actions"),
        sortable: false,
        filterable: false,
        width: 115,
        renderCell: ({ row }: { row: FinancialTransaction }) => {
          const canModifyRecord = canManage && isCurrentMonthDate(row.date);

          return canModifyRecord ? (
            <AppActions
              onEdit={() => onEdit(row)}
              onDelete={() => onDelete(row)}
              editTooltip={t("hr:editTransaction")}
              deleteTooltip={t("hr:deleteTransaction")}
            />
          ) : (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          );
        },
      },
    ],
    [t, canManage, onEdit, onDelete],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      loading={loading}
      pagination={pagination}
      emptyMessage={t("hr:noTransactionsFound")}
    />
  );
});
