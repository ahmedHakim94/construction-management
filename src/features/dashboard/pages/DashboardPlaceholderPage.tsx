import { useTranslation } from "react-i18next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export function DashboardPlaceholderPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t("dashboard")} description={t("dashboardDescription")} />;
}
