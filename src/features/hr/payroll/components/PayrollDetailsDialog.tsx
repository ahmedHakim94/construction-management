import { useMemo } from "react";
import {
  Alert,
  Box,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { AppBadge, AppButton, AppDialog } from "@/components/ui";
import type { PayrollRecord } from "../types";

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
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={bold ? 700 : 600}
        color={highlightColor ?? "text.primary"}
        sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
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

  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [],
  );

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle dir={isArabic ? "rtl" : "ltr"}>
        {t("hr:payrollDetails")}
      </DialogTitle>

      <DialogContent dir={isArabic ? "rtl" : "ltr"}>
        {record && (
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            {/* Employee & Month Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {record.employeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {record.employeeCode} • {record.employeeJobTitle}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  label={record.month}
                  sx={{ direction: "ltr", fontWeight: 600 }}
                />
                {record.isInactive ? (
                  <AppBadge
                    label={t("common:inactive")}
                    color="default"
                    size="small"
                  />
                ) : (
                  <AppBadge
                    label={t(
                      record.status === "PAID"
                        ? "hr:payrollStatusPaid"
                        : "hr:payrollStatusPending",
                    )}
                    color={record.status === "PAID" ? "success" : "warning"}
                    size="small"
                  />
                )}
              </Stack>
            </Box>

            {record.isInactive ? (
              <Alert severity="info">{t("hr:inactiveEmployeePayrollNote")}</Alert>
            ) : (
              <>
                {record.status === "PAID" && record.paidAt && (
                  <Alert severity="success" sx={{ py: 0.5 }}>
                    {t("hr:payrollLockedInfo", { date: record.paidAt })}
                  </Alert>
                )}

                {/* Salary & Attendance Breakdown */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                >
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
                      value={moneyFormatter.format(record.basicSalary)}
                    />
                    <MetricRow
                      label={t("hr:dailyRate")}
                      value={moneyFormatter.format(record.dailyRate)}
                    />
                    <Divider sx={{ my: 0.5 }} />
                    <MetricRow
                      label={t("hr:attendanceDays")}
                      value={moneyFormatter.format(record.attendanceDays)}
                    />
                    <MetricRow
                      label={t("hr:payableWorkingDays")}
                      value={moneyFormatter.format(record.payableWorkingDays)}
                    />
                    <MetricRow
                      label={t("hr:totalAbsenceDays")}
                      value={moneyFormatter.format(record.totalAbsenceDays)}
                    />
                    <MetricRow
                      label={t("hr:paidAbsenceDays")}
                      value={moneyFormatter.format(record.paidAbsenceDays)}
                      highlightColor="success.main"
                    />
                    <MetricRow
                      label={t("hr:unpaidAbsenceDays")}
                      value={moneyFormatter.format(record.unpaidAbsenceDays)}
                      highlightColor={
                        record.unpaidAbsenceDays > 0
                          ? "error.main"
                          : "text.secondary"
                      }
                    />
                    <MetricRow
                      label={t("hr:unpaidAbsenceDeduction")}
                      value={
                        record.unpaidAbsenceDeduction > 0
                          ? `-${moneyFormatter.format(record.unpaidAbsenceDeduction)}`
                          : "0"
                      }
                      highlightColor={
                        record.unpaidAbsenceDeduction > 0
                          ? "error.main"
                          : "text.secondary"
                      }
                    />
                    <Divider sx={{ my: 0.5 }} />
                    <MetricRow
                      label={t("hr:extraWorkingDays")}
                      value={moneyFormatter.format(record.extraDays)}
                      highlightColor={
                        record.extraDays > 0 ? "success.main" : "text.secondary"
                      }
                    />
                    <MetricRow
                      label={t("hr:extraDaysAmount")}
                      value={
                        record.extraDaysAmount > 0
                          ? `+${moneyFormatter.format(record.extraDaysAmount)}`
                          : "0"
                      }
                      highlightColor={
                        record.extraDaysAmount > 0
                          ? "success.main"
                          : "text.secondary"
                      }
                    />
                  </Stack>
                </Box>

                {/* Bonuses List */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      {t("hr:payrollBonuses")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={
                        record.totalBonuses > 0
                          ? "success.main"
                          : "text.secondary"
                      }
                      sx={{
                        direction: "ltr",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {record.totalBonuses > 0
                        ? `+${moneyFormatter.format(record.totalBonuses)}`
                        : "0"}
                    </Typography>
                  </Box>
                  {record.bonuses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t("hr:noBonusesForMonth")}
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {record.bonuses.map((bonus) => (
                        <Box
                          key={bonus.id}
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 1.5,
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {bonus.reason}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {bonus.projectName} • {bonus.date}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="success.main"
                            sx={{
                              direction: "ltr",
                              fontVariantNumeric: "tabular-nums",
                              whiteSpace: "nowrap",
                            }}
                          >
                            +{moneyFormatter.format(bonus.amount)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>

                <Divider />

                {/* Deductions List */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      {t("hr:payrollDeductions")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={
                        record.totalDeductions > 0
                          ? "error.main"
                          : "text.secondary"
                      }
                      sx={{
                        direction: "ltr",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {record.totalDeductions > 0
                        ? `-${moneyFormatter.format(record.totalDeductions)}`
                        : "0"}
                    </Typography>
                  </Box>
                  {record.deductions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t("hr:noDeductionsForMonth")}
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {record.deductions.map((deduction) => (
                        <Box
                          key={deduction.id}
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 1.5,
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {deduction.reason}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {deduction.projectName} • {deduction.date}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="error.main"
                            sx={{
                              direction: "ltr",
                              fontVariantNumeric: "tabular-nums",
                              whiteSpace: "nowrap",
                            }}
                          >
                            -{moneyFormatter.format(deduction.amount)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>

                <Divider />

                {/* Loans List */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      {t("hr:loans")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={
                        record.totalLoans > 0
                          ? "warning.dark"
                          : "text.secondary"
                      }
                      sx={{
                        direction: "ltr",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {record.totalLoans > 0
                        ? `-${moneyFormatter.format(record.totalLoans)}`
                        : "0"}
                    </Typography>
                  </Box>
                  {record.loans.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t("hr:noLoansForMonth")}
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {record.loans.map((loan) => (
                        <Box
                          key={loan.id}
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {loan.projectName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {loan.date}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="warning.dark"
                            sx={{
                              direction: "ltr",
                              fontVariantNumeric: "tabular-nums",
                              whiteSpace: "nowrap",
                            }}
                          >
                            -{moneyFormatter.format(loan.amount)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* Final Net Salary */}
                <Box
                  sx={(theme) => ({
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  })}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    {t("hr:netSalary")}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="primary.main"
                    sx={{
                      direction: "ltr",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {moneyFormatter.format(record.netSalary)}
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions dir={isArabic ? "rtl" : "ltr"} sx={{ px: 3, pb: 2 }}>
        <AppButton variant="outlined" onClick={onClose}>
          {t("common:cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
