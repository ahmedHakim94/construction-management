import { Avatar, Box, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { Logout, Menu as MenuIcon, PersonOutlined } from "@mui/icons-material";
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

export function Header({ onSidebarToggle }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
        height: 56,
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
        <IconButton onClick={onSidebarToggle} sx={{ display: { md: "none" }, color: "text.primary", p: 0.75 }}>
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
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
        <IconButton onClick={handleOpenMenu} sx={{ p: 0.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 32, height: 32, fontSize: "0.8125rem", fontWeight: 600 }}>
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
