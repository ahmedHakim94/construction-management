import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppCard, AppPageHeader } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useReports } from "../hooks/useReports";
import { ReportsTable } from "../components/ReportsTable";

export function ReportsPage() {
  const { t } = useTranslation("reports");
  const { reports, isLoading } = useReports();

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <AppPageHeader
          title={t("reports")}
          description={t("reportsDescription")}
          actions={null}
        />

        <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
          <ReportsTable rows={reports} isLoading={isLoading} />
        </AppCard>
      </Box>
    </PageContainer>
  );
}
