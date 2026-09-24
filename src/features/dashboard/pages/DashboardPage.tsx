import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Construction as ConstructionIcon,
} from "@mui/icons-material";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppPageContainer, AppPageHeader } from "@/components/ui";
import SharedTotalNumber from "../components/SharedTotalNumber";
import { FinancialOverview } from "../components/FinancialOverview";
import { useDashboard } from "../hooks/useDashboard";
import { DailyWorkOverview } from "../components/DailyWorkOverview";
import { WorkByProject } from "../components/WorkByProject";

export function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const {
    stats,
    financials,
    dailyWork,
    workByProject,
    isLoading,
    isFinancialLoading,
  } = useDashboard();

  return (
    <PageContainer>
      <AppPageContainer
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3.5,
          pt: { xs: 2, sm: 2, md: 0 },
        }}
      >
        <AppPageHeader
          title={t("dashboard")}
          description={t("dashboardDescription")}
        />

        {/* 3 Summary Cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            width: "100%",
          }}
        >
          {/* Card 1: Total Projects */}
          <SharedTotalNumber
            number={stats?.projects}
            isLoading={isLoading}
            label={t("totalProjects")}
            Icon={BusinessIcon}
            style={{
              bgcolor: "action.hover",
              color: "primary.main",
              width: 52,
              height: 52,
              borderRadius: 2.5,
            }}
          />

          {/* Card 2: Total Contractors */}
          <SharedTotalNumber
            number={stats?.contractors}
            isLoading={isLoading}
            label={t("totalContractors")}
            Icon={PeopleIcon}
            style={{
              bgcolor: "secondary.light",
              color: "secondary.main",
              width: 52,
              height: 52,
              borderRadius: 2.5,
            }}
          />

          {/* Card 3: Total Equipment */}
          <SharedTotalNumber
            number={stats?.equipment}
            isLoading={isLoading}
            label={t("totalEquipment")}
            Icon={ConstructionIcon}
            style={{
              bgcolor: "action.hover",
              color: "primary.light",
              width: 52,
              height: 52,
              borderRadius: 2.5,
            }}
          />
        </Box>

        {/* Financial Overview Card */}
        <FinancialOverview
          totalCost={financials.totalCost}
          totalPaid={financials.totalPaid}
          remainingAmount={financials.remainingAmount}
          isLoading={isFinancialLoading}
        />

        {/* Work by Project Overview */}
        <WorkByProject
          workByProject={workByProject}
          isLoading={isFinancialLoading}
        />

        {/* Daily Work Overview */}
        <DailyWorkOverview
          dailyWork={dailyWork}
          isLoading={isFinancialLoading}
        />
      </AppPageContainer>
    </PageContainer>
  );
}
