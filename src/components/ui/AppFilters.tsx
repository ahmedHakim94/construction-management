import { Box } from "@mui/material";

interface AppFiltersProps {
  children: React.ReactNode;
}

export function AppFilters({ children }: AppFiltersProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        flexWrap: "wrap",
        gap: 2,
        alignItems: { xs: "stretch", sm: "end" },
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
}