import { Avatar, Box, IconButton, Menu, MenuItem, Stack, Switch, Typography } from "@mui/material";
import { Language, Logout, Menu as MenuIcon, PersonOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/store/hooks";
import { logout } from "@/features/auth/store/authSlice";
import { ROUTE_PATHS } from "@/app/router/routeConstants";

interface HeaderProps {
  locale?: "en" | "ar";
  onLocaleChange?: (locale: "en" | "ar") => void;
  onSidebarToggle?: () => void;
}

export function Header({ locale = "ar", onLocaleChange, onSidebarToggle }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isArabic = locale === "ar";

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    dispatch(logout());
    navigate(ROUTE_PATHS.login);
  };

  return (
    <Box
      component="header"
      sx={{
        height: 60,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <IconButton onClick={onSidebarToggle} sx={{ display: { md: "none" }, color: "text.primary" }}>
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            letterSpacing: "-0.01em",
            color: "text.primary",
            lineHeight: 1.2,
          }}
        >
          {t("appTitle")}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        {/* <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            px: 1.25,
            py: 0.35,
            bgcolor: "background.default",
          }}
        >
          <Language fontSize="small" sx={{ color: "text.secondary", fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8125rem", color: "text.secondary" }}>
            {t("language")}
          </Typography>
          <Switch
            size="small"
            checked={!isArabic}
            onChange={() => onLocaleChange?.(isArabic ? "en" : "ar")}
            slotProps={{ input: { "aria-label": "language toggle" } }}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "secondary.main",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "secondary.main",
              },
            }}
          />
        </Stack> */}

        <IconButton onClick={handleOpenMenu} sx={{ p: 0.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 34, height: 34, fontSize: "0.875rem", fontWeight: 600 }}>
            <PersonOutlined fontSize="small" />
          </Avatar>
        </IconButton>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        keepMounted
        slotProps={{
          paper: {
            elevation: 2,
            sx: {
              mt: 1,
              minWidth: 160,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ fontSize: "0.875rem", fontWeight: 500, py: 1 }}>
          <Logout fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          {t("signOut")}
        </MenuItem>
      </Menu>
    </Box>
  );
}
