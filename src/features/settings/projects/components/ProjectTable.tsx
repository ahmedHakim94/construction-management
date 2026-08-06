import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppTable } from "@/components/ui";
import type { Project } from "../types";

interface ProjectTableProps {
  rows: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectTable({ rows, onEdit, onDelete }: ProjectTableProps) {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: t("projectName"),
        flex: 1.2,
        minWidth: 180,
      },
      {
        field: "address",
        headerName: t("address"),
        flex: 1.2,
        minWidth: 220,
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
