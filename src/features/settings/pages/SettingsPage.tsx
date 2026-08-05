import { useTranslation } from "react-i18next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export function SettingsPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t("settings")} description={t("settingsDescription")} />;
}
