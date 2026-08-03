export const translations = {
  en: {
    layout: {
      dashboard: "Dashboard",
      contractors: "Contractors",
      equipment: "Equipment",
      dailyWork: "Daily Work",
      payments: "Payments",
      reports: "Reports",
      settings: "Settings",
      language: "Language",
      arabic: "Arabic",
      english: "English",
      profile: "Profile",
      signOut: "Sign out",
    },
  },
  ar: {
    layout: {
      dashboard: "لوحة القيادة",
      contractors: "المقاولين",
      equipment: "المعدات",
      dailyWork: "الأعمال اليومية",
      payments: "المدفوعات",
      reports: "التقارير",
      settings: "الإعدادات",
      language: "اللغة",
      arabic: "العربية",
      english: "الإنجليزية",
      profile: "الملف الشخصي",
      signOut: "تسجيل الخروج",
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.en.layout;

export function getTranslation(locale: "en" | "ar", key: TranslationKey) {
  return translations[locale].layout[key];
}
