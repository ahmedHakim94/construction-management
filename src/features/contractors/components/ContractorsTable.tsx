import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

import { AppTable, type AppTableColDef } from "@/components/ui";
import type { TablePaginationProps } from "@/types";
import type { Contractor } from "../types";
import { useMemo } from "react";
import { AppActions } from "@/components/ui/AppActions";

interface ContractorsTableProps {
  rows: Contractor[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  onEdit: (contractor: Contractor) => void;
  onDelete: (contractor: Contractor) => void;
}

export function ContractorsTable({
  rows,
  loading = false,
  pagination,
  onEdit,
  onDelete,
}: ContractorsTableProps) {
  const { t } = useTranslation();

  const columns = useMemo<AppTableColDef[]>(() => [
    {
      field: "id",
      headerName: t("#"),
      flex: 1,
      minWidth: 120,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: "phone",
      headerName: t("phone"),
      flex: 1,
      minWidth: 140,
    },
    {
      field: "status",
      headerName: t("status"),
      flex: 0.8,
      minWidth: 120,
      renderCell: ({ row }: { row: Contractor }) => (
        <Chip
          label={t(String(row.status).toLowerCase())}
          color={row.status === "ACTIVE" ? "success" : "default"}
          size="small"
        />
      ),
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
      renderCell: ({ row }: { row: Contractor }) => (
        <AppActions
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
        />
      ),
    },
  ], [t, onEdit, onDelete]);

  return (
    <AppTable
      rows={rows}
      columns={columns}
      loading={loading}
      pagination={pagination}
    />
  );
}

