import { Box, type BoxProps, Container } from "@mui/material";

export function PageContainer({ children, ...props }: BoxProps) {
  return (
    <Box component="section" sx={{ px: { xs: 2, sm: 2.5, lg: 3 }, py: { xs: 2.5, md: 3 } }} {...props}>
      <Container maxWidth={false} disableGutters sx={{ maxWidth: 1400, mx: "auto", px: { xs: 0, sm: 0.5, md: 0 } }}>
        {children}
      </Container>
    </Box>
  );
}
