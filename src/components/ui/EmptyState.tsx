import { Box, Stack, Typography } from "@mui/material";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 4, textAlign: "center" }}>
      <Stack spacing={1}>
        <Typography variant="h6">{title}</Typography>
        {description ? <Typography color="text.secondary">{description}</Typography> : null}
      </Stack>
    </Box>
  );
}
