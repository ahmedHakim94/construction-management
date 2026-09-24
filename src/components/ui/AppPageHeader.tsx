import { Box, Stack, Typography } from "@mui/material";

interface AppPageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export function AppPageHeader({
  title,
  description,
  actions,
}: AppPageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", md: "center" }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.35rem", md: "1.65rem" },
            letterSpacing: "-0.01em",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, fontWeight: 400 }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {actions && (
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            flexWrap: "wrap",
            justifyContent: {
              xs: "stretch",
              md: "flex-end",
            },
            alignItems: "center",
          }}
        >
          {actions}
        </Box>
      )}
    </Stack>
  );
}