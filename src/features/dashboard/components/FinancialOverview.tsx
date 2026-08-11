import { Box, Typography, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppCard } from "@/components/ui";
import {
  AccountBalanceWalletOutlined,
  PaidOutlined,
  TrendingDownOutlined,
} from "@mui/icons-material";

interface FinancialOverviewProps {
  totalCost: number;
  totalPaid: number;
  remainingAmount: number;
  isLoading: boolean;
}

export function FinancialOverview({
  totalCost,
  totalPaid,
  remainingAmount,
  isLoading,
}: FinancialOverviewProps) {
  const { t } = useTranslation("dashboard");

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const financialItems = [
    {
      label: t("totalCost"),
      value: totalCost,
      color: "primary.main",
      bg: "rgba(37, 99, 235, 0.08)",
      Icon: AccountBalanceWalletOutlined,
    },
    {
      label: t("totalPaid"),
      value: totalPaid,
      color: "success.main",
      bg: "rgba(22, 163, 74, 0.08)",
      Icon: PaidOutlined,
    },
    {
      label: t("remainingAmount"),
      value: remainingAmount,
      color: "warning.main",
      bg: "rgba(237, 108, 2, 0.08)",
      Icon: TrendingDownOutlined,
    },
  ];

  return (
    <AppCard sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: "start" }}>
        {t("financialOverview")}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {financialItems.map((item, index) => {
          const Icon = item.Icon;
          return (
            <Box
              key={index}
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 calc(33.333% - 16px)" },
                minWidth: 200,
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
                    {formatNumber(item.value)}
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
