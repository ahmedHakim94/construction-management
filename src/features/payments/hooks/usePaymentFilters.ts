import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { Payment } from "../types";
import type { PaymentSchemaValues } from "../schemas/payment.schema";
import type { Contractor } from "@/features/contractors/types";

export function usePaymentFilters(
  payments: Payment[],
  contractors: Contractor[],
) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const form = useForm<PaymentSchemaValues>({
    defaultValues: {
      projectId: "",
    },
  });

  const projectId = form.watch("projectId");

  const paymentRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    const enriched = payments
      .filter((payment) => {
        if (!projectId) return true;
        return payment.projectId === projectId;
      })
      .map((payment) => ({
        ...payment,
        contractorName:
          contractors.find((item) => item.id === payment.contractorId)?.name ??
          "",
        period: `${payment.startDate} - ${payment.endDate}`,
        statusLabel:
          payment.status === "UNPAID"
            ? t("statusUnpaid")
            : payment.status === "PARTIALLY_PAID"
            ? t("statusPartiallyPaid")
            : t("statusPaid"),
      }));

    return enriched.filter((item) => {
      if (!term) return true;
      return item.contractorName.toLowerCase().includes(term);
    });
  }, [payments, contractors, projectId, search, t]);

  const clearFilters = () => {
    setSearch("");
    form.reset({ projectId: "" });
  };

  return {
    control: form.control,
    handleSubmit: form.handleSubmit,
    setError: form.setError,
    resetFilters: clearFilters,
    projectId,
    paymentRows,
    search,
    setSearch,
  };
}
