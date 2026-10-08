import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PaymentSummary } from "../types";
import { formatAmount } from "../utils";

interface Props {
  summary: PaymentSummary;
}

export function PaymentSummarySection({ summary }: Props) {
  const { t } = useTranslation();
  const items = [
    { label: t("totalAmount"), value: summary.grossAmount },
    { label: t("paidAmount"), value: summary.paidAmount },
    { label: t("remainingAmount"), value: summary.remainingAmount },
  ];

  return (
    <Box>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ mb: 1, fontWeight: 600 }}
      >
        {t("contractor")}: {summary.contractorName}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("project")}: {summary.projectName} —{" "}
        {String(summary.month).padStart(2, "0")}/{summary.year}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {items.map((item) => (
          <Box
            key={item.label}
            sx={{
              bgcolor: "background.default",
              borderRadius: 2,
              px: 2,
              py: 1.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              {item.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
            >
              {formatAmount(item.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
