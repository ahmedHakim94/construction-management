import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppCustomTable, type AppTableColDef } from "@/components/ui";
import type { DailyWorkReport } from "../types";

export interface DailyWorkReportTableProps {
  rows: DailyWorkReport[];
  isLoading: boolean;
}

export function DailyWorkReportTable({ rows, isLoading }: DailyWorkReportTableProps) {
  const { t } = useTranslation(["reports", "dailyWork"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "date",
        headerName: t("dailyWork:date"),
        flex: 1,
        minWidth: 110,
      },
      {
        field: "projectName",
        headerName: t("dailyWork:project"),
        flex: 1.2,
        minWidth: 130,
      },
      {
        field: "contractorName",
        headerName: t("dailyWork:contractor"),
        flex: 1.2,
        minWidth: 130,
      },
      {
        field: "equipmentName",
        headerName: t("dailyWork:equipment"),
        flex: 1.2,
        minWidth: 130,
      },
      {
        field: "taskName",
        headerName: t("dailyWork:task"),
        flex: 1,
        minWidth: 110,
      },
      {
        field: "workingHours",
        headerName: t("dailyWork:workingHours"),
        flex: 1,
        minWidth: 120,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "hourRate",
        headerName: t("dailyWork:hourRate"),
        flex: 1,
        minWidth: 110,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "fuelConsumption",
        headerName: t("dailyWork:fuelConsumption"),
        flex: 1,
        minWidth: 130,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "cost",
        headerName: t("dailyWork:cost"),
        flex: 1,
        minWidth: 110,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "deduction",
        headerName: t("dailyWork:deduction"),
        flex: 1,
        minWidth: 110,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "netAmount",
        headerName: t("dailyWork:netAmount"),
        flex: 1,
        minWidth: 120,
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
      noRowsLabel={t("reports:noDailyWorkRecords")}
    />
  );
}
