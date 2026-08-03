import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { useLocation } from "react-router-dom";

export function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: { xs: 2, sm: 2.5, md: 3 }, py: 1, bgcolor: "background.paper" }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          return isLast ? (
            <Typography key={path} color="text.primary" sx={{ textTransform: "capitalize" }}>
              {segment}
            </Typography>
          ) : (
            <Link key={path} underline="hover" color="inherit" href={path}>
              {segment}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
