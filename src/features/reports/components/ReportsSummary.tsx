import { Box, Typography, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppCard } from "@/components/ui";
import {
  AccountBalanceWalletOutlined,
  TrendingDownOutlined,
  TrendingUpOutlined,
  PaidOutlined,
  AccountBalanceOutlined,
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
      label: t("reports:totalWorkCost"),
      value: summary.totalWorkCost,
      color: "primary.main",
      bg: "rgba(37, 99, 235, 0.08)",
      Icon: AccountBalanceWalletOutlined,
    },
    {
      label: t("reports:totalDeductions"),
      value: summary.totalDeductions,
      color: "error.main",
      bg: "rgba(220, 38, 38, 0.08)",
      Icon: TrendingDownOutlined,
    },
    {
      label: t("reports:netWorkAmount"),
      value: summary.netWorkAmount,
      color: "info.main",
      bg: "rgba(2, 136, 209, 0.08)",
      Icon: TrendingUpOutlined,
    },
    {
      label: t("reports:totalPaidAmount"),
      value: summary.totalPaidAmount,
      color: "success.main",
      bg: "rgba(22, 163, 74, 0.08)",
      Icon: PaidOutlined,
    },
    {
      label: t("reports:remainingBalance"),
      value: summary.remainingBalance,
      color: "warning.main",
      bg: "rgba(237, 108, 2, 0.08)",
      Icon: AccountBalanceOutlined,
    },
  ];

  return (
    <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}>
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
                flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(20% - 20px)" },
                minWidth: 185,
                display: "flex",
                alignItems: "center",
                gap: 2,
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
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {item.label}
                </Typography>
                {isLoading ? (
                  <Skeleton width={100} height={32} />
                ) : (
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
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
