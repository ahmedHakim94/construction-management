import { useTranslation } from "react-i18next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export function DailyWorkPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t("dailyWork")} description={t("dailyWorkDescription")} />;
}
