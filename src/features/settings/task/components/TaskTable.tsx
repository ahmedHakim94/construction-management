import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppTable, type AppTableColDef } from "@/components/ui";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
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

  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("tasks.edit");
  const canDelete = hasPermission("tasks.delete");
  const hasActions = canEdit || canDelete;

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
        flex: 1.2,
        minWidth: 180,
      },
      ...(hasActions
        ? [
            {
              field: "actions",
              headerName: t("actions"),
              sortable: false,
              filterable: false,
              flex: 0.8,
              minWidth: 110,
              renderCell: ({ row }: { row: Task }) => (
                <AppActions
                  onEdit={canEdit ? () => onEdit(row) : undefined}
                  onDelete={canDelete ? () => onDelete(row) : undefined}
                />
              ),
            },
          ]
        : []),
    ],
    [t, onEdit, onDelete, canEdit, canDelete, hasActions],
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
