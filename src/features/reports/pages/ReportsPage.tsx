
import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { AppCard, AppPageHeader } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { notify } from "@/shared/utils/notify";
import { useReports } from "../hooks/useReports";
import { ReportsTable } from "../components/ReportsTable";
import { ReportsFilters } from "../components/ReportsFilters";
import { ReportsSummary } from "../components/ReportsSummary";
import { DailyWorkReportTable } from "../components/DailyWorkReportTable";
import { ContractorsReportTable } from "../components/ContractorsReportTable";
import { ExportButtonMenu } from "../components/ExportButtonMenu";
import { exportToExcel } from "../utils/exportExcel";
import { exportToPdf } from "../utils/exportPdf";
import type { ExportColumnDef } from "../utils/export.types";
import {
  getProjectsReportColumns,
  getDailyWorkReportColumns,
  getContractorsReportColumns,
} from "../utils/reportColumns";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

export function ReportsPage() {
  const { t, i18n } = useTranslation([
    "reports",
    "dailyWork",
    "dashboard",
    "common",
  ]);

  const { hasPermission } = usePermissions();
  const canExport = hasPermission("reports.export");

  const isRtl = i18n.language === "ar" || i18n.dir() === "rtl";

  const {
    reports,
    summary,
    projects,
    filters,
    setFilters,
    dailyWorkReports,
    contractorReports,
    isLoading,
  } = useReports();

  const projectOptions = useMemo(
    () => [
      { value: "", label: t("reports:allProjects") },
      ...projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    ],
    [projects, t],
  );

  const filterInfo = useMemo(() => {
    const selectedProject = projects.find(
      (project) => String(project.id) === String(filters.projectId),
    );

    const projectName = selectedProject
      ? selectedProject.name
      : t("reports:allProjects");

    let dateRange = "";

    if (filters.dateFrom && filters.dateTo) {
      dateRange = `${filters.dateFrom.format("YYYY-MM-DD")} - ${filters.dateTo.format("YYYY-MM-DD")}`;
    } else if (filters.dateFrom) {
      dateRange = `≥ ${filters.dateFrom.format("YYYY-MM-DD")}`;
    } else if (filters.dateTo) {
      dateRange = `≤ ${filters.dateTo.format("YYYY-MM-DD")}`;
    }

    return { projectName, dateRange };
  }, [projects, filters, t]);

  const projectsColumns = useMemo(
    () => getProjectsReportColumns(t),
    [t],
  );

  const dailyWorkColumns = useMemo(
    () => getDailyWorkReportColumns(t),
    [t],
  );

  const contractorColumns = useMemo(
    () => getContractorsReportColumns(t),
    [t],
  );

  const handleExport = async <T,>(
    format: "excel" | "pdf",
    title: string,
    columns: ExportColumnDef<T>[],
    data: T[],
  ) => {
    try {
      const options = {
        title,
        filename: `${title}_${dayjs().format("YYYY-MM-DD")}`,
        columns,
        data,
        filterInfo,
        isRtl,
        t,
      };

      if (format === "excel") {
        await exportToExcel(options);
      } else {
        await exportToPdf(options);
      }
    } catch (error) {
      console.error(error);
      notify.error(t("common:somethingWentWrong"));
    }
  };

  return (
    <PageContainer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          pt: { xs: 2, sm: 2, md: 0 },
        }}
      >
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

        <ReportsSummary
          summary={summary}
          isLoading={isLoading}
        />

        {/* Projects Report */}
        <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, textAlign: "start" }}
            >
              {t("reports:projectsReport")}
            </Typography>

            {canExport && (
              <ExportButtonMenu
                disabled={reports.length === 0 || isLoading}
                onExportExcel={() =>
                  handleExport(
                    "excel",
                    t("reports:projectsReport"),
                    projectsColumns,
                    reports,
                  )
                }
                onExportPdf={() =>
                  handleExport(
                    "pdf",
                    t("reports:projectsReport"),
                    projectsColumns,
                    reports,
                  )
                }
              />
            )}
          </Box>

          <ReportsTable
            rows={reports}
            isLoading={isLoading}
          />
        </AppCard>

        {/* Daily Work Report */}
        <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, textAlign: "start" }}
            >
              {t("reports:dailyWorkDetailedReport")}
            </Typography>

            {canExport && (
              <ExportButtonMenu
                disabled={dailyWorkReports.length === 0 || isLoading}
                onExportExcel={() =>
                  handleExport(
                    "excel",
                    t("reports:dailyWorkDetailedReport"),
                    dailyWorkColumns,
                    dailyWorkReports,
                  )
                }
                onExportPdf={() =>
                  handleExport(
                    "pdf",
                    t("reports:dailyWorkDetailedReport"),
                    dailyWorkColumns,
                    dailyWorkReports,
                  )
                }
              />
            )}
          </Box>

          <DailyWorkReportTable
            rows={dailyWorkReports}
            isLoading={isLoading}
          />
        </AppCard>

        {/* Contractors Report */}
        <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, textAlign: "start" }}
            >
              {t("reports:contractorsReport")}
            </Typography>

            {canExport && (
              <ExportButtonMenu
                disabled={contractorReports.length === 0 || isLoading}
                onExportExcel={() =>
                  handleExport(
                    "excel",
                    t("reports:contractorsReport"),
                    contractorColumns,
                    contractorReports,
                  )
                }
                onExportPdf={() =>
                  handleExport(
                    "pdf",
                    t("reports:contractorsReport"),
                    contractorColumns,
                    contractorReports,
                  )
                }
              />
            )}
          </Box>

          <ContractorsReportTable
            rows={contractorReports}
            isLoading={isLoading}
          />
        </AppCard>
      </Box>
    </PageContainer>
  );
}
