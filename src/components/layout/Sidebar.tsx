import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import {
  Assessment,
  Build,
  DashboardRounded,
  Handyman,
  Paid,
  Settings,
  WorkHistory,
} from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  open?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
  locale?: "en" | "ar";
}

const navigationItems = [
  { key: "dashboard", path: "/dashboard", icon: DashboardRounded },
  { key: "contractors", path: "/contractors", icon: Handyman },
  { key: "equipment", path: "/equipment", icon: Build },
  { key: "dailyWork", path: "/daily-work", icon: WorkHistory },
  { key: "payments", path: "/payments", icon: Paid },
  { key: "reports", path: "/reports", icon: Assessment },
  { key: "settings", path: "/settings", icon: Settings },
] as const;

export function Sidebar({ open = true, mobileOpen = false, onClose, locale = "ar" }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const isArabic = locale === "ar";

  const content = (
    <Box sx={{ width: { xs: 280, md: open ? 260 : 72 }, height: "100%", bgcolor: "background.paper", borderRight: "1px solid", borderColor: "divider", px: { xs: 2, md: 1.5 }, py: { xs: 2, md: 2.5 }, transition: "width 0.2s ease", overflow: "hidden" }}>
      <Stack spacing={2.25} sx={{ height: "100%" }}>
        <Box sx={{ px: 1.5, py: 0.25 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            {isArabic ? "CM" : "CM"}
          </Typography>
        </Box>

        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
          {navigationItems.map(({ key, path, icon: Icon }) => {
            const label = t(key);
            const isActive = location.pathname === path;

            return (
              <ListItemButton
                key={path}
                component={NavLink}
                to={path}
                onClick={onClose}
                sx={{
                  position: "relative",
                  borderRadius: 2.5,
                  minHeight: 46,
                  px: 1.5,
                  color: isActive ? "primary.contrastText" : "text.secondary",
                  bgcolor: isActive ? "primary.main" : "transparent",
                  justifyContent: open ? "flex-start" : "center",
                  transition: "all 180ms ease",
                  boxShadow: isActive ? 1 : 0,
                  borderInlineEnd: isActive && isArabic ? "3px solid" : "0px",
                  borderInlineStart: isActive && !isArabic ? "3px solid" : "0px",
                  borderColor: "primary.main",
                  "&:hover": {
                    bgcolor: isActive ? "primary.main" : "action.hover",
                    color: isActive ? "primary.contrastText" : "text.primary",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, color: "inherit", transition: "margin 180ms ease" }}>
                  <Icon />
                </ListItemIcon>
                {open ? <ListItemText primary={label} sx={{ my: 0, '& .MuiListItemText-primary': { fontWeight: isActive ? 700 : 600 } }} /> : null}
              </ListItemButton>
            );
          })}
        </List>
      </Stack>
    </Box>
  );

  return (
    <>
      <Box component="nav" sx={{ display: { xs: "none", md: "block" } }}>
        {content}
      </Box>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {content}
      </Drawer>
    </>
  );
}
