import { Box } from "@mui/material";

interface AppFiltersProps {
  children: React.ReactNode;
}

export function AppFilters({ children }: AppFiltersProps) {
  return (
    <Box
      sx={{
        display: "flex",
        // flexWrap: "wrap",
        gap: 2,
        alignItems: "end",
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
}