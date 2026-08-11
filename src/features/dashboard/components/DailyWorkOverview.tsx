import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AppCard,
  AppCustomTable,
  type AppTableColDef,
} from "@/components/ui";
import { Typography } from "@mui/material";
import type { DashboardDailyWork } from "../types";

export interface DailyWorkOverviewProps {
  dailyWork: DashboardDailyWork[];
  isLoading: boolean;
}

export function DailyWorkOverview({
  dailyWork,
  isLoading,
}: DailyWorkOverviewProps) {
  const { t } = useTranslation(["dashboard", "dailyWork"]);

  const columns = useMemo<AppTableColDef[]>(
    () => [
      {
        field: "date",
        headerName: t("dailyWork:date"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "projectName",
        headerName: t("dailyWork:project"),
        flex: 1.5,
        minWidth: 150,
      },
      {
        field: "contractorName",
        headerName: t("dailyWork:contractor"),
        flex: 1.5,
        minWidth: 150,
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
        flex: 1.2,
        minWidth: 130,
      },
      {
        field: "workingHours",
        headerName: t("dailyWork:workingHours"),
        flex: 1,
        minWidth: 110,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) =>
          t("dashboard:workingHoursFormat", { hours: value }),
      },
      {
        field: "cost",
        headerName: t("dailyWork:cost"),
        flex: 1,
        minWidth: 110,
        type: "number",
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }: any) => value?.toLocaleString() ?? "",
      },
    ],
    [t],
  );

  return (
    <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}
      >
        {t("dailyWork:dailyWork")}
      </Typography>

      {/* <AppTable
        rows={dailyWork}
        columns={columns}
        loading={isLoading}
        showPagination={false}
        localeText={{
          noRowsLabel: t("dashboard:noDailyWorkRecordsFound"),
        }}
      /> */}

      <AppCustomTable rows={dailyWork} columns={columns} loading={isLoading} />
    </AppCard>
  );
}
