import { useState, useEffect, useRef } from "react";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";
import { FormProvider, useFieldArray } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import AddContractorIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import GearIcon from "@mui/icons-material/SettingsOutlined";
import AddIcon from "@mui/icons-material/Add";
import { AppButton, AppDialog, DialogLoadingOverlay } from "@/components/ui";
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
    isInitialEditLoading,
    projectsLoading,
    equipmentTypesLoading,
    isSuperAdmin,
    projectOptions,
    equipmentTypeOptions,
    submit,
    handleSubmit,
    isArabic,
    t,
  } = useContractorForm(props);

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "equipment",
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const prevFieldsRef = useRef(fields);
  useEffect(() => {
    const prevFields = prevFieldsRef.current;

    setExpandedId((currentExpandedId) => {
      if (currentExpandedId === null && fields.length > 0) {
        return fields[0].id;
      }
      if (fields.length > prevFields.length) {
        const addedField = fields.find(
          (f) => !prevFields.some((pf) => pf.id === f.id),
        );
        return addedField ? addedField.id : currentExpandedId;
      }
      if (fields.length < prevFields.length) {
        const wasExpandedDeleted = !fields.some(
          (f) => f.id === currentExpandedId,
        );
        if (wasExpandedDeleted) {
          const deletedIndex = prevFields.findIndex(
            (pf) => pf.id === currentExpandedId,
          );
          if (fields.length > 0) {
            const newExpandIndex = Math.min(deletedIndex, fields.length - 1);
            return fields[newExpandIndex].id;
          }
          return null;
        }
      }
      return currentExpandedId;
    });

    prevFieldsRef.current = fields;
  }, [fields]);

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
          borderBottom: "1px solid",
          borderColor: "divider",
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
            color: "text.primary",
          }}
        >
          <AddContractorIcon sx={{ color: "primary.main" }} />
          {mode === "create" ? t("addContractor") : t("editContractor")}
        </Typography>
        <AppButton
          variant="text"
          onClick={onClose}
          sx={{ minWidth: 0, p: 0.5, color: "text.secondary" }}
        >
          <CloseIcon />
        </AppButton>
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent
          dir={isArabic ? "rtl" : "ltr"}
          sx={{
            p: 3,
            bgcolor: "background.default",
            position: "relative",
            minHeight: isInitialEditLoading ? 280 : undefined,
          }}
        >
          <DialogLoadingOverlay loading={isInitialEditLoading} />

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
            <ContractorInfoSection
              isSuperAdmin={isSuperAdmin}
              projectOptions={projectOptions}
              projectsLoading={projectsLoading}
            />

            {/* Equipment Data Section Wrapper */}
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    fontSize: "0.875rem",
                  }}
                >
                  <GearIcon />
                  {t("equipmentData")}
                </Typography>

                <AppButton
                  variant="contained"
                  size="small"
                  onClick={() =>
                    append({
                      equipmentTypeId: 0,
                      model: "",
                      plateNumber: "",
                      hourlyPrice: 0,
                      notes: "",
                    })
                  }
                  startIcon={<AddIcon />}
                >
                  {t("addAnotherEquipment")}
                </AppButton>
              </Box>

              {/* List of independent EquipmentSections */}
              {fields.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                  }}
                >
                  {fields.map((field, index) => (
                    <EquipmentSection
                      key={field.id}
                      index={index}
                      equipmentTypeOptions={equipmentTypeOptions}
                      equipmentTypesLoading={equipmentTypesLoading}
                      onDelete={() => remove(index)}
                      isExpanded={expandedId === field.id}
                      onToggle={() =>
                        setExpandedId(expandedId === field.id ? null : field.id)
                      }
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
      </FormProvider>

      <DialogActions
        dir={isArabic ? "rtl" : "ltr"}
        sx={{
          px: 3,
          pb: 2,
          pt: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <AppButton
          loading={loading}
          disabled={isInitialEditLoading}
          onClick={handleSubmit(submit)}
          variant="contained"
          sx={{ px: 4 }}
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
