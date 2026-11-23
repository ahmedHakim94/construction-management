import { useMemo } from "react";
import { Chip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { AppTable, type AppTableColDef } from "@/components/ui";
import { AppActions } from "@/components/ui/AppActions";
import type { Employee, EmployeeProject } from "@/features/hr/employees/types";
import type { Loan } from "../types";

interface LoansTableProps {
  rows: Loan[];
  employees: Employee[];
  projects: EmployeeProject[];
  canManage: boolean;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
}

export function LoansTable({
  rows,
  employees,
  projects,
  canManage,
  onEdit,
  onDelete,
}: LoansTableProps) {
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
        flex: 1.3,
        minWidth: 170,
        renderCell: ({ row }: { row: Loan }) => (
          <Typography variant="body2" fontWeight={500}>
            {employeeNameById.get(row.employeeId) ?? `#${row.employeeId}`}
          </Typography>
        ),
      },
      {
        field: "projectId",
        headerName: t("hr:loanProject"),
        flex: 1.3,
        minWidth: 180,
        renderCell: ({ row }: { row: Loan }) => (
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
        field: "amount",
        headerName: t("hr:loanAmount"),
        flex: 0.9,
        minWidth: 120,
        renderCell: ({ row }: { row: Loan }) => (
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {amountFormatter.format(row.amount)}
          </Typography>
        ),
      },
      {
        field: "date",
        headerName: t("hr:loanDate"),
        width: 130,
        renderCell: ({ row }: { row: Loan }) => (
          <Typography
            variant="body2"
            sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
          >
            {row.date}
          </Typography>
        ),
      },
      // {
      //   field: "actions",
      //   headerName: t("common:actions"),
      //   sortable: false,
      //   filterable: false,
      //   width: 120,
      //   renderCell: ({ row }: { row: Loan }) => (
      //     <AppActions
      //       onEdit={canManage ? () => onEdit(row) : undefined}
      //       onDelete={canManage ? () => onDelete(row) : undefined}
      //       editTooltip={t("hr:editLoan")}
      //       deleteTooltip={t("hr:deleteLoan")}
      //     />
      //   ),
      // },
    ],
    [
      t,
      employeeNameById,
      projectNameById,
      amountFormatter,
      canManage
      // onEdit,
      // onDelete,
    ],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      showPagination
      emptyMessage={t("hr:noLoansFound")}
    />
  );
}
