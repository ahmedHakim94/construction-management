import { DialogActions, DialogContent, DialogTitle, Typography, Box } from "@mui/material";
import { FormProvider } from "react-hook-form";
import {
  Close as CloseIcon,
  PersonAddAlt1Outlined as AddContractorIcon,
} from "@mui/icons-material";
import { AppButton, AppDialog } from "@/components/ui";
import type { Contractor, ContractorFormValues } from "../types";
import { ContractorInfoSection } from "./ContractorInfoSection";
import { EquipmentSection } from "./EquipmentSection";
import { useContractorForm } from "../hooks/useContractorForm";
import "./ContractorDialog.scss";

interface ContractorDialogProps {
  open: boolean;
  mode: "create" | "edit";
  contractor?: Contractor;
  onClose: () => void;
  onSubmit: (values: ContractorFormValues) => Promise<void>;
}

export function ContractorDialog(props: ContractorDialogProps) {
  const { open, mode, onClose } = props;
  const {
    methods,
    loading,
    equipmentTypeOptions,
    submit,
    handleSubmit,
    isArabic,
    t,
  } = useContractorForm(props);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="contractor_Dialog"
    >
      <DialogTitle
        dir={isArabic ? "rtl" : "ltr"}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E2E8F0",
          px: 3,
          py: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            color: "#1E293B",
          }}
        >
          <AddContractorIcon sx={{ color: "#3B82F6" }} />
          {mode === "create" ? t("addContractor") : t("editContractor")}
        </Typography>
        <AppButton
          variant="text"
          onClick={onClose}
          sx={{ minWidth: 0, p: 0.5, color: "#64748B" }}
        >
          <CloseIcon />
        </AppButton>
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent
          dir={isArabic ? "rtl" : "ltr"}
          sx={{ p: 3, bgcolor: "#F8FAFC" }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(submit)}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              pt: 1,
            }}
          >
            <ContractorInfoSection />
            <EquipmentSection equipmentTypeOptions={equipmentTypeOptions} />
          </Box>
        </DialogContent>
      </FormProvider>

      <DialogActions
        dir={isArabic ? "rtl" : "ltr"}
        sx={{ px: 3, pb: 2, pt: 1.5, borderTop: "1px solid #E2E8F0" }}
      >
        <AppButton
          loading={loading}
          onClick={handleSubmit(submit)}
          variant="contained"
          sx={{
            px: 4,
            bgcolor: "#2563EB",
            "&:hover": { bgcolor: "#1D4ED8" },
          }}
        >
          {isArabic ? "حفظ المقاول والمعدات" : t("save")}
        </AppButton>
        <AppButton variant="outlined" color="error" onClick={onClose}>
          {t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}

