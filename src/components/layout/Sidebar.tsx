import {
  Assessment,
  Build,
  DashboardRounded,
  ExpandLess,
  ExpandMore,
  Handyman,
  Paid,
  Settings,
  WorkHistory,
} from "@mui/icons-material";
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { SvgIconComponent } from "@mui/icons-material";

interface SidebarProps {
  open?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}

interface SidebarItem {
  key: string;
  path: string;
  icon: SvgIconComponent;
  children?: SidebarItem[];
}

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;
const MOBILE_DRAWER_WIDTH = 280;

const navigationItems: SidebarItem[] = [
  {
    key: "dashboard",
    path: "/dashboard",
    icon: DashboardRounded,
  },
  {
    key: "contractors",
    path: "/contractors",
    icon: Handyman,
  },
  {
    key: "equipment",
    path: "/equipment",
    icon: Build,
  },
  {
    key: "dailyWork",
    path: "/daily-work",
    icon: WorkHistory,
  },
  {
    key: "payments",
    path: "/payments",
    icon: Paid,
  },
  {
    key: "reports",
    path: "/reports",
    icon: Assessment,
  },
  {
    key: "settings",
    path: "/settings",
    icon: Settings,
    children: [
      {
        key: "equipmentTypes",
        path: "/settings/equipment-types",
        icon: Build,
      },
      {
        key: "tasks",
        path: "/settings/tasks",
        icon: Assessment,
      },
      {
        key: "projects",
        path: "/settings/projects",
        icon: Build,
      },
    ],
  },
];


function isPathActive(currentPath: string, itemPath: string, hasChildren: boolean) {
  if (hasChildren) {
    return currentPath.startsWith(itemPath);
  }
  return currentPath === itemPath;
}

export function Sidebar({
  open = true,
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();

  const [openKeys, setOpenKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    navigationItems.forEach((item) => {
      if (item.children?.length && location.pathname.startsWith(item.path)) {
        initial.add(item.key);
      }
    });
    return initial;
  });

  const toggleExpand = useCallback((key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);


  const renderItem = (item: SidebarItem, nested = false) => {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children?.length);
    const isExpanded = openKeys.has(item.key);
    const isActive = isPathActive(location.pathname, item.path, hasChildren);

    return (
      <Box key={item.path}>
        <ListItemButton
          component={hasChildren ? "button" : NavLink}
          {...(!hasChildren && { to: item.path })}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.key);
            } else {
              onClose?.();
            }
          }}
          aria-expanded={hasChildren ? isExpanded : undefined}
          sx={{
            position: "relative",
            borderRadius: 1.5,
            minHeight: nested ? 34 : 38,
            px: 1.5,
            py: 0.5,
            pl: nested ? 4 : 1.5,
            color: isActive ? "primary.contrastText" : "text.secondary",
            bgcolor: isActive ? "primary.main" : "transparent",
            justifyContent: open ? "flex-start" : "center",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: isActive ? "primary.main" : "action.hover",
              color: isActive ? "primary.contrastText" : "text.primary",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? 34 : 0,
              color: "inherit",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: nested ? 18 : 20 }} />
          </ListItemIcon>

          {open && (
            <ListItemText
              primary={t(item.key)}
              primaryTypographyProps={{
                fontWeight: isActive ? 600 : 500,
                fontSize: nested ? "0.8125rem" : "0.875rem",
              }}
            />
          )}

          {hasChildren && open && (
            isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )
          )}
        </ListItemButton>

        {hasChildren && open && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List
              disablePadding
              sx={{
                mt: 0.25,
                display: "flex",
                flexDirection: "column",
                gap: 0.25,
              }}
            >
              {item.children!.map((child) => renderItem(child, true))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const content = (
    <Box
      sx={{
        width: {
          xs: MOBILE_DRAWER_WIDTH,
          md: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        },
        height: "100%",
        bgcolor: "background.paper",
        borderInlineEnd: "1px solid",
        borderColor: "divider",
        px: { xs: 2, md: 1.5 },
        py: { xs: 2, md: 2 },
        transition: "width 0.2s ease",
        overflow: "hidden",
      }}
    >
      <Stack spacing={2} sx={{ height: "100%" }}>
        <Box
          sx={{
            px: 1.5,
            py: 0.25,
            display: "flex",
            justifyContent: open ? "flex-start" : "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.125rem",
              color: "primary.main",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            CM
          </Typography>
        </Box>
        <List
          disablePadding
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.4,
          }}
        >
          {navigationItems.map((item) => renderItem(item))}
        </List>
      </Stack>
    </Box>
  );

  return (
    <>
      <Box
        component="nav"
        aria-label="Sidebar navigation"
        sx={{
          display: { xs: "none", md: "block" },
          flexShrink: 0,
        }}
      >
        {content}
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: MOBILE_DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}