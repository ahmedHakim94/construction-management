import { Chip, IconButton, Stack } from "@mui/material";
import { EditOutlined, DeleteOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { AppTable, type AppTableColDef } from "@/components/ui";
import type { Contractor } from "../types";
import { useMemo } from "react";
import { AppActions } from "@/components/ui/AppActions";

interface ContractorsTableProps {
  rows: Contractor[];
  onEdit: (contractor: Contractor) => void;
  onDelete: (contractor: Contractor) => void;
}

export function ContractorsTable({
  rows,
  onEdit,
  onDelete,
}: ContractorsTableProps) {
  const { t } = useTranslation();


  const columns = useMemo(() => [
    {
      field: "code",
      headerName: t("code"),
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
    // {
    //   field: "address",
    //   headerName: t("address"),
    //   flex: 1.3,
    //   minWidth: 200,
    // },
    {
      field: "status",
      headerName: t("status"),
      flex: 0.8,
      minWidth: 120,
      renderCell: ({ value }) => (
        <Chip
          label={t(String(value).toLowerCase())}
          color={value === "ACTIVE" ? "success" : "default"}
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
      renderCell: ({ row }) => (
        <AppActions
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
        />
      ),
    },
  ], [t]);

  return <AppTable rows={rows} columns={columns} />;
}
