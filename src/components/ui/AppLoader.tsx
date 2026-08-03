import { Box, CircularProgress } from "@mui/material";

export function AppLoader() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
      <CircularProgress />
    </Box>
  );
}
