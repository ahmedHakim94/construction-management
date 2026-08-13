import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppCard } from "@/components/ui";
import { Box, Grid, Typography, LinearProgress } from "@mui/material";
import type { DashboardProjectWork } from "../types";

export interface WorkByProjectProps {
  workByProject: DashboardProjectWork[];
  isLoading: boolean;
}

export function WorkByProject({ workByProject, isLoading }: WorkByProjectProps) {
  const { t } = useTranslation(["dashboard", "dailyWork"]);

  // Find maximum values for relative bar widths
  const maxHours = useMemo(() => {
    const hours = workByProject.map((p) => p.workingHours);
    return hours.length > 0 ? Math.max(...hours, 1) : 1;
  }, [workByProject]);

  const maxCost = useMemo(() => {
    const costs = workByProject.map((p) => p.totalCost);
    return costs.length > 0 ? Math.max(...costs, 1) : 1;
  }, [workByProject]);

  if (isLoading) {
    return (
      <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}>
          {t("dashboard:workOverview")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <LinearProgress />
          <LinearProgress />
        </Box>
      </AppCard>
    );
  }

  if (!workByProject || workByProject.length === 0) {
    return (
      <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}>
          {t("dashboard:workOverview")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "start" }}>
          {t("dashboard:noProjectWorkFound")}
        </Typography>
      </AppCard>
    );
  }

  return (
    <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 4, textAlign: "start" }}>
        {t("dashboard:workOverview")}
      </Typography>

      <Grid container spacing={4}>
        {/* Chart 1: Working Hours by Project */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, mb: 2.5, color: "text.primary", textAlign: "start" }}
          >
            {t("dashboard:workingHoursByProject")}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {workByProject.map((project) => {
              const percentage = Math.max(
                (project.workingHours / maxHours) * 100,
                3 // Minimum width to show a sliver of the bar
              );

              return (
                <Box key={project.projectId} sx={{ textAlign: "start" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.75,
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                      {project.projectName}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {t("dashboard:workingHoursFormat", { hours: project.workingHours })}
                    </Typography>
                  </Box>

                  {/* Horizontal Bar */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 10,
                      bgcolor: "rgba(37, 99, 235, 0.08)",
                      borderRadius: 5,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${percentage}%`,
                        height: "100%",
                        bgcolor: "primary.main",
                        borderRadius: 5,
                        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Grid>

        {/* Chart 2: Work Cost by Project */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, mb: 2.5, color: "text.primary", textAlign: "start" }}
          >
            {t("dashboard:workCostByProject")}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {workByProject.map((project) => {
              const percentage = Math.max(
                (project.totalCost / maxCost) * 100,
                3
              );

              return (
                <Box key={project.projectId} sx={{ textAlign: "start" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.75,
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                      {project.projectName}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "success.main" }}>
                      {project.totalCost.toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Horizontal Bar */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 10,
                      bgcolor: "rgba(22, 163, 74, 0.08)",
                      borderRadius: 5,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${percentage}%`,
                        height: "100%",
                        bgcolor: "success.main",
                        borderRadius: 5,
                        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Grid>
      </Grid>
    </AppCard>
  );
}
