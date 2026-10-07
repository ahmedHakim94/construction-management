import { useMemo } from "react";
import { Box, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppActions } from "@/components/ui/AppActions";
import { AppTable, type AppTableColDef } from "@/components/ui";
import type { TablePaginationProps } from "@/types";
import type { DailyWork, DailyWorkList } from "../types";

export type DailyWorkRow = DailyWorkList & {
  contractorName?: string;
  projectName?: string;
  equipmentLabel?: string;
  taskName?: string;
};

interface DailyWorkTableProps {
  rows: DailyWorkRow[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  onEdit: (record: DailyWorkRow) => void;
  onDelete: (record: DailyWorkRow) => void;
}

export const formatWorkingDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours} ساعة ${remainingMinutes} دقيقة`;
};

export function DailyWorkTable({
  rows,
  loading = false,
  pagination,
  onEdit,
  onDelete,
}: DailyWorkTableProps) {
  const { t } = useTranslation();

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "date",
        headerName: t("date"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "projectName",
        headerName: t("project"),
        flex: 1.4,
        minWidth: 180,
      },
      {
        field: "contractorName",
        headerName: t("contractor"),
        flex: 1.4,
        minWidth: 180,
        renderCell: ({ row }: { row: DailyWorkRow }) => (
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
            <span>{row.contractorName}</span>
            {row?.isExternal == 1 && (
              <Chip
                label={t("external")}
                size="small"
                variant="outlined"
                color="secondary"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  px: 0.25,
                  "& .MuiChip-label": { px: 0.6 },
                }}
              />
            )}
          </Box>
        ),
      },
      {
        field: `equipmentTypeName || temporaryEquipmentName`,
        headerName: t("equipment"),
        flex: 1.4,
        minWidth: 180,
        valueGetter: (_, row) =>
          row.equipmentTypeName || row.temporaryEquipmentName || "-",
      },
      {
        field: "taskName",
        headerName: t("task"),
        flex: 1.2,
        minWidth: 160,
      },
      {
        field: "workingHours",
        headerName: t("workingHours"),
        flex: 1,
        minWidth: 120,
        renderCell: ({ row }: { row: DailyWorkList }) =>
          formatWorkingDuration(row.workingMinutes),
      },
      {
        field: "fuelConsumption",
        headerName: t("fuelConsumption"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "hourRate",
        headerName: t("hourRate"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "cost",
        headerName: t("cost"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "deduction",
        headerName: t("deduction"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "netAmount",
        headerName: t("netAmount"),
        flex: 1,
        minWidth: 130,
        renderCell: ({ row }: { row: DailyWorkList }) =>
          Number(row.cost ?? 0) - Number(row.deduction ?? 0),
      },
      {
        field: "notes",
        headerName: t("notes"),
        flex: 1.6,
        minWidth: 180,
      },
      {
        field: "actions",
        headerName: t("actions"),
        sortable: false,
        filterable: false,
        flex: 0.8,
        minWidth: 110,
        renderCell: ({ row }: { row: DailyWorkRow }) => (
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
      showPagination={!!pagination}
    />
  );
}
