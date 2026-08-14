import { useState, useEffect, useRef } from "react";
import { DialogActions, DialogContent, DialogTitle, Typography, Box } from "@mui/material";
import { FormProvider, useFieldArray } from "react-hook-form";
import {
  Close as CloseIcon,
  PersonAddAlt1Outlined as AddContractorIcon,
  SettingsOutlined as GearIcon,
  Add as AddIcon,
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

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "equipment",
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const prevFieldsRef = useRef(fields);
  useEffect(() => {
    if (expandedId === null && fields.length > 0) {
      setExpandedId(fields[0].id);
    } else if (fields.length > prevFieldsRef.current.length) {
      const addedField = fields.find(
        (f) => !prevFieldsRef.current.some((pf) => pf.id === f.id)
      );
      if (addedField) {
        setExpandedId(addedField.id);
      }
    } else if (fields.length < prevFieldsRef.current.length) {
      const wasExpandedDeleted = !fields.some((f) => f.id === expandedId);
      if (wasExpandedDeleted) {
        const deletedIndex = prevFieldsRef.current.findIndex((pf) => pf.id === expandedId);
        if (fields.length > 0) {
          const newExpandIndex = Math.min(deletedIndex, fields.length - 1);
          setExpandedId(fields[newExpandIndex].id);
        } else {
          setExpandedId(null);
        }
      }
    }
    prevFieldsRef.current = fields;
  }, [fields, expandedId]);

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

            {/* Equipment Data Section Wrapper */}
            <Box
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: 3,
                p: 3,
                bgcolor: "#FFFFFF",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
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
                    color: "#8B5CF6",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    fontSize:"0.80rem"
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
                      equipmentTypeId: "",
                      model: "",
                      plateNumber: "",
                      hourRate: 0,
                      notes: "",
                    })
                  }
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: "none",
                    borderColor: "#8B5CF6",
                    // color: "#8B5CF6",
                    fontWeight: 600,
                    // "&:hover": {
                    //   borderColor: "#7C3AED",
                    //   bgcolor: "#F5F3FF",
                    // },
                  }}
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
                      onDelete={() => remove(index)}
                      isExpanded={expandedId === field.id}
                      onToggle={() => setExpandedId(expandedId === field.id ? null : field.id)}
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

