import { Box, Typography } from "@mui/material";

interface AppPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AppPageHeader({ title, description, actions }: AppPageHeaderProps) {
  return (
    <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
      <Box>
        <Typography variant="h5">{title}</Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions ? <Box>{actions}</Box> : null}
    </Box>
  );
}
