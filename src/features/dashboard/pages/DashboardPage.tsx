import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Construction as ConstructionIcon,
} from "@mui/icons-material";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppPageContainer, AppPageHeader } from "@/components/ui";
import { projectService } from "@/features/settings/projects/services/project.service";
import { contractorService } from "@/features/contractors/services/contractor.service";
import { equipmentService } from "@/features/equipment/services/equipment.service";
import { paymentService } from "@/features/payments/services/payment.service";
import SharedTotalNumber from "../components/SharedTotalNumber";
import { FinancialOverview } from "../components/FinancialOverview";

export function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [isFinancialLoading, setIsFinancialLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    contractors: 0,
    equipment: 0,
  });
  const [financials, setFinancials] = useState({
    totalCost: 0,
    totalPaid: 0,
    remainingAmount: 0,
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const [projectsData, contractorsData, equipmentData] =
          await Promise.all([
            projectService.getAll(),
            contractorService.getAll(),
            equipmentService.getAll(),
          ]);
        if (isMounted) {
          setStats({
            projects: projectsData?.length ?? 0,
            contractors: contractorsData?.length ?? 0,
            equipment: equipmentData?.length ?? 0,
          });
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    void fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchFinancials() {
      try {
        const paymentsData = await paymentService.getAll();
        console.log("🚀 ~ fetchFinancials ~ paymentsData:", paymentsData)
        if (isMounted) {
          const totalCost = paymentsData.reduce(
            (sum, item) => sum + (item.netAmount ?? 0),
            0,
          );
          const totalPaid = paymentsData.reduce(
            (sum, item) => sum + (item.paidAmount ?? 0),
            0,
          );
          const remainingAmount = paymentsData.reduce(
            (sum, item) => sum + (item.remainingAmount ?? 0),
            0,
          );
          setFinancials({
            totalCost,
            totalPaid,
            remainingAmount,
          });
        }
      } catch (err) {
        console.error("Error loading financial data", err);
      } finally {
        if (isMounted) {
          setIsFinancialLoading(false);
        }
      }
    }
    void fetchFinancials();
    return () => {
      isMounted = false;
    };
  }, []);

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
