import { Box, type BoxProps } from "@mui/material";

export function AppPageContainer({ children, ...props }: BoxProps) {
  return (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, ...props.sx }} {...props}>
      {children}
    </Box>
  );
}
