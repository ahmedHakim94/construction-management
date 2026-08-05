import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEn from "@/locales/en/common.json";
import authEn from "@/locales/en/auth.json";
import dashboardEn from "@/locales/en/dashboard.json";
import contractorsEn from "@/locales/en/contractors.json";
import equipmentEn from "@/locales/en/equipment.json";
import dailyWorkEn from "@/locales/en/dailyWork.json";
import paymentsEn from "@/locales/en/payments.json";
import reportsEn from "@/locales/en/reports.json";
import settingsEn from "@/locales/en/settings.json";

import commonAr from "@/locales/ar/common.json";
import authAr from "@/locales/ar/auth.json";
import dashboardAr from "@/locales/ar/dashboard.json";
import contractorsAr from "@/locales/ar/contractors.json";
import equipmentAr from "@/locales/ar/equipment.json";
import dailyWorkAr from "@/locales/ar/dailyWork.json";
import paymentsAr from "@/locales/ar/payments.json";
import reportsAr from "@/locales/ar/reports.json";
import settingsAr from "@/locales/ar/settings.json";

const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    contractors: contractorsEn,
    equipment: equipmentEn,
    dailyWork: dailyWorkEn,
    payments: paymentsEn,
    reports: reportsEn,
    settings: settingsEn,
  },
  ar: {
    common: commonAr,
    auth: authAr,
    dashboard: dashboardAr,
    contractors: contractorsAr,
    equipment: equipmentAr,
    dailyWork: dailyWorkAr,
    payments: paymentsAr,
    reports: reportsAr,
    settings: settingsAr,
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: "ar", // Default application language is Arabic
  fallbackLng: "en",
  defaultNS: "common",
  fallbackNS: [
    "common",
    "auth",
    "dashboard",
    "contractors",
    "equipment",
    "dailyWork",
    "payments",
    "reports",
    "settings",
  ],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
