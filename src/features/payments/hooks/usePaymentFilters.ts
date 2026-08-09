import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { Payment, PaymentFormValues } from "../types";
import type { Contractor } from "@/features/contractors/types";
import type { DailyWork } from "@/features/daily-work/types";

export function usePaymentFilters(
  payments: Payment[],
  contractors: Contractor[],
  dailyWorkRecords: DailyWork[],
) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const form = useForm<PaymentFormValues>({
    defaultValues: {
      contractorId: "",
      startDate: "",
      endDate: "",
    },
  });

  const [contractorId, startDate, endDate] = form.watch(["contractorId", "startDate", "endDate"]);

  const paymentDetails = useMemo(() => {
    if (!contractorId || !startDate || !endDate) {
      return { grossAmount: 0, totalDeductions: 0, netAmount: 0, records: [] as DailyWork[] };
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

    return { grossAmount, totalDeductions, netAmount, records };
  }, [contractorId, startDate, endDate, dailyWorkRecords]);

  const paymentRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    const enriched = payments.map((payment) => ({
      ...payment,
      contractorName: contractors.find((item) => item.id === payment.contractorId)?.name ?? "",
      period: `${payment.startDate} - ${payment.endDate}`,
      statusLabel:
        payment.status === "UNPAID"
          ? t("statusUnpaid")
          : payment.status === "PARTIALLY_PAID"
          ? t("statusPartiallyPaid")
          : t("statusPaid"),
    }));

    return enriched.filter((item) => {
      if (!term) {
        return true;
      }

      return item.contractorName.toLowerCase().includes(term);
    });
  }, [payments, contractors, search, t]);

  const clearFilters = () => {
    setSearch("");
    form.reset({ contractorId: "", startDate: "", endDate: "" });
  };

  return {
    control: form.control,
    handleSubmit: form.handleSubmit,
    setError: form.setError,
    resetFilters: clearFilters,
    contractorId,
    startDate,
    endDate,
    paymentDetails,
    paymentRows,
    search,
    setSearch,
  };
}
