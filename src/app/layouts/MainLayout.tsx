import { Box } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locale, setLocale] = useState<"en" | "ar">("ar");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar open mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} locale={locale} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header locale={locale} onLocaleChange={setLocale} onSidebarToggle={() => setMobileOpen(true)} />
        <Breadcrumb />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
