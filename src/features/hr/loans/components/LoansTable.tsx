import { memo, useMemo } from "react";
import { Box, Chip, Typography, type Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { AppTable, type AppTableColDef } from "@/components/ui";
import { AppActions } from "@/components/ui/AppActions";
import type { TablePaginationProps } from "@/types";
import type { Loan } from "../types";

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

interface LoansTableProps {
  rows: Loan[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  canManage: boolean;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
}

export const LoansTable = memo(function LoansTable({
  rows,
  loading = false,
  pagination,
  canManage,
  onEdit,
  onDelete,
}: LoansTableProps) {
  const { t } = useTranslation(["hr", "common"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "employeeName",
        headerName: t("hr:employeeName"),
        flex: 1.3,
        minWidth: 170,
        renderCell: ({ row }: { row: Loan }) => (
          <Typography variant="body2" fontWeight={500}>
            {row.employeeName || `#${row.employeeId}`}
          </Typography>
        ),
      },
      {
        field: "projectName",
        headerName: t("hr:loanProject"),
        flex: 1.3,
        minWidth: 170,
        renderCell: ({ row }: { row: Loan }) => (
          <Chip
            size="small"
            label={row.projectName || `#${row.projectId}`}
            sx={getProjectChipSx}
          />
        ),
      },
      {
        field: "amount",
        headerName: t("hr:loanAmount"),
        flex: 0.9,
        minWidth: 120,
        renderCell: ({ row }: { row: Loan }) => (
          <Typography variant="body2" fontWeight={600}>
            <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
              {AMOUNT_FORMATTER.format(row.amount)}
            </Box>
          </Typography>
        ),
      },
      {
        field: "date",
        headerName: t("hr:loanDate"),
        width: 130,
        renderCell: ({ row }: { row: Loan }) => (
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
        width: 120,
        renderCell: ({ row }: { row: Loan }) =>
          canManage ? (
            <AppActions
              onEdit={() => onEdit(row)}
              onDelete={() => onDelete(row)}
              editTooltip={t("hr:editLoan")}
              deleteTooltip={t("hr:deleteLoan")}
            />
          ) : (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          ),
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
      emptyMessage={t("hr:noLoansFound")}
    />
  );
});
