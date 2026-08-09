import { useMemo } from "react";
import { Box, Chip, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog } from "@/components/ui";
import type { Payment, PaymentTransaction } from "../types";
import type { DailyWork } from "@/features/daily-work/types";

interface PaymentDetailsDialogProps {
  open: boolean;
  payment?: Payment & { contractorName: string };
  dailyWorkRecords: DailyWork[];
  projectMap: Record<string, string>;
  taskMap: Record<string, string>;
  transactions: PaymentTransaction[];
  onClose: () => void;
  onRecordPayment: () => void;
}

const statusChipProps = {
  PAID: { label: "statusPaid", color: "#f0fdf4", textColor: "#16a34a", border: "#bbf7d0" },
  PARTIALLY_PAID: { label: "statusPartiallyPaid", color: "#fffbeb", textColor: "#d97706", border: "#fde68a" },
  UNPAID: { label: "statusUnpaid", color: "#fff5f5", textColor: "#dc2626", border: "#fecaca" },
} as const;

export function PaymentDetailsDialog({
  open,
  payment,
  dailyWorkRecords,
  projectMap,
  taskMap,
  transactions,
  onClose,
  onRecordPayment,
}: PaymentDetailsDialogProps) {
  const { t } = useTranslation();

  const displayRecords = useMemo(
    () =>
      dailyWorkRecords.map((record) => ({
        ...record,
        projectName: projectMap[record.projectId] ?? record.projectId,
        equipmentLabel: record.equipmentId ?? record.temporaryEquipmentName ?? "",
        taskName: taskMap[record.taskId] ?? record.taskId,
        netAmount: record.cost - record.deduction,
      })),
    [dailyWorkRecords, projectMap, taskMap],
  );

  const isPaid = payment?.status === "PAID";
  const chipProps = payment ? statusChipProps[payment.status] : null;

  const summaryItems = payment
    ? [
        { label: t("grossAmount"), value: payment.grossAmount },
        { label: t("totalDeductions"), value: payment.totalDeductions },
        { label: t("netAmount"), value: payment.netAmount },
        { label: t("paidAmount"), value: payment.paidAmount },
        { label: t("remainingAmount"), value: payment.remainingAmount },
      ]
    : [];

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t("paymentDetails")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

          {/* Contractor & Period */}
          <Box>
            <Typography variant="subtitle2">{t("contractor")}</Typography>
            <Typography>{payment?.contractorName ?? ""}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">{t("period")}</Typography>
            <Typography>{`${payment?.startDate ?? ""} - ${payment?.endDate ?? ""}`}</Typography>
          </Box>

          <Divider />

          {/* Payment Summary */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
              <Typography variant="h6">{t("paymentPreview")}</Typography>
              {chipProps && (
                <Chip
                  label={t(chipProps.label)}
                  size="small"
                  sx={{
                    backgroundColor: chipProps.color,
                    color: chipProps.textColor,
                    border: `1px solid ${chipProps.border}`,
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                />
              )}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" },
                gap: 1.5,
              }}
            >
              {summaryItems.map(({ label, value }) => (
                <Box
                  key={label}
                  sx={{
                    bgcolor: "#F8FAFC",
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#64748B", display: "block", mb: 0.5 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#1E293B" }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Daily Work Records */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t("dailyWorkRecords")}
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                <Box component="thead" sx={{ bgcolor: "#F8FAFC" }}>
                  <Box component="tr">
                    {[
                      t("date"),
                      t("project"),
                      t("equipment"),
                      t("task"),
                      t("workingHours"),
                      t("hourRate"),
                      t("cost"),
                      t("deduction"),
                      t("deductionReason"),
                      t("netAmount"),
                    ].map((heading) => (
                      <Box
                        component="th"
                        key={heading}
                        sx={{ px: 1.5, py: 1, textAlign: "left", borderBottom: "1px solid #E5E7EB" }}
                      >
                        {heading}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {displayRecords.map((record) => (
                    <Box component="tr" key={record.id}>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.date}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.projectName}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.equipmentLabel}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.taskName}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.workingHours}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.hourRate}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.cost}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.deduction}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.deductionReason ?? "-"}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.netAmount}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Payment History */}
          <Box>
            {!isPaid && (
              <AppButton onClick={onRecordPayment} sx={{ mt: 2, mb: 2 }}>
                {t("recordPayment")}
              </AppButton>
            )}
            <Typography variant="h6" sx={{ mb: 1, mt: isPaid ? 0 : 1 }}>
              {t("paymentHistory")}
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                <Box component="thead" sx={{ bgcolor: "#F8FAFC" }}>
                  <Box component="tr">
                    {[t("date"), t("paymentAmount")].map((heading) => (
                      <Box
                        component="th"
                        key={heading}
                        sx={{ px: 1.5, py: 1, textAlign: "left", borderBottom: "1px solid #E5E7EB" }}
                      >
                        {heading}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {transactions.length === 0 ? (
                    <Box component="tr">
                      <Box component="td" colSpan={2} sx={{ px: 1.5, py: 1, textAlign: "center", borderBottom: "1px solid #E5E7EB" }}>
                        {t("noPaymentsRecorded")}
                      </Box>
                    </Box>
                  ) : (
                    transactions.map((transaction) => (
                      <Box component="tr" key={transaction.id}>
                        <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                          {transaction.date}
                        </Box>
                        <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                          {transaction.amount}
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <AppButton onClick={onClose}>{t("close")}</AppButton>
      </DialogActions>
    </AppDialog>
  );
}
