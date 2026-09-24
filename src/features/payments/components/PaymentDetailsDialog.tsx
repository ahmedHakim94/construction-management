import { useMemo } from "react";
import { Payment as PaymentIcon } from "@mui/icons-material";
import {
  Box,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
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
  equipmentMap: Record<string, string>;
  transactions: PaymentTransaction[];
  onClose: () => void;
  onRecordPayment: () => void;
}

const statusColorMap = {
  PAID: { label: "statusPaid", color: "success" },
  PARTIALLY_PAID: { label: "statusPartiallyPaid", color: "warning" },
  UNPAID: { label: "statusUnpaid", color: "error" },
} as const;

export function PaymentDetailsDialog({
  open,
  payment,
  dailyWorkRecords,
  projectMap,
  taskMap,
  equipmentMap,
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
        equipmentLabel: record.equipmentId
          ? (equipmentMap[record.equipmentId] ?? "")
          : (record.temporaryEquipmentName ?? ""),
        taskName: taskMap[record.taskId] ?? record.taskId,
      })),
    [dailyWorkRecords, projectMap, equipmentMap, taskMap],
  );

  if (!payment) return null;

  const isPaid = payment.status === "PAID";
  const statusMeta = statusColorMap[payment.status] ?? statusColorMap.UNPAID;

  const summaryItems = [
    { label: t("totalAmount"), value: payment.grossAmount?.toLocaleString() ?? 0 },
    { label: t("paidAmount"), value: payment.paidAmount?.toLocaleString() ?? 0 },
    { label: t("remainingAmount"), value: payment.remainingAmount?.toLocaleString() ?? 0 },
  ];

  const tableHeadings = [
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
  ];

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Payment Summary */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              {t("contractor")}: {payment.contractorName}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {summaryItems.map(({ label, value }) => (
                <Box
                  key={label}
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
                    sx={{ color: "text.secondary", display: "block", mb: 0.5, fontWeight: 500 }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "text.primary", fontVariantNumeric: "tabular-nums" }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Daily Work Records */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: "1rem" }}>
              {t("dailyWorkRecords")}
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Box
                component="table"
                sx={{ width: "100%", minWidth: 900, borderCollapse: "collapse" }}
              >
                <Box component="thead" sx={{ bgcolor: "background.default" }}>
                  <Box component="tr">
                    {tableHeadings.map((heading) => (
                      <Box
                        component="th"
                        key={heading}
                        sx={{
                          px: 1.5,
                          py: 1.25,
                          textAlign: "start",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "text.secondary",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {heading}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {displayRecords.map((record) => (
                    <Box component="tr" key={record.id}>
                      {[
                        record.date,
                        record.projectName,
                        record.equipmentLabel,
                        record.taskName,
                        record.workingHours,
                        record.hourRate,
                        record.cost,
                        record.deduction,
                        record.deductionReason ?? "-",
                        record.cost - record.deduction,
                      ].map((val, cellIdx) => (
                        <Box
                          component="td"
                          key={cellIdx}
                          sx={{
                            px: 1.5,
                            py: 1.25,
                            fontSize: "0.875rem",
                            color: "text.primary",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {val}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Payment History */}
          <Box>
            {!isPaid && (
              <AppButton variant="contained" startIcon={<PaymentIcon />} onClick={onRecordPayment} sx={{ mt: 1, mb: 2 }}>
                {t("recordPayment")}
              </AppButton>
            )}
            <Typography variant="h6" sx={{ mb: 1, mt: isPaid ? 0 : 1, fontWeight: 600, fontSize: "1rem" }}>
              {t("paymentHistory")}
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Box
                component="table"
                sx={{ width: "100%", minWidth: 300, borderCollapse: "collapse" }}
              >
                <Box component="thead" sx={{ bgcolor: "background.default" }}>
                  <Box component="tr">
                    {[t("date"), t("paymentAmount")].map((heading) => (
                      <Box
                        component="th"
                        key={heading}
                        sx={{
                          px: 1.5,
                          py: 1.25,
                          textAlign: "start",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "text.secondary",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {heading}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {transactions.length === 0 ? (
                    <Box component="tr">
                      <Box
                        component="td"
                        colSpan={2}
                        sx={{
                          px: 1.5,
                          py: 2,
                          textAlign: "center",
                          color: "text.secondary",
                          fontSize: "0.875rem",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {t("noPaymentsRecorded")}
                      </Box>
                    </Box>
                  ) : (
                    transactions.map((transaction) => (
                      <Box component="tr" key={transaction.id}>
                        <Box
                          component="td"
                          sx={{
                            px: 1.5,
                            py: 1.25,
                            fontSize: "0.875rem",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {transaction.date}
                        </Box>
                        <Box
                          component="td"
                          sx={{
                            px: 1.5,
                            py: 1.25,
                            fontSize: "0.875rem",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
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
