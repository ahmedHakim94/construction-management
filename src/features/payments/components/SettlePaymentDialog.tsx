import { Box, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppButton, AppDialog } from "@/components/ui";
import type { DailyWork } from "@/features/daily-work/types";

interface SettlePaymentDialogProps {
  open: boolean;
  contractorName: string;
  startDate: string;
  endDate: string;
  grossAmount: number;
  totalDeductions: number;
  netAmount: number;
  records: DailyWork[];
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function SettlePaymentDialog({
  open,
  contractorName,
  startDate,
  endDate,
  grossAmount,
  totalDeductions,
  netAmount,
  records,
  onClose,
  onConfirm,
  loading = false,
}: SettlePaymentDialogProps) {
  const { t } = useTranslation();

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t("settlementPreview")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
          <Box>
            <Typography variant="subtitle2">{t("contractor")}</Typography>
            <Typography>{contractorName}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">{t("period")}</Typography>
            <Typography>{`${startDate} - ${endDate}`}</Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
            <Box sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2 }}>
              <Typography variant="subtitle2">{t("grossAmount")}</Typography>
              <Typography>{grossAmount}</Typography>
            </Box>
            <Box sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2 }}>
              <Typography variant="subtitle2">{t("totalDeductions")}</Typography>
              <Typography>{totalDeductions}</Typography>
            </Box>
            <Box sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2 }}>
              <Typography variant="subtitle2">{t("netDue")}</Typography>
              <Typography>{netAmount}</Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t("dailyWorkRecords")}
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                <Box component="thead" sx={{ bgcolor: "#F8FAFC" }}>
                  <Box component="tr">
                    {[t("date"), t("project"), t("cost"), t("deduction"), t("netAmount")].map((heading) => (
                      <Box
                        key={heading}
                        component="th"
                        sx={{ px: 1.5, py: 1, textAlign: "left", borderBottom: "1px solid #E5E7EB" }}
                      >
                        {heading}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {records.map((record) => (
                    <Box component="tr" key={record.id}>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.date}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.projectId}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.cost}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.deduction}
                      </Box>
                      <Box component="td" sx={{ px: 1.5, py: 1, borderBottom: "1px solid #E5E7EB" }}>
                        {record.cost - record.deduction}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <AppButton onClick={onClose}>{t("cancel")}</AppButton>
        <AppButton onClick={onConfirm} loading={loading}>
          {t("confirmSettlement")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
