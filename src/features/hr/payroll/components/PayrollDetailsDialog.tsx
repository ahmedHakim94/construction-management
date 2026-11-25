import {
  Alert,
  Box,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  type Theme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Close from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import {
  AppBadge,
  AppButton,
  AppDialog,
  DialogLoadingOverlay,
} from "@/components/ui";
import { useGetEmployeePayrollDetailsQuery } from "../services/payroll.api";
import type { PayrollRecord } from "../types";

const MONEY_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const LTR_NUM_SX = {
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
} as const;

const TITLE_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
} as const;

const CONTENT_SX = {
  position: "relative",
  minHeight: 240,
} as const;

const HEADER_ROW_SX = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1,
} as const;

const BREAKDOWN_CARD_SX = {
  p: 2,
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.default",
} as const;

const SECTION_HEADER_SX = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 1,
} as const;

const ITEM_CARD_SX = {
  p: 1.25,
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "divider",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 1.5,
} as const;

const LOAN_ITEM_CARD_SX = {
  ...ITEM_CARD_SX,
  alignItems: "center",
} as const;

const METRIC_ROW_SX = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 1.5,
} as const;

const getNetSalaryBoxSx = (theme: Theme) => ({
  p: 2,
  borderRadius: 1.5,
  bgcolor: alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

interface PayrollDetailsDialogProps {
  open: boolean;
  record?: PayrollRecord;
  onClose: () => void;
}

interface MetricRowProps {
  label: string;
  value: string | number;
  highlightColor?: string;
  bold?: boolean;
}

function MetricRow({ label, value, highlightColor, bold }: MetricRowProps) {
  return (
    <Box sx={METRIC_ROW_SX}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={bold ? 700 : 600}
        color={highlightColor ?? "text.primary"}
      >
        <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
          {value}
        </Box>
      </Typography>
    </Box>
  );
}

export function PayrollDetailsDialog({
  open,
  record,
  onClose,
}: PayrollDetailsDialogProps) {
  const { t, i18n } = useTranslation(["hr", "common"]);
  const isArabic = i18n.language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const {
    data: fetchedDetails,
    isLoading,
    isFetching,
  } = useGetEmployeePayrollDetailsQuery(
    {
      employeeId: record?.employeeId ?? 0,
      month: record?.month,
    },
    {
      skip: !open || !record,
    },
  );

  const loading = isLoading || isFetching;
  const activeRecord = fetchedDetails ?? record;

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle dir={dir} sx={TITLE_SX}>
        <span>{t("hr:payrollDetails")}</span>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label={t("hr:close")}
          sx={{ color: "text.secondary" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dir={dir} sx={CONTENT_SX}>
        <DialogLoadingOverlay loading={loading} />

        {activeRecord ? (
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            {/* Employee & Month Header */}
            <Box sx={HEADER_ROW_SX}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {activeRecord.employeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                    {activeRecord.employeeCode}
                  </Box>
                  {activeRecord.employeeJobTitle
                    ? ` • ${activeRecord.employeeJobTitle}`
                    : ""}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  label={
                    <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                      {activeRecord.month}
                    </Box>
                  }
                  sx={{ fontWeight: 600 }}
                />
                {activeRecord.isInactive ? (
                  <AppBadge
                    label={t("common:inactive")}
                    color="default"
                    size="small"
                  />
                ) : (
                  <AppBadge
                    label={t(
                      activeRecord.status === "PAID"
                        ? "hr:payrollStatusPaid"
                        : "hr:payrollStatusPending",
                    )}
                    color={activeRecord.status === "PAID" ? "success" : "warning"}
                    size="small"
                  />
                )}
              </Stack>
            </Box>

            {activeRecord.isInactive ? (
              <Alert severity="info">
                {t("hr:inactiveEmployeePayrollNote")}
              </Alert>
            ) : (
              <>
                {activeRecord.status === "PAID" && activeRecord.paidAt ? (
                  <Alert severity="success" sx={{ py: 0.5 }}>
                    {t("hr:payrollLockedInfo", { date: activeRecord.paidAt })}
                  </Alert>
                ) : null}

                {/* Salary & Attendance Breakdown */}
                <Box sx={BREAKDOWN_CARD_SX}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ mb: 1.5 }}
                  >
                    {t("hr:salaryAndAttendanceBreakdown")}
                  </Typography>
                  <Stack spacing={1}>
                    <MetricRow
                      label={t("hr:basicSalary")}
                      value={MONEY_FORMATTER.format(activeRecord.basicSalary)}
                    />
                    <MetricRow
                      label={t("hr:dailyRate")}
                      value={MONEY_FORMATTER.format(activeRecord.dailyRate)}
                    />
                    <Divider sx={{ my: 0.5 }} />
                    <MetricRow
                      label={t("hr:attendanceDays")}
                      value={MONEY_FORMATTER.format(activeRecord.attendanceDays)}
                    />
                    <MetricRow
                      label={t("hr:payableWorkingDays")}
                      value={MONEY_FORMATTER.format(
                        activeRecord.payableWorkingDays,
                      )}
                    />
                    <MetricRow
                      label={t("hr:totalAbsenceDays")}
                      value={MONEY_FORMATTER.format(
                        activeRecord.totalAbsenceDays,
                      )}
                    />
                    <MetricRow
                      label={t("hr:paidAbsenceDays")}
                      value={MONEY_FORMATTER.format(
                        activeRecord.paidAbsenceDays,
                      )}
                      highlightColor="success.main"
                    />
                    <MetricRow
                      label={t("hr:unpaidAbsenceDays")}
                      value={MONEY_FORMATTER.format(
                        activeRecord.unpaidAbsenceDays,
                      )}
                      highlightColor={
                        activeRecord.unpaidAbsenceDays > 0
                          ? "error.main"
                          : "text.secondary"
                      }
                    />
                    <MetricRow
                      label={t("hr:unpaidAbsenceDeduction")}
                      value={
                        activeRecord.unpaidAbsenceDeduction > 0
                          ? `-${MONEY_FORMATTER.format(activeRecord.unpaidAbsenceDeduction)}`
                          : "0"
                      }
                      highlightColor={
                        activeRecord.unpaidAbsenceDeduction > 0
                          ? "error.main"
                          : "text.secondary"
                      }
                    />
                    <Divider sx={{ my: 0.5 }} />
                    <MetricRow
                      label={t("hr:extraWorkingDays")}
                      value={MONEY_FORMATTER.format(activeRecord.extraDays)}
                      highlightColor={
                        activeRecord.extraDays > 0
                          ? "success.main"
                          : "text.secondary"
                      }
                    />
                    <MetricRow
                      label={t("hr:extraDaysAmount")}
                      value={
                        activeRecord.extraDaysAmount > 0
                          ? `+${MONEY_FORMATTER.format(activeRecord.extraDaysAmount)}`
                          : "0"
                      }
                      highlightColor={
                        activeRecord.extraDaysAmount > 0
                          ? "success.main"
                          : "text.secondary"
                      }
                    />
                  </Stack>
                </Box>

                {/* Bonuses List */}
                <Box>
                  <Box sx={SECTION_HEADER_SX}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {t("hr:payrollBonuses")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={
                        activeRecord.totalBonuses > 0
                          ? "success.main"
                          : "text.secondary"
                      }
                    >
                      <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                        {activeRecord.totalBonuses > 0
                          ? `+${MONEY_FORMATTER.format(activeRecord.totalBonuses)}`
                          : "0"}
                      </Box>
                    </Typography>
                  </Box>
                  {activeRecord.bonuses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t("hr:noBonusesForMonth")}
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {activeRecord.bonuses.map((bonus) => (
                        <Box key={bonus.id} sx={ITEM_CARD_SX}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {bonus.reason || "—"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {bonus.projectName} •{" "}
                              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                                {bonus.date}
                              </Box>
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="success.main"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                              +{MONEY_FORMATTER.format(bonus.amount)}
                            </Box>
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>

                <Divider />

                {/* Deductions List */}
                <Box>
                  <Box sx={SECTION_HEADER_SX}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {t("hr:payrollDeductions")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={
                        activeRecord.totalDeductions > 0
                          ? "error.main"
                          : "text.secondary"
                      }
                    >
                      <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                        {activeRecord.totalDeductions > 0
                          ? `-${MONEY_FORMATTER.format(activeRecord.totalDeductions)}`
                          : "0"}
                      </Box>
                    </Typography>
                  </Box>
                  {activeRecord.deductions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t("hr:noDeductionsForMonth")}
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {activeRecord.deductions.map((deduction) => (
                        <Box key={deduction.id} sx={ITEM_CARD_SX}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {deduction.reason || "—"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {deduction.projectName} •{" "}
                              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                                {deduction.date}
                              </Box>
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="error.main"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                              -{MONEY_FORMATTER.format(deduction.amount)}
                            </Box>
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>

                <Divider />

                {/* Loans List */}
                <Box>
                  <Box sx={SECTION_HEADER_SX}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {t("hr:loans")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={
                        activeRecord.totalLoans > 0
                          ? "warning.dark"
                          : "text.secondary"
                      }
                    >
                      <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                        {activeRecord.totalLoans > 0
                          ? `-${MONEY_FORMATTER.format(activeRecord.totalLoans)}`
                          : "0"}
                      </Box>
                    </Typography>
                  </Box>
                  {activeRecord.loans.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t("hr:noLoansForMonth")}
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {activeRecord.loans.map((loan) => (
                        <Box key={loan.id} sx={LOAN_ITEM_CARD_SX}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {loan.projectName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                                {loan.date}
                              </Box>
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="warning.dark"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                              -{MONEY_FORMATTER.format(loan.amount)}
                            </Box>
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* Final Net Salary */}
                <Box sx={getNetSalaryBoxSx}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {t("hr:netSalary")}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="primary.main"
                  >
                    <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                      {MONEY_FORMATTER.format(activeRecord.netSalary)}
                    </Box>
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions dir={dir} sx={{ px: 3, pb: 2 }}>
        <AppButton variant="outlined" onClick={onClose}>
          {t("hr:close")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
