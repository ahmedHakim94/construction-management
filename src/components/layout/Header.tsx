import { Avatar, Box, IconButton, Menu, MenuItem, Stack, Switch, Typography } from "@mui/material";
import { Language, Menu as MenuIcon, PersonOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  locale?: "en" | "ar";
  onLocaleChange?: (locale: "en" | "ar") => void;
  onSidebarToggle?: () => void;
}

export function Header({ locale = "ar", onLocaleChange, onSidebarToggle }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const isArabic = locale === "ar";

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box component="header" sx={{ height: 60, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper", display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 2, sm: 2.5, md: 3 } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <IconButton onClick={onSidebarToggle} sx={{ display: { md: "none" }, color: "text.primary" }}>
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1rem", md: "1.1rem" },
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {t("appTitle")}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", border: "1px solid", borderColor: "divider", borderRadius: 999, px: 1, py: 0.45 }}>
          <Language fontSize="small" color="action" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{t("language")}</Typography>
          <Switch
            size="small"
            checked={!isArabic}
            onChange={() => onLocaleChange?.(isArabic ? "en" : "ar")}
            slotProps={{ input: { "aria-label": "language toggle" } }}
          />
        </Stack>

        <IconButton onClick={handleOpenMenu} sx={{ color: "text.primary" }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
            <PersonOutlined fontSize="small" />
          </Avatar>
        </IconButton>
      </Stack>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} keepMounted>
        <MenuItem onClick={handleCloseMenu}>{t("profile")}</MenuItem>
        <MenuItem onClick={handleCloseMenu}>{t("signOut")}</MenuItem>
      </Menu>
    </Box>
  );
}
