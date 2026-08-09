import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { Payment } from "../types";
import type { PaymentSchemaValues } from "../schemas/payment.schema";
import type { Contractor } from "@/features/contractors/types";
import type { Project } from "@/features/settings/projects/types";

export function usePaymentFilters(
  payments: Payment[],
  contractors: Contractor[],
  projects: Project[],
) {
  const { t } = useTranslation();

  const form = useForm<PaymentSchemaValues>({
    defaultValues: {
      projectId: "",
    },
  });

  const projectId = form.watch("projectId");

  const paymentRows = useMemo(() => {
    return payments
      .filter((payment) => {
        if (!projectId) return true;
        return payment.projectId === projectId;
      })
      .map((payment) => ({
        ...payment,

        projectName:
          projects.find((item) => item.id === payment.projectId)?.name ?? "",

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
  }, [payments, contractors,projects, projectId, t]);

  return {
    control: form.control,
    paymentRows,
  };
}
  