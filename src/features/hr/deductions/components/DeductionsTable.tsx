import { useMemo } from "react";
import { Chip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { AppBadge, AppTable, type AppTableColDef } from "@/components/ui";
import { AppActions } from "@/components/ui/AppActions";
import type { Employee, EmployeeProject } from "@/features/hr/employees/types";
import { isCurrentMonthDate } from "../mock/deductions.mock";
import type { FinancialTransaction } from "../types";

interface DeductionsTableProps {
  rows: FinancialTransaction[];
  employees: Employee[];
  projects: EmployeeProject[];
  canManage: boolean;
  onEdit: (transaction: FinancialTransaction) => void;
  onDelete: (transaction: FinancialTransaction) => void;
}

export function DeductionsTable({
  rows,
  employees,
  projects,
  canManage,
  onEdit,
  onDelete,
}: DeductionsTableProps) {
  const { t } = useTranslation(["hr", "common"]);

  const employeeNameById = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee.name])),
    [employees],
  );

  const projectNameById = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const amountFormatter = useMemo(
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
        field: "employeeId",
        headerName: t("hr:employeeName"),
        flex: 1.2,
        minWidth: 160,
        renderCell: ({ row }: { row: FinancialTransaction }) => (
          <Typography variant="body2" fontWeight={500}>
            {employeeNameById.get(row.employeeId) ?? `#${row.employeeId}`}
          </Typography>
        ),
      },
      {
        field: "projectId",
        headerName: t("hr:transactionProject"),
        flex: 1.2,
        minWidth: 170,
        renderCell: ({ row }: { row: FinancialTransaction }) => (
          <Chip
            size="small"
            label={projectNameById.get(row.projectId) ?? `#${row.projectId}`}
            sx={(theme) => ({
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
            })}
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
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {amountFormatter.format(row.amount)}
          </Typography>
        ),
      },
      {
        field: "reason",
        headerName: t("hr:transactionReason"),
        flex: 1.6,
        minWidth: 200,
      },
      {
        field: "date",
        headerName: t("hr:transactionDate"),
        width: 125,
        renderCell: ({ row }: { row: FinancialTransaction }) => (
          <Typography
            variant="body2"
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {row.date}
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

          if (!canModifyRecord) {
            return (
              <Typography variant="caption" color="text.disabled">
                —
              </Typography>
            );
          }

          return (
            <AppActions
              onEdit={() => onEdit(row)}
              onDelete={() => onDelete(row)}
              editTooltip={t("hr:editTransaction")}
              deleteTooltip={t("hr:deleteTransaction")}
            />
          );
        },
      },
    ],
    [
      t,
      employeeNameById,
      projectNameById,
      amountFormatter,
      canManage,
      onEdit,
      onDelete,
    ],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      showPagination
      emptyMessage={t("hr:noTransactionsFound")}
    />
  );
}
