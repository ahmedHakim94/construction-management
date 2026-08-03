import { Box, type BoxProps } from "@mui/material";

export function AppPageContainer({ children, ...props }: BoxProps) {
  return (
    <Box sx={{ p: 3, ...props.sx }} {...props}>
      {children}
    </Box>
  );
}
