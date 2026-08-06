import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppTable, type AppTableColDef } from "@/components/ui";
import type { EquipmentType } from "../types";

interface EquipmentTypeTableProps {
  rows: EquipmentType[];
  onEdit: (equipmentType: EquipmentType) => void;
  onDelete: (equipmentType: EquipmentType) => void;
}

export function EquipmentTypeTable({
  rows,
  onEdit,
  onDelete,
}: EquipmentTypeTableProps) {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
    //   {
    //     field: "code",
    //     headerName: t("code"),
    //     flex: 1,
    //     minWidth: 120,
    //   },
      {
        field: "nameAr",
        headerName: t("arabicName"),
        flex: 1.2,
        minWidth: 180,
      },
      {
        field: "nameEn",
        headerName: t("englishName"),
        flex: 1.2,
        minWidth: 180,
      },
      {
        field: "createdAt",
        headerName: t("createdDate"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "prefix",
        headerName: t("prefix"),
        flex: 0.8,
        minWidth: 110,
      },
      {
        field: "actions",
        headerName: t("actions"),
        sortable: false,
        filterable: false,
        flex: 0.8,
        minWidth: 110,
        renderCell: ({ row }:any) => (
          <AppActions
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
          />
        ),
      },
    ],
    [t, onEdit, onDelete],
  );

  return <AppTable rows={rows} columns={columns} showPagination={false}/>;
}
