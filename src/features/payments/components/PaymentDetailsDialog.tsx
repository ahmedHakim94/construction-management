import {
  Box,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog } from "@/components/ui";
import { useGetPaymentDetailsQuery } from "../services/payment.api";
import type { PaymentSummary } from "../types";
import { PaymentSummarySection } from "./PaymentSummarySection";
import { PaymentDailyWorksSection } from "./PaymentDailyWorksSection";
import { PaymentHistorySection } from "./PaymentHistorySection";

interface PaymentDetailsDialogProps {
  open: boolean;
  payment: PaymentSummary | null;
  onClose: () => void;
  onRecordPayment: (payment: PaymentSummary) => void;
}

const statusColorMap = {
  PAID: { label: "statusPaid", color: "success" },
  PARTIALLY_PAID: { label: "statusPartiallyPaid", color: "warning" },
  UNPAID: { label: "statusUnpaid", color: "error" },
} as const;

export function PaymentDetailsDialog({
  open,
  payment,
  onClose,
  onRecordPayment,
}: PaymentDetailsDialogProps) {
  const { t } = useTranslation();
  const { data, isLoading, isFetching, isError } = useGetPaymentDetailsQuery(
    {
      contractorId: payment?.contractorId ?? 0,
      projectId: payment?.projectId ?? 0,
      year: payment?.year ?? 0,
      month: payment?.month ?? 0,
    },
    { skip: !open || !payment },
  );

  if (!payment) return null;

  const summary = data?.summary ?? payment;
  const statusMeta = statusColorMap[summary.status] ?? statusColorMap.UNPAID;

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t("paymentDetails")}
          </Typography>
          <Chip
            size="small"
            label={t(statusMeta.label)}
            color={statusMeta.color}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" sx={{ py: 3 }}>
            {t("errorLoadingData")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <PaymentSummarySection summary={summary} />
            <Divider />
            <PaymentDailyWorksSection
              records={data?.dailyWorks ?? []}
              projectName={summary.projectName}
            />
            <Divider />
            <PaymentHistorySection
              summary={summary}
              transactions={data?.transactions ?? []}
              loading={isFetching}
              onRecordPayment={onRecordPayment}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <AppButton onClick={onClose}>{t("close")}</AppButton>
      </DialogActions>
    </AppDialog>
  );
}
