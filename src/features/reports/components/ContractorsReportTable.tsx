import { useMemo } from "react";
import { Box, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppCustomTable, type AppTableColDef } from "@/components/ui";
import type { ContractorReport } from "../types";

export interface ContractorsReportTableProps {
  rows: ContractorReport[];
  isLoading: boolean;
}

export function ContractorsReportTable({
  rows,
  isLoading,
}: ContractorsReportTableProps) {
  const { t } = useTranslation(["reports", "dailyWork"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "contractorName",
        headerName: t("dailyWork:contractor"),
        flex: 1.5,
        minWidth: 150,
        renderCell: ({ row }: { row: ContractorReport }) => (
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
            <span>{row.contractorName}</span>
            {row.contractorId?.startsWith("external-") && (
              <Chip
                label={t("dailyWork:external")}
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
        field: "totalWorkingHours",
        headerName: t("reports:totalWorkingHours"),
        flex: 1.2,
        minWidth: 150,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "totalCost",
        headerName: t("reports:totalWorkCost"),
        flex: 1.2,
        minWidth: 140,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "totalPaid",
        headerName: t("reports:totalPaid"),
        flex: 1.2,
        minWidth: 140,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "remaining",
        headerName: t("reports:remaining"),
        flex: 1.2,
        minWidth: 140,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
    ],
    [t],
  );

  return (
    <AppCustomTable
      rows={rows}
      columns={columns}
      loading={isLoading}
      noRowsLabel={t("reports:noContractorsReport")}
    />
  );
}
