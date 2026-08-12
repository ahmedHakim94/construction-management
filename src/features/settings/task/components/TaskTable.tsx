import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppTable } from "@/components/ui";
import type { Task } from "../types";

interface TaskTableProps {
  rows: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskTable({ rows, onEdit, onDelete }: TaskTableProps) {
  const { t } = useTranslation();

  const columns = useMemo(
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
        renderCell: ({ row }: any) => (
          <AppActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
        ),
      },
    ],
    [t, onEdit, onDelete],
  );

  return <AppTable rows={rows} columns={columns} showPagination={false} />;
}
