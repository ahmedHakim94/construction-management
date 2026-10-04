import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppTable, type AppTableColDef } from "@/components/ui";
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
      {
        field: "actions",
        headerName: t("actions"),
        sortable: false,
        filterable: false,
        flex: 0.8,
        minWidth: 110,
        renderCell: ({ row }: { row: EquipmentType }) => (
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
