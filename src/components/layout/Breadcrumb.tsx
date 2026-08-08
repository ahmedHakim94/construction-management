import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Breadcrumb() {
  const location = useLocation();
  const { t } = useTranslation();

  const segments = location.pathname.split("/").filter(Boolean);

  const getSegmentLabel = (segment: string) => {
    const translationKeyMap: Record<string, string> = {
      dashboard: "dashboard",
      contractors: "contractors",
      equipment: "equipment",
      "daily-work": "dailyWork",
      payments: "payments",
      reports: "reports",
      settings: "settings",
      "equipment-types": "equipmentTypes",
      projects: "projects",
      tasks: "tasks",
    };

    const key = translationKeyMap[segment];

    return key ? t(key) : segment;
  };

  return (
    <Box
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        px: { xs: 2, sm: 2.5, md: 3 },
        py: 1,
        bgcolor: "background.paper",
      }}
    >
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="hover"
          color="inherit"
        >
          {t("home")}
        </Link>

        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          const label = getSegmentLabel(segment);

          return isLast ? (
            <Typography
              key={path}
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              {label}
            </Typography>
          ) : (
            <Link
              key={path}
              component={RouterLink}
              to={path}
              underline="hover"
              color="inherit"
            >
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}