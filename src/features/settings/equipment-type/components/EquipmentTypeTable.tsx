import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppTable, type AppTableColDef } from "@/components/ui";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import type { TablePaginationProps } from "@/types";
import type { EquipmentType } from "../types";

interface EquipmentTypeTableProps {
  rows: EquipmentType[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  onEdit: (equipmentType: EquipmentType) => void;
  onDelete: (equipmentType: EquipmentType) => void;
}

export function EquipmentTypeTable({
  rows,
  loading = false,
  pagination,
  onEdit,
  onDelete,
}: EquipmentTypeTableProps) {
  const { t } = useTranslation();

  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("equipmentTypes.edit");
  const canDelete = hasPermission("equipmentTypes.delete");
  const hasActions = canEdit || canDelete;

  const columns = useMemo<AppTableColDef[]>(
    () => [

      {
        field: "id",
        headerName: "#",
        flex: 1,
        minWidth: 50,
      },
      {
        field: "name",
        headerName: t("equipmentTypeName"),
        flex: 1.5,
        minWidth: 200,
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
              renderCell: ({ row }: { row: EquipmentType }) => (
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
