import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppCustomTable, type AppTableColDef } from "@/components/ui";
import type { ContractorReport } from "../types";

export interface ContractorsReportTableProps {
  rows: ContractorReport[];
  isLoading: boolean;
}

export function ContractorsReportTable({ rows, isLoading }: ContractorsReportTableProps) {
  const { t } = useTranslation(["reports", "dailyWork"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "contractorName",
        headerName: t("dailyWork:contractor"),
        flex: 1.5,
        minWidth: 150,
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
