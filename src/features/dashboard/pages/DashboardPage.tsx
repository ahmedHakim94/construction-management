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

export function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { stats, financials, isLoading, isFinancialLoading } = useDashboard();


  return (
    <PageContainer>
      <AppPageContainer
        sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}
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
              bgcolor: "rgba(37, 99, 235, 0.08)",
              color: "primary.main",
              width: 56,
              height: 56,
              borderRadius: 3,
            }}
          />

          {/* Card 2: Total Contractors */}
          <SharedTotalNumber
            number={stats?.contractors}
            isLoading={isLoading}
            label={t("totalContractors")}
            Icon={PeopleIcon}
            style={{
              bgcolor: "rgba(22, 163, 74, 0.08)",
              color: "success.main",
              width: 56,
              height: 56,
              borderRadius: 3,
            }}
          />

          {/* Card 3: Total Equipment */}
          <SharedTotalNumber
            number={stats?.equipment}
            isLoading={isLoading}
            label={t("totalEquipment")}
            Icon={ConstructionIcon}
            style={{
              bgcolor: "rgba(220, 38, 38, 0.08)",
              color: "error.main",
              width: 56,
              height: 56,
              borderRadius: 3,
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
      </AppPageContainer>
    </PageContainer>
  );
}
