import { Suspense, lazy, startTransition, useCallback, useState } from "react";
import { Box, CircularProgress, Typography, type Theme } from "@mui/material";
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
import { PayrollTable } from "../components/PayrollTable";
import {
  useGetMonthlyPayrollQuery,
  useMarkPayrollAsPaidMutation,
} from "../services/payroll.api";
import type { PayrollRecord } from "../types";

// Lazy-load detailed payroll breakdown dialog only when opened (bundle-dynamic-imports)
const loadPayrollDetailsDialog = () =>
  import("../components/PayrollDetailsDialog").then((m) => ({
    default: m.PayrollDetailsDialog,
  }));

const PayrollDetailsDialog = lazy(loadPayrollDetailsDialog);

const EMPTY_ROWS: PayrollRecord[] = [];

const MONEY_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const CAIRO_MONTH_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Cairo",
  year: "numeric",
  month: "2-digit",
});

const getCurrentCairoMonth = () =>
  CAIRO_MONTH_FORMATTER.format(new Date()).slice(0, 7);

const PAGE_STACK_SX = {
  display: "flex",
  flexDirection: "column",
  gap: 2.5,
} as const;

const CARD_SX = {
  p: { xs: 2, md: 2.5 },
} as const;

const TOOLBAR_SX = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 2,
  mb: 2,
} as const;

const LTR_NUM_SX = {
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
} as const;

const MONTH_PICKER_SLOT_PROPS = {
  textField: {
    size: "small" as const,
    sx: { minWidth: { xs: "100%", sm: 200 } },
  },
};

const getTotalSummarySx = (theme: Theme) => ({
  px: 2,
  py: 1,
  borderRadius: 1.5,
  bgcolor: alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  display: "flex",
  alignItems: "center",
  gap: 1.5,
});

export function PayrollPage() {
  const { t } = useTranslation(["hr", "common"]);
  const user = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super_admin";

  const currentCairoMonth = getCurrentCairoMonth();

  const [selectedMonthDate, setSelectedMonthDate] = useState<Dayjs | null>(() =>
    dayjs(`${getCurrentCairoMonth()}-01`),
  );

  const [detailsRecord, setDetailsRecord] = useState<
    PayrollRecord | undefined
  >();
  const [confirmPaidRecord, setConfirmPaidRecord] = useState<
    PayrollRecord | undefined
  >();

  const detailsDialog = useDialog();
  const confirmDialog = useDialog();
  const setDetailsDialogOpen = detailsDialog.setOpen;
  const setConfirmDialogOpen = confirmDialog.setOpen;

  const selectedMonth =
    selectedMonthDate && selectedMonthDate.isValid()
      ? selectedMonthDate.format("YYYY-MM")
      : currentCairoMonth;

  const isFutureMonth = selectedMonth > currentCairoMonth;

  const { data, isLoading, isFetching } = useGetMonthlyPayrollQuery(
    { month: selectedMonth },
    { skip: !isSuperAdmin },
  );

  const [markPayrollAsPaid, { isLoading: isMarkingPaid }] =
    useMarkPayrollAsPaidMutation();

  const payrollRows = data?.data ?? EMPTY_ROWS;
  const totalNetPayroll = data?.summary.totalMonthPayroll ?? 0;
  const loading = isLoading || isFetching;

  const handleMonthChange = useCallback((value: Dayjs | null) => {
    startTransition(() => {
      setSelectedMonthDate(value);
    });
  }, []);

  const handleOpenDetails = useCallback(
    (record: PayrollRecord) => {
      if (!isSuperAdmin) return;
      void loadPayrollDetailsDialog();
      setDetailsRecord(record);
      setDetailsDialogOpen(true);
    },
    [isSuperAdmin, setDetailsDialogOpen],
  );

  const handleCloseDetails = useCallback(() => {
    setDetailsDialogOpen(false);
    setDetailsRecord(undefined);
  }, [setDetailsDialogOpen]);

  const handleOpenMarkAsPaid = useCallback(
    (record: PayrollRecord) => {
      if (!isSuperAdmin) return;
      if (record.isInactive || record.status === "PAID") return;
      if (record.month > getCurrentCairoMonth()) return;
      setConfirmPaidRecord(record);
      setConfirmDialogOpen(true);
    },
    [isSuperAdmin, setConfirmDialogOpen],
  );

  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialogOpen(false);
    setConfirmPaidRecord(undefined);
  }, [setConfirmDialogOpen]);

  const handleConfirmMarkAsPaid = useCallback(async () => {
    if (!isSuperAdmin || !confirmPaidRecord) return;
    if (confirmPaidRecord.isInactive || confirmPaidRecord.status === "PAID") {
      return;
    }

    try {
      await markPayrollAsPaid({
        employeeId: confirmPaidRecord.employeeId,
        month: confirmPaidRecord.month,
      }).unwrap();
      handleCloseConfirmDialog();
    } catch {
      // Error notification handled globally by baseApi
    }
  }, [
    isSuperAdmin,
    confirmPaidRecord,
    markPayrollAsPaid,
    handleCloseConfirmDialog,
  ]);

  return (
    <PageContainer>
      <Box sx={PAGE_STACK_SX}>
        <AppPageHeader
          title={t("hr:payroll")}
          description={t("hr:payrollDescription")}
        />

        <AppCard sx={CARD_SX}>
          <Box sx={TOOLBAR_SX}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("hr:selectMonth")}
                views={["year", "month"]}
                openTo="month"
                format="YYYY-MM"
                value={selectedMonthDate}
                onChange={handleMonthChange}
                slotProps={MONTH_PICKER_SLOT_PROPS}
              />
            </LocalizationProvider>

            <Box sx={getTotalSummarySx}>
              <Typography variant="body2" color="text.secondary">
                {t("hr:totalMonthPayroll")}:
              </Typography>
              {loading ? (
                <CircularProgress size={16} />
              ) : (
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="primary.main"
                >
                  <Box component="bdi" dir="ltr" sx={LTR_NUM_SX}>
                    {MONEY_FORMATTER.format(totalNetPayroll)}
                  </Box>
                </Typography>
              )}
            </Box>
          </Box>

          <PayrollTable
            rows={payrollRows}
            loading={loading}
            canManage={isSuperAdmin}
            isFutureMonth={isFutureMonth}
            onViewDetails={handleOpenDetails}
            onMarkAsPaid={handleOpenMarkAsPaid}
          />
        </AppCard>

        {detailsDialog.open ? (
          <Suspense fallback={null}>
            <PayrollDetailsDialog
              open={detailsDialog.open}
              record={detailsRecord}
              onClose={handleCloseDetails}
            />
          </Suspense>
        ) : null}

        {confirmDialog.open ? (
          <AppConfirmDialog
            open={confirmDialog.open}
            title={t("hr:markAsPaid")}
            message={t("hr:markAsPaidConfirm", {
              name: confirmPaidRecord?.employeeName ?? "",
              month: confirmPaidRecord?.month ?? "",
            })}
            loading={isMarkingPaid}
            confirmText={t("hr:markAsPaid")}
            cancelText={t("common:cancel")}
            onClose={handleCloseConfirmDialog}
            onConfirm={handleConfirmMarkAsPaid}
          />
        ) : null}
      </Box>
    </PageContainer>
  );
}
