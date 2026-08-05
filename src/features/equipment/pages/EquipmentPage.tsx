import { useTranslation } from "react-i18next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export function EquipmentPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t("equipment")} description={t("equipmentDescription")} />;
}
