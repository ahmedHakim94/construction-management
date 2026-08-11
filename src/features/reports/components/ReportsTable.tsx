import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppCustomTable, type AppTableColDef } from "@/components/ui";
import type { ProjectReportSummary } from "../types";

export interface ReportsTableProps {
  rows: ProjectReportSummary[];
  isLoading: boolean;
}

export function ReportsTable({ rows, isLoading }: ReportsTableProps) {
  const { t } = useTranslation(["reports", "dashboard", "dailyWork"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "projectName",
        headerName: t("dailyWork:project"),
        flex: 1.5,
        minWidth: 150,
      },
      {
        field: "totalWorkRecords",
        headerName: t("reports:totalWorkRecords"),
        flex: 1,
        minWidth: 120,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "totalWorkingHours",
        headerName: t("dailyWork:workingHours"),
        flex: 1,
        minWidth: 120,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => t("dashboard:workingHoursFormat", { hours: value }),
      },
      {
        field: "totalWorkCost",
        headerName: t("reports:totalWorkCost"),
        flex: 1.2,
        minWidth: 130,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "totalDeductions",
        headerName: t("reports:totalDeductions"),
        flex: 1.2,
        minWidth: 130,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "netWorkAmount",
        headerName: t("reports:netWorkAmount"),
        flex: 1.2,
        minWidth: 130,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "totalPaidAmount",
        headerName: t("reports:totalPaidAmount"),
        flex: 1.2,
        minWidth: 130,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "remainingBalance",
        headerName: t("reports:remainingBalance"),
        flex: 1.2,
        minWidth: 130,
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
      noRowsLabel={t("reports:noReportsFound")}
    />
  );
}
