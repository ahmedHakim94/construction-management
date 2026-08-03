import { DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { AppButton, AppDialog } from "@/components/ui";

interface DeleteContractorDialogProps {
  open: boolean;
  contractorName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteContractorDialog({ open, contractorName, onClose, onConfirm }: DeleteContractorDialogProps) {
  return (
    <AppDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Contractor</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{contractorName ?? "this contractor"}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton variant="outlined" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton color="error" onClick={onConfirm}>
          Delete
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
