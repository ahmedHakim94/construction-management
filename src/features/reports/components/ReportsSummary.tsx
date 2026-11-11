import { Box, Typography, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppCard } from "@/components/ui";
import {
  AccountBalanceWalletOutlined,
  AssignmentOutlined,
  AccessTimeOutlined,
  PaidOutlined,
  AccountBalanceOutlined,
  LocalOffer,
} from "@mui/icons-material";
import type { ReportSummary } from "../types";

export interface ReportsSummaryProps {
  summary: ReportSummary;
  isLoading: boolean;
}

export function ReportsSummary({ summary, isLoading }: ReportsSummaryProps) {
  const { t } = useTranslation(["reports"]);

  const summaryItems = [
    {
      label: t("reports:totalWorkRecords"),
      value: summary.totalWorkRecords,
      color: "primary.main",
      bg: "action.hover",
      Icon: AssignmentOutlined,
    },
    {
      label: t("reports:totalWorkingHours"),
      value: summary.totalWorkingHours,
      color: "secondary.main",
      bg: "secondary.light",
      Icon: AccessTimeOutlined,
    },
    {
      label: t("reports:totalWorkCost"),
      value: summary.totalWorkCost,
      color: "primary.light",
      bg: "action.hover",
      Icon: AccountBalanceWalletOutlined,
    },
    {
      label: t("reports:totalDeductions"),
      value: summary.totalDeductions,
      color: "primary.light",
      bg: "action.hover",
      Icon: LocalOffer,
    },
    {
      label: t("reports:totalPaidAmount"),
      value: summary.totalPaidAmount,
      color: "success.main",
      bg: "success.light",
      Icon: PaidOutlined,
    },
    {
      label: t("reports:remainingBalance"),
      value: summary.remainingBalance,
      color: "warning.main",
      bg: "warning.light",
      Icon: AccountBalanceOutlined,
    },
  ];

  return (
    <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}
      >
        {t("reports:reportsSummary")}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {summaryItems.map((item, index) => {
          const Icon = item.Icon;
          return (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                minWidth: 185,
                alignItems: "center",
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: item.bg,
                  color: item.color,
                }}
              >
                <Icon sx={{ fontSize: 24 }} />
              </Box>

              <Box sx={{ textAlign: "start" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  {item.label}
                </Typography>
                {isLoading ? (
                  <Skeleton width={100} height={32} />
                ) : (
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.value.toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </AppCard>
  );
}
