import { useTranslation } from "react-i18next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export function PaymentsPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t("payments")} description={t("paymentsDescription")} />;
}
