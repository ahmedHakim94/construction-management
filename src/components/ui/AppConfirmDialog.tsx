import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { AppButton } from "./AppButton";
import { AppDialog } from "./AppDialog";

interface AppConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function AppConfirmDialog({
  open,
  title,
  message,
  loading = false,
  confirmText,
  cancelText,
  onClose,
  onConfirm,
}: AppConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <AppDialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Typography color="text.secondary">{message}</Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton variant="contained" color="error" loading={loading} onClick={onConfirm}>
          {confirmText ?? t("confirm")}
        </AppButton>
        <AppButton variant="outlined" onClick={onClose} disabled={loading}>
          {cancelText ?? t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
