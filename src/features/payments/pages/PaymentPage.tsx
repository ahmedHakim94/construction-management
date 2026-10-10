import { useCallback, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppCard, AppPageHeader } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { PaymentTable } from "../components/PaymentTable";
import { PaymentFilters } from "../components/PaymentFilters";
import {
  useGetPaymentsQuery,
  useRecordPaymentMutation,
} from "../services/payment.api";
import { usePaymentFilters } from "../hooks/usePaymentFilters";
import { useGetProjectsQuery } from "@/features/settings/projects/services/projects.api";
import type { PaymentSummary, RecordPaymentFormValues } from "../types";
import { RecordPaymentDialog } from "../components/RecordPaymentDialog";
import { PaymentDetailsDialog } from "../components/PaymentDetailsDialog";

const LIMIT = 10;

export function PaymentPage() {
  const { t, i18n } = useTranslation();

  const [page, setPage] = useState(1);

  const [selectedPayment, setSelectedPayment] = useState<PaymentSummary | null>(
    null,
  );

  const [selectedDetails, setSelectedDetails] = useState<PaymentSummary | null>(
    null,
  );

  const resetPage = useCallback(() => setPage(1), []);

  const { control, filters, resetFilters } = usePaymentFilters(resetPage);

  const { data: projectsResponse } = useGetProjectsQuery();

  const {
    data: paymentsResponse,
    isLoading,
    isFetching,
  } = useGetPaymentsQuery({
    page,
    limit: LIMIT,
    ...filters,
  });

  const [recordPayment, { isLoading: isRecording }] =
    useRecordPaymentMutation();

  const payments = paymentsResponse?.data ?? [];
  const pagination = paymentsResponse?.pagination;

  // Record Payment

  const handleRecordPayment = async (values: RecordPaymentFormValues) => {
    if (!selectedPayment) return;

    try {
      await recordPayment({
        contractorId: selectedPayment.contractorId,
        projectId: selectedPayment.projectId,
        year: selectedPayment.year,
        month: selectedPayment.month,
        amount: values.amount,
        paymentDate: values.paymentDate,
        paymentMethod: values.paymentMethod,
        referenceNumber:
          values.paymentMethod === "TRANSFER"
            ? values.referenceNumber
            : undefined,
        notes: values.notes,
      }).unwrap();

      setSelectedPayment(null);
    } catch (error) {
      console.error("Failed to record payment:", error);
    }
  };

  // Filter Options
  const projectOptions = [
    { value: "", label: t("allProjects") },
    ...(projectsResponse?.data ?? []).map((project) => ({
      value: project.id,
      label: project.name,
    })),
  ];

  const currentYear = new Date().getFullYear();

  const yearOptions = [
    { value: "", label: t("allYears") },
    ...Array.from({ length: 5 }, (_, index) => ({
      value: currentYear - index,
      label: String(currentYear - index),
    })),
  ];

  const monthOptions = [
    { value: "", label: t("allMonths") },
    ...Array.from({ length: 12 }, (_, index) => ({
      value: index + 1,
      label: new Intl.DateTimeFormat(
        i18n.language === "ar" ? "ar-EG" : "en-US",
        { month: "long" },
      ).format(new Date(2026, index, 1)),
    })),
  ];

  // Keep dialog summary synced with the latest API data
  const currentPayment = selectedPayment
    ? (payments.find(
        (payment) =>
          payment.contractorId === selectedPayment.contractorId &&
          payment.projectId === selectedPayment.projectId &&
          payment.year === selectedPayment.year &&
          payment.month === selectedPayment.month,
      ) ?? selectedPayment)
    : null;

  return (
    <PageContainer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <AppPageHeader
          title={t("payments")}
          description={t("paymentsDescription")}
          actions={null}
        />

        <PaymentFilters
          control={control}
          projectOptions={projectOptions}
          yearOptions={yearOptions}
          monthOptions={monthOptions}
          onReset={resetFilters}
        />

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <PaymentTable
            rows={payments}
            loading={isLoading || isFetching}
            pagination={
              pagination
                ? {
                    page,
                    limit: LIMIT,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
            onView={setSelectedDetails}
            onEdit={setSelectedPayment}
            onDelete={() => {}}
          />
        </AppCard>

        <RecordPaymentDialog
          open={!!selectedPayment}
          netAmount={Number(currentPayment?.netAmount ?? 0)}
          paidAmount={Number(currentPayment?.paidAmount ?? 0)}
          remainingAmount={Number(currentPayment?.remainingAmount ?? 0)}
          loading={isRecording}
          onClose={() => {
            if (!isRecording) {
              setSelectedPayment(null);
            }
          }}
          onSubmit={handleRecordPayment}
        />

        <PaymentDetailsDialog
          open={!!selectedDetails}
          payment={selectedDetails}
          onClose={() => setSelectedDetails(null)}
          onRecordPayment={(payment) => {
            setSelectedPayment(payment);
          }}
        />
      </Box>
    </PageContainer>
  );
}
