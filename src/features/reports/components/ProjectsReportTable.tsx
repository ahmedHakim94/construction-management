import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppCustomTable, type AppTableColDef } from "@/components/ui";
import type { ProjectReport } from "../types";

export interface ProjectsReportTableProps {
  rows: ProjectReport[];
  isLoading: boolean;
}

export function ProjectsReportTable({ rows, isLoading }: ProjectsReportTableProps) {
  const { t } = useTranslation(["reports", "dailyWork"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "projectName",
        headerName: t("dailyWork:project"),
        flex: 1.5,
        minWidth: 150,
      },
      {
        field: "contractorsCount",
        headerName: t("reports:contractorsCount"),
        flex: 1,
        minWidth: 130,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "equipmentCount",
        headerName: t("reports:equipmentCount"),
        flex: 1,
        minWidth: 130,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "workRecords",
        headerName: t("reports:totalWorkRecords"),
        flex: 1,
        minWidth: 130,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
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
      noRowsLabel={t("reports:noProjectsReport")}
    />
  );
}
