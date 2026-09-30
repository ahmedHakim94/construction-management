import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppTable, type AppTableColDef } from "@/components/ui";
import type { TablePaginationProps } from "@/types";
import type { Task } from "../types";

interface TaskTableProps {
  rows: Task[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskTable({
  rows,
  loading = false,
  pagination,
  onEdit,
  onDelete,
}: TaskTableProps) {
  const { t } = useTranslation();

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
        flex: 1.2,
        minWidth: 180,
      },
      {
        field: "actions",
        headerName: t("actions"),
        sortable: false,
        filterable: false,
        flex: 0.8,
        minWidth: 110,
        renderCell: ({ row }: { row: Task }) => (
          <AppActions
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
          />
        ),
      },
    ],
    [t, onEdit, onDelete],
  );

  return (
    <AppTable
      rows={rows}
      columns={columns}
      loading={loading}
      pagination={pagination}
    />
  );
}
