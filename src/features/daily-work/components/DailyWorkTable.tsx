import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppTable, type AppTableColDef } from "@/components/ui";
import type { DailyWork } from "../types";

interface DailyWorkTableProps {
  rows: DailyWork[];
  onEdit: (record: DailyWork) => void;
  onDelete: (record: DailyWork) => void;
}

export function DailyWorkTable({ rows, onEdit, onDelete }: DailyWorkTableProps) {
  const { t } = useTranslation();

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "date",
        headerName: t("date"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "projectName",
        headerName: t("project"),
        flex: 1.4,
        minWidth: 180,
      },
      {
        field: "contractorName",
        headerName: t("contractor"),
        flex: 1.4,
        minWidth: 180,
      },
      {
        field: "equipmentLabel",
        headerName: t("equipment"),
        flex: 1.4,
        minWidth: 180,
      },
      {
        field: "taskName",
        headerName: t("task"),
        flex: 1.2,
        minWidth: 160,
      },
      {
        field: "workingHours",
        headerName: t("workingHours"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "fuelConsumption",
        headerName: t("fuelConsumption"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "hourRate",
        headerName: t("hourRate"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "cost",
        headerName: t("cost"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "deduction",
        headerName: t("deduction"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "netAmount",
        headerName: t("netAmount"),
        flex: 1,
        minWidth: 130,
        renderCell: ({ row }: { row: DailyWork }) =>
          Number(row.cost ?? 0) - Number(row.deduction ?? 0),
      },
      {
        field: "notes",
        headerName: t("notes"),
        flex: 1.6,
        minWidth: 180,
      },
      {
        field: "createdAt",
        headerName: t("createdDate"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "actions",
        headerName: t("actions"),
        sortable: false,
        filterable: false,
        flex: 0.8,
        minWidth: 110,
        renderCell: ({ row }: { row: DailyWork }) => (
          <AppActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
        ),
      },
    ],
    [t, onEdit, onDelete],
  );

  return <AppTable rows={rows} columns={columns} showPagination={false} />;
}
