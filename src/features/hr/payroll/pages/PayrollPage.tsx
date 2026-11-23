import { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppCard, AppPageHeader } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { useAppSelector } from "@/app/store/hooks";
import { useDialog } from "@/hooks/useDialog";
import {
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE_PROJECTS,
} from "@/features/hr/employees/mock/employees.mock";
import { MOCK_ATTENDANCE_RECORDS } from "@/features/hr/attendance/mock/attendance.mock";
import { MOCK_TRANSACTIONS } from "@/features/hr/deductions/mock/deductions.mock";
import { MOCK_LOANS } from "@/features/hr/loans/mock/loans.mock";
import { PayrollDetailsDialog } from "../components/PayrollDetailsDialog";
import { PayrollTable } from "../components/PayrollTable";
import {
  buildPayrollKey,
  buildProjectNameMap,
  calculateEmployeeMonthlyPayroll,
  roundMoney,
} from "../utils/payrollCalculations";
import { loadPaidPayrolls, savePaidPayrolls } from "../utils/payrollStorage";
import type { PayrollRecord } from "../types";

export function PayrollPage() {
  const { t } = useTranslation(["hr", "common"]);
  const user = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super_admin";

  const [selectedMonthDate, setSelectedMonthDate] = useState<Dayjs | null>(
    dayjs(),
  );
  const [paidPayrolls, setPaidPayrolls] = useState<
    Record<string, PayrollRecord>
  >(() => loadPaidPayrolls());

  const [detailsRecord, setDetailsRecord] = useState<
    PayrollRecord | undefined
  >();
  const [confirmPaidRecord, setConfirmPaidRecord] = useState<
    PayrollRecord | undefined
  >();

  const detailsDialog = useDialog();
  const confirmDialog = useDialog();

  const selectedMonth =
    selectedMonthDate && selectedMonthDate.isValid()
      ? selectedMonthDate.format("YYYY-MM")
      : dayjs().format("YYYY-MM");

  const projectNameById = useMemo(
    () => buildProjectNameMap(MOCK_EMPLOYEE_PROJECTS),
    [],
  );

  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [],
  );

  const payrollRows = useMemo<PayrollRecord[]>(() => {
    if (!isSuperAdmin) return [];

    return MOCK_EMPLOYEES.map((employee) => {
      const key = buildPayrollKey(employee.id, selectedMonth);

      // Once marked Paid, return the locked snapshot directly without recalculating.
      const lockedSnapshot = paidPayrolls[key];
      if (lockedSnapshot) {
        return lockedSnapshot;
      }

      return calculateEmployeeMonthlyPayroll({
        employee,
        month: selectedMonth,
        attendanceRecords: MOCK_ATTENDANCE_RECORDS,
        transactions: MOCK_TRANSACTIONS,
        loans: MOCK_LOANS,
        projectNameById,
      });
    });
  }, [isSuperAdmin, selectedMonth, paidPayrolls, projectNameById]);

  // Exclude INACTIVE employees from payroll totals.
  const totalNetPayroll = useMemo(
    () =>
      roundMoney(
        payrollRows.reduce(
          (sum, row) => (row.isInactive ? sum : sum + row.netSalary),
          0,
        ),
      ),
    [payrollRows],
  );

  const handleOpenDetails = (record: PayrollRecord) => {
    if (!isSuperAdmin) return;
    setDetailsRecord(record);
    detailsDialog.openDialog();
  };

  const handleCloseDetails = () => {
    detailsDialog.closeDialog();
    setDetailsRecord(undefined);
  };

  const handleOpenMarkAsPaid = (record: PayrollRecord) => {
    if (!isSuperAdmin) return;
    if (record.isInactive || record.status === "PAID") return;
    setConfirmPaidRecord(record);
    confirmDialog.openDialog();
  };

  const handleCloseConfirmDialog = () => {
    confirmDialog.closeDialog();
    setConfirmPaidRecord(undefined);
  };

  const handleConfirmMarkAsPaid = () => {
    if (!isSuperAdmin || !confirmPaidRecord) return;
    if (confirmPaidRecord.isInactive || confirmPaidRecord.status === "PAID") {
      return;
    }

    const key = buildPayrollKey(
      confirmPaidRecord.employeeId,
      confirmPaidRecord.month,
    );

    setPaidPayrolls((prev) => {
      // Prevent duplicate or re-locked payroll records for the same employee & month.
      if (prev[key]) return prev;

      const lockedRecord: PayrollRecord = {
        ...confirmPaidRecord,
        bonuses: confirmPaidRecord.bonuses.map((item) => ({ ...item })),
        deductions: confirmPaidRecord.deductions.map((item) => ({ ...item })),
        loans: confirmPaidRecord.loans.map((item) => ({ ...item })),
        status: "PAID",
        paidAt: dayjs().format("YYYY-MM-DD"),
      };

      const next = {
        ...prev,
        [key]: lockedRecord,
      };
      savePaidPayrolls(next);
      return next;
    });

    handleCloseConfirmDialog();
  };

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("hr:payroll")}
          description={t("hr:payrollDescription")}
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("hr:selectMonth")}
                views={["year", "month"]}
                openTo="month"
                format="YYYY-MM"
                value={selectedMonthDate}
                onChange={(value) => setSelectedMonthDate(value)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { minWidth: { xs: "100%", sm: 200 } },
                  },
                }}
              />
            </LocalizationProvider>

            <Box
              sx={(theme) => ({
                px: 2,
                py: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              })}
            >
              <Typography variant="body2" color="text.secondary">
                {t("hr:totalMonthPayroll")}:
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="primary.main"
                sx={{ direction: "ltr", fontVariantNumeric: "tabular-nums" }}
              >
                {moneyFormatter.format(totalNetPayroll)}
              </Typography>
            </Box>
          </Box>

          <PayrollTable
            rows={payrollRows}
            canManage={isSuperAdmin}
            onViewDetails={handleOpenDetails}
            onMarkAsPaid={handleOpenMarkAsPaid}
          />
        </AppCard>

        <PayrollDetailsDialog
          open={detailsDialog.open}
          record={detailsRecord}
          onClose={handleCloseDetails}
        />

        <AppConfirmDialog
          open={confirmDialog.open}
          title={t("hr:markAsPaid")}
          message={t("hr:markAsPaidConfirm", {
            name: confirmPaidRecord?.employeeName ?? "",
            month: confirmPaidRecord?.month ?? "",
          })}
          confirmText={t("hr:markAsPaid")}
          cancelText={t("common:cancel")}
          onClose={handleCloseConfirmDialog}
          onConfirm={handleConfirmMarkAsPaid}
        />
      </Box>
    </PageContainer>
  );
}
