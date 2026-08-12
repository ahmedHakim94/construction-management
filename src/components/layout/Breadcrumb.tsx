import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Breadcrumb() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

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
        py: { xs: 1.5, md: 1 },
        minHeight: { xs: 48, md: 40 },
        display: "flex",
        alignItems: "center",
        bgcolor: "background.paper",
        overflowX: "auto",
        whiteSpace: "nowrap",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" sx={{ transform: isRtl ? "rotate(180deg)" : "none" }} />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-ol": {
            flexWrap: "nowrap",
            alignItems: "center",
          },
        }}
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