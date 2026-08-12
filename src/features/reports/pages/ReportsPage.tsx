import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppCard, AppPageHeader } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useReports } from "../hooks/useReports";
import { ReportsTable } from "../components/ReportsTable";
import { ReportsFilters } from "../components/ReportsFilters";
import { ReportsSummary } from "../components/ReportsSummary";
import { DailyWorkReportTable } from "../components/DailyWorkReportTable";

export function ReportsPage() {
  const { t } = useTranslation(["reports"]);
  const {
    reports,
    summary,
    projects,
    filters,
    setFilters,
    dailyWorkReports,
    isLoading,
  } = useReports();

  const projectOptions = useMemo(() => {
    return [
      { value: "", label: t("reports:allProjects") },
      ...projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    ];
  }, [projects, t]);

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <AppPageHeader
          title={t("reports")}
          description={t("reportsDescription")}
          actions={null}
        />

        <ReportsFilters
          projectId={filters.projectId}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onProjectIdChange={setFilters.setProjectId}
          onDateFromChange={setFilters.setDateFrom}
          onDateToChange={setFilters.setDateTo}
          projectOptions={projectOptions}
        />

        <ReportsSummary summary={summary} isLoading={isLoading} />

        <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
          <ReportsTable rows={reports} isLoading={isLoading} />
        </AppCard>

        <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}>
            {t("reports:dailyWorkDetailedReport")}
          </Typography>
          <DailyWorkReportTable rows={dailyWorkReports} isLoading={isLoading} />
        </AppCard>
      </Box>
    </PageContainer>
  );
}
