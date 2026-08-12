import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppCard, AppPageHeader } from "@/components/ui";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { PageContainer } from "@/components/layout/PageContainer";
import { PaymentFilters } from "../components/PaymentFilters";
import { PaymentTable } from "../components/PaymentTable";
import { PaymentDetailsDialog } from "../components/PaymentDetailsDialog";
import { RecordPaymentDialog } from "../components/RecordPaymentDialog";
import { usePayments } from "../hooks/usePayments";
import { usePaymentFilters } from "../hooks/usePaymentFilters";
import type { Payment } from "../types";

export function PaymentPage() {
  const { t } = useTranslation();
  const {
    payments,
    contractors,
    dailyWorkRecords,
    projects,
    tasks,
    equipment,
    paymentTransactions,
    recordLoading,
    deleteLoading,
    loadTransactions,
    recordPayment,
    deletePayment,
    refreshPaymentFromDailyWork,
  } = usePayments();

  const { control, paymentRows } = usePaymentFilters(
    payments,
    contractors,
    projects,
  );

  const [selectedPayment, setSelectedPayment] = useState<
    (Payment & { contractorName: string }) | undefined
  >();
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  const equipmentMap = useMemo(
    () =>
      Object.fromEntries(equipment.map((item) => [item.id, item.name ?? ""])),
    [equipment],
  );

  const handleView = async (payment: Payment & { contractorName: string }) => {
    try {
      const updatedPayment = await refreshPaymentFromDailyWork(
        payment,
        dailyWorkRecords,
      );

      const latestPayment = updatedPayment ?? payment;
      // Update the selected payment shown in Details
      setSelectedPayment({
        ...payment,
        ...latestPayment,
      });

      // Load latest payment transactions
      await loadTransactions(latestPayment.id);

      setViewOpen(true);
    } catch {}
  };

  const handleOpenRecordPayment = () => {
    setRecordPaymentOpen(true);
  };

  const handleRecordPayment = async (values: { amount: number }) => {
    if (!selectedPayment) return;

    const updatedPayment = await recordPayment(
      selectedPayment.id,
      values.amount,
    );
    if (updatedPayment) {
      setSelectedPayment({ ...selectedPayment, ...updatedPayment });
    }

    setRecordPaymentOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;

    await deletePayment(selectedPayment.id);
    setDeleteOpen(false);
    setSelectedPayment(undefined);
  };

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("payments")}
          description={t("paymentsDescription")}
          actions={null}
        />

        <div>
          <PaymentFilters
            control={control}
            projectOptions={[
              { value: "", label: t("allProjects") },
              ...projects.map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
        </div>

        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <PaymentTable
            rows={paymentRows}
            onView={handleView}
            onEdit={(record) => {
              setSelectedPayment(record);
              setRecordPaymentOpen(true);
            }}
            onDelete={(record) => {
              setSelectedPayment(record);
              setDeleteOpen(true);
            }}
          />
        </AppCard>

        <PaymentDetailsDialog
          open={viewOpen}
          payment={selectedPayment}
          projectMap={Object.fromEntries(
            projects.map((project) => [project.id, project.name]),
          )}
          taskMap={Object.fromEntries(
            tasks.map((task) => [task.id, task.nameEn]),
          )}
          equipmentMap={equipmentMap}

          // dailyWorkRecords={dailyWorkRecords.filter((record) =>
          //   selectedPayment
          //     ? record.contractorId === selectedPayment.contractorId &&
          //       record.date >= selectedPayment.startDate &&
          //       record.date <= selectedPayment.endDate
          //     : false,
          // )}
          dailyWorkRecords={dailyWorkRecords.filter((record) =>
            selectedPayment
              ? record.projectId === selectedPayment.projectId &&
                record.contractorId === selectedPayment.contractorId &&
                record.date >= selectedPayment.startDate &&
                record.date <= selectedPayment.endDate
              : false,
          )}
          transactions={paymentTransactions}
          onClose={() => setViewOpen(false)}
          onRecordPayment={handleOpenRecordPayment}
        />

        <RecordPaymentDialog
          open={recordPaymentOpen}
          netAmount={selectedPayment?.netAmount ?? 0}
          paidAmount={selectedPayment?.paidAmount ?? 0}
          remainingAmount={selectedPayment?.remainingAmount ?? 0}
          loading={recordLoading}
          onClose={() => setRecordPaymentOpen(false)}
          onSubmit={handleRecordPayment}
        />

        <AppConfirmDialog
          open={deleteOpen}
          title={t("deletePayment")}
          message={
            <>
              {t("deletePaymentConfirmation")}
              <strong>{` ${selectedPayment?.contractorName ?? selectedPayment?.contractorId ?? ""} ?`}</strong>
            </>
          }
          confirmText={t("delete")}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      </Box>
    </PageContainer>
  );
}
