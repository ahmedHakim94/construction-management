import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const OVERLAY_SX = {
  position: "absolute",
  inset: 0,
  zIndex: 20,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 1.5,
  bgcolor: "background.paper",
} as const;

interface DialogLoadingOverlayProps {
  loading: boolean;
}

export function DialogLoadingOverlay({ loading }: DialogLoadingOverlayProps) {
  const { t } = useTranslation("common");

  if (!loading) return null;

  return (
    <Box sx={OVERLAY_SX}>
      <CircularProgress size={30} />
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {t("common:loading")}
      </Typography>
    </Box>
  );
}
