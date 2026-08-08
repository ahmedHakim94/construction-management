import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton, AppCard, AppPageHeader } from "@/components/ui";
import { AppFilters } from "@/components/ui/AppFilters";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppConfirmDialog } from "@/components/ui/AppConfirmDialog";
import { PaymentsTable } from "../components/PaymentsTable";
import { PaymentDetailsDialog } from "../components/PaymentDetailsDialog";
import { RecordPaymentDialog } from "../components/RecordPaymentDialog";
import { getTransactions, paymentService, recordPayment } from "../services/payment.service";
import { dailyWorkService } from "@/features/daily-work/services/dailyWork.service";
import { contractorService } from "@/features/contractors/services/contractor.service";
import { projectService } from "@/features/settings/projects/services/project.service";
import { taskService } from "@/features/settings/task/services/task.service";
import { paymentSchema } from "../schemas/payment.schema";
import { SettlePaymentDialog } from "../components/SettlePaymentDialog";
import type { Payment, PaymentFormValues, PaymentTransaction, RecordPaymentFormValues } from "../types";
import type { Contractor } from "@/features/contractors/types";
import type { DailyWork } from "@/features/daily-work/types";
import type { Project } from "@/features/settings/projects/types";
import type { Task } from "@/features/settings/task/types";

export function PaymentsPage() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [dailyWorkRecords, setDailyWorkRecords] = useState<DailyWork[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment & { contractorName: string } | undefined>();
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [recordLoading, setRecordLoading] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    grossAmount: 0,
    totalDeductions: 0,
    netAmount: 0,
    records: [] as DailyWork[],
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      contractorId: "",
      startDate: "",
      endDate: "",
    },
  });

  const [contractorId, startDate, endDate] = watch(["contractorId", "startDate", "endDate"]);

  useEffect(() => {
    async function loadData() {
      const [paymentData, contractorData, dailyWorkData, projectData, taskData] = await Promise.all([
        paymentService.getAll(),
        contractorService.getAll(),
        dailyWorkService.getAll(),
        projectService.getAll(),
        taskService.getAll(),
      ]);

      setPayments(paymentData);
      setContractors(contractorData);
      setDailyWorkRecords(dailyWorkData);
      setProjects(projectData);
      setTasks(taskData);
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!contractorId || !startDate || !endDate) {
      setPaymentDetails({ grossAmount: 0, totalDeductions: 0, netAmount: 0, records: [] });
      return;
    }

    const records = dailyWorkRecords.filter(
      (record) =>
        record.contractorId === contractorId &&
        record.date >= startDate &&
        record.date <= endDate,
    );

    const grossAmount = records.reduce((sum, record) => sum + record.cost, 0);
    const totalDeductions = records.reduce((sum, record) => sum + record.deduction, 0);
    const netAmount = grossAmount - totalDeductions;

    setPaymentDetails({ grossAmount, totalDeductions, netAmount, records });
  }, [contractorId, startDate, endDate, dailyWorkRecords]);

  const contractorOptions = useMemo(
    () => contractors.map((item) => ({ value: item.id, label: item.name })),
    [contractors],
  );

  const getStatusLabel = (status: Payment["status"]) => {
    if (status === "UNPAID") {
      return t("statusUnpaid");
    }

    if (status === "PARTIALLY_PAID") {
      return t("statusPartiallyPaid");
    }

    return t("statusPaid");
  };

  const paymentRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    const enriched = payments.map((payment) => ({
      ...payment,
      contractorName: contractors.find((item) => item.id === payment.contractorId)?.name ?? "",
      period: `${payment.startDate} - ${payment.endDate}`,
      statusLabel: getStatusLabel(payment.status),
    }));

    return enriched.filter((item) => {
      if (!term) {
        return true;
      }

      return item.contractorName.toLowerCase().includes(term);
    });
  }, [payments, search, contractors, getStatusLabel]);

  const projectMap = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const taskMap = useMemo(
    () => Object.fromEntries(tasks.map((task) => [task.id, task.nameEn])),
    [tasks],
  );

  const handlePreviewSettle = () => {
    if (paymentDetails.records.length === 0) {
      setError("startDate", { type: "manual", message: t("noDailyWorkRecordsFound") });
      return;
    }

    setPreviewOpen(true);
  };

  const handleConfirmCreateSettlement = async () => {
    setSettlementLoading(true);

    try {
      const payment = await paymentService.create({
        contractorId,
        startDate,
        endDate,
        grossAmount: paymentDetails.grossAmount,
        totalDeductions: paymentDetails.totalDeductions,
        netAmount: paymentDetails.netAmount,
      });

      setPayments((current) => {
        const existingIndex = current.findIndex((item) => item.id === payment.id);
        if (existingIndex >= 0) {
          return current.map((item) => (item.id === payment.id ? payment : item));
        }
        return [payment, ...current];
      });

      reset({ contractorId: "", startDate: "", endDate: "" });
      setPaymentDetails({ grossAmount: 0, totalDeductions: 0, netAmount: 0, records: [] });
      setPreviewOpen(false);
    } catch (error) {
      setError("contractorId", { type: "manual", message: t("somethingWentWrong") });
    } finally {
      setSettlementLoading(false);
    }
  };

  const handleView = async (payment: Payment & { contractorName: string }) => {
    const transactions = await getTransactions(payment.id);
    setSelectedPayment(payment);
    setPaymentTransactions(transactions);
    setViewOpen(true);
  };

  const handleOpenRecordPayment = () => {
    setRecordPaymentOpen(true);
  };

  const handleRecordPayment = async (values: RecordPaymentFormValues) => {
    if (!selectedPayment) {
      return;
    }

    setRecordLoading(true);

    try {
      await recordPayment(selectedPayment.id, values.amount);

      const updatedPayment = await paymentService.getById(selectedPayment.id);

      if (updatedPayment) {
        setPayments((current) =>
          current.map((item) => (item.id === updatedPayment.id ? updatedPayment : item)),
        );

        setSelectedPayment((current) => (current ? { ...current, ...updatedPayment } : undefined));

        const transactions = await getTransactions(selectedPayment.id);
        setPaymentTransactions(transactions);
      }

      setRecordPaymentOpen(false);
    } finally {
      setRecordLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPayment) {
      return;
    }

    setDeleteLoading(true);

    try {
      await paymentService.delete(selectedPayment.id);
      setPayments((current) => current.filter((item) => item.id !== selectedPayment.id));
      setDeleteOpen(false);
      setSelectedPayment(undefined);
    } finally {
      setDeleteLoading(false);
    }
  };

  const selectedContractorName = contractors.find((item) => item.id === contractorId)?.name ?? "";

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AppPageHeader
          title={t("payments")}
          description={t("paymentsDescription")}
          actions={
            // <AppSearchInput
            //   value={search}
            //   onChange={setSearch}
            //   placeholder={t("searchContractorName")}
            // />
            null
          }
        />


        <Box component="form" onSubmit={handleSubmit(handlePreviewSettle)} sx={{ display: "grid", gap: 2 }}>
          <AppFilters>
            <Controller
              name="contractorId"
              control={control}
              render={({ field, fieldState }) => (
                <AppSelect
                  label={t("contractor")}
                  required
                  options={contractorOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("selectContractor")}
                  error={fieldState.error?.message}
                  width="30%"
                />
              )}
            />

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Controller
                name="startDate"
                control={control}
                render={({ field, fieldState }) => (
                  <AppDatePicker
                    label={t("fromDate")}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(value) => field.onChange(value ? value.format("YYYY-MM-DD") : "")}
                    format="DD/MM/YYYY"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="endDate"
                control={control}
                render={({ field, fieldState }) => (
                  <AppDatePicker
                    label={t("toDate")}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(value) => field.onChange(value ? value.format("YYYY-MM-DD") : "")}
                    format="DD/MM/YYYY"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

            </div>

            <AppButton type="submit" loading={settlementLoading}>
              {t("settlePayment")}
            </AppButton>
          </AppFilters>
        </Box>


        <AppCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <PaymentsTable
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
      </Box>

      <PaymentDetailsDialog
        open={viewOpen}
        payment={selectedPayment}
        projectMap={projectMap}
        taskMap={taskMap}
        dailyWorkRecords={dailyWorkRecords.filter((record) => {
          if (!selectedPayment) {
            return false;
          }

          return (
            record.contractorId === selectedPayment.contractorId &&
            record.date >= selectedPayment.startDate &&
            record.date <= selectedPayment.endDate
          );
        })}
        transactions={paymentTransactions}
        onClose={() => setViewOpen(false)}
        onRecordPayment={handleOpenRecordPayment}
      />
      <SettlePaymentDialog
        open={previewOpen}
        contractorName={selectedContractorName}
        startDate={startDate}
        endDate={endDate}
        grossAmount={paymentDetails.grossAmount}
        totalDeductions={paymentDetails.totalDeductions}
        netAmount={paymentDetails.netAmount}
        records={paymentDetails.records}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirmCreateSettlement}
        loading={settlementLoading}
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
    </PageContainer>
  );
}
