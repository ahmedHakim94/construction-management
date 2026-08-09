import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { i18n } = useTranslation();
  const locale = (i18n.language || "ar") as "en" | "ar";

  useEffect(() => {
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const handleLocaleChange = (newLocale: "en" | "ar") => {
    void i18n.changeLanguage(newLocale);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar open mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header locale={locale} onLocaleChange={handleLocaleChange} onSidebarToggle={() => setMobileOpen(true)} />
        <Breadcrumb />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
