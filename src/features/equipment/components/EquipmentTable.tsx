import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppTable, type AppTableColDef } from "@/components/ui";
import type { Equipment } from "../types";
import { AppActions } from "@/components/ui/AppActions";

interface EquipmentTableProps {
    rows: Equipment[];
    onEdit: (equipment: Equipment) => void;
    onDelete: (equipment: Equipment) => void;
}

export function EquipmentTable({ rows, onEdit, onDelete }: EquipmentTableProps) {
    const { t } = useTranslation();

    const columns = useMemo<AppTableColDef[]>(
        () => [
            {
                field: "equipmentNumber",
                headerName: t("equipmentNumber"),
                flex: 1,
                minWidth: 140,
            },
            {
                field: "contractorName",
                headerName: t("contractorName"),
                flex: 1.2,
                minWidth: 180,
            },
            {
                field: "equipmentTypeName",
                headerName: t("equipmentType"),
                flex: 1.2,
                minWidth: 180,
            },
            {
                field: "hourRate",
                headerName: t("hourRate"),
                flex: 0.8,
                minWidth: 120,
            },
            {
                field: "model",
                headerName: t("model"),
                flex: 1,
                minWidth: 140,
            },
            {
                field: "plateNumber",
                headerName: t("plateNumber"),
                flex: 1,
                minWidth: 140,
            },

            {
                field: "createdAt",
                headerName: t("createdDate"),
                flex: 1,
                minWidth: 140,
            },
            {
                field: "notes",
                headerName: t("notes"),
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
                renderCell: ({ row }) => (
                    <AppActions
                        onEdit={() => onEdit(row as Equipment)}
                        onDelete={() => onDelete(row as Equipment)}
                    />
                ),
            },
        ],
        [t],
    );

    const rowsWithId = useMemo(
        () => rows.map((row) => ({ ...row, id: row.id })),
        [rows],
    );

    return <AppTable rows={rowsWithId} columns={columns} />;
}
