import { DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { AppButton, AppDialog } from "@/components/ui";

interface DeleteContractorDialogProps {
  open: boolean;
  contractorName?: string;
  onClose: () => void;
  onConfirm: () => void;
  deleteLoading: boolean;
}

export function DeleteContractorDialog({ open, contractorName, onClose, onConfirm,deleteLoading }: DeleteContractorDialogProps) {
  const { t } = useTranslation();

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("deleteContractor")}</DialogTitle>
      <DialogContent>
        <Typography>
          <Trans
            i18nKey="deleteConfirmation"
            values={{ name: contractorName || t("thisContractor") }}
          >
            Are you sure you want to delete <strong>{contractorName || t("thisContractor")}</strong>?
          </Trans>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton variant="outlined" onClick={onClose}>
          {t("cancel")}
        </AppButton>
        <AppButton color="error" loading={deleteLoading} onClick={onConfirm}>
          {t("delete")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
