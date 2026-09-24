import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  AppCard,
  AppCustomTable,
  AppButton,
  type AppTableColDef,
} from "@/components/ui";
import { Box, Chip, Typography } from "@mui/material";
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
  const navigate = useNavigate();

  // Show only the latest 10 records sorted by date descending
  const recentRecords = useMemo(() => {
    return [...dailyWork]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [dailyWork]);

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
        renderCell: ({ row }: { row: DashboardDailyWork }) => (
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
        field: "equipmentName",
        headerName: t("dailyWork:equipment"),
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, textAlign: "start" }}
        >
          {t("dashboard:recentDailyWork")}
        </Typography>
        <AppButton
          onClick={() => navigate("/daily-work")}
          size="small"
          variant="outlined"
        >
          {t("dashboard:viewAll")}
        </AppButton>
      </Box>

      <AppCustomTable
        rows={recentRecords}
        columns={columns}
        loading={isLoading}
        noRowsLabel={t("dashboard:noDailyWorkRecordsFound")}
      />
    </AppCard>
  );
}
