import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppCard, AppCustomTable, type AppTableColDef } from "@/components/ui";
import { Typography } from "@mui/material";
import type { DashboardProjectWork } from "../types";

export interface WorkByProjectProps {
  workByProject: DashboardProjectWork[];
  isLoading: boolean;
}

export function WorkByProject({ workByProject, isLoading }: WorkByProjectProps) {
  const { t } = useTranslation(["dashboard", "dailyWork"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "projectName",
        headerName: t("dailyWork:project"),
        flex: 1.5,
        minWidth: 150,
      },
      {
        field: "workRecords",
        headerName: t("dashboard:workRecords"),
        flex: 1,
        minWidth: 120,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "0",
      },
      {
        field: "workingHours",
        headerName: t("dailyWork:workingHours"),
        flex: 1,
        minWidth: 120,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => t("dashboard:workingHoursFormat", { hours: value }),
      },
      {
        field: "totalCost",
        headerName: t("dashboard:totalCost"),
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
    <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}>
        {t("dashboard:workByProject")}
      </Typography>

      <AppCustomTable
        rows={workByProject}
        columns={columns}
        loading={isLoading}
        noRowsLabel={t("dashboard:noProjectWorkFound")}
      />
    </AppCard>
  );
}
