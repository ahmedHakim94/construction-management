import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface PaymentSummaryProps {
  grossAmount: number;
  totalDeductions: number;
  netAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  status?: string;
}

const summaryCardStyles = {
  p: 2,
  border: "1px solid #E5E7EB",
  borderRadius: 2,
};

export function PaymentSummary({
  grossAmount,
  totalDeductions,
  netAmount,
  paidAmount,
  remainingAmount,
  status,
}: PaymentSummaryProps) {
  const { t } = useTranslation();

  const cards: { label: string; value: number | string }[] = [
    { label: t("grossAmount"), value: grossAmount },
    { label: t("totalDeductions"), value: totalDeductions },
    { label: t("netDue"), value: netAmount },
  ];

  if (paidAmount !== undefined) {
    cards.push({ label: t("paidAmount"), value: paidAmount });
  }

  if (remainingAmount !== undefined) {
    cards.push({ label: t("remainingAmount"), value: remainingAmount });
  }

  if (status !== undefined) {
    cards.push({ label: t("status"), value: status });
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
      {cards.map((card) => (
        <Box key={card.label} sx={summaryCardStyles}>
          <Typography variant="subtitle2">{card.label}</Typography>
          <Typography>{card.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}
