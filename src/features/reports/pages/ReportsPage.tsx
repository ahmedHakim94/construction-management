import { useTranslation } from "react-i18next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export function ReportsPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t("reports")} description={t("reportsDescription")} />;
}
