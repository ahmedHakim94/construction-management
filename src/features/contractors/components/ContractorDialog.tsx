import { useEffect, useState, useRef } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import {
  Close as CloseIcon,
  PersonOutline as PersonIcon,
  LocalPhoneOutlined as PhoneIcon,
  AssignmentOutlined as NoteIcon,
  DeleteOutline as DeleteIcon,
  SettingsOutlined as GearIcon,
  LocalShippingOutlined as ShippingIcon,
  MonetizationOnOutlined as MoneyIcon,
  Add as AddIcon,
  PersonAddAlt1Outlined as AddContractorIcon,
} from "@mui/icons-material";
import { reactSelectStyles } from "@/styles/reactSelectStyles";
import {
  AppButton,
  AppDialog,
  AppInput,
  AppSelect,
  AppTextarea,
} from "@/components/ui";
import { contractorSchema } from "../schemas/contractor.schema";
import type { Contractor, ContractorFormValues } from "../types";
import { equipmentTypeService } from "@/features/settings/equipment-type/services/equipmentType.service";
import { equipmentService } from "@/features/equipment/services/equipment.service";
import "./ContractorDialog.scss";

interface ContractorDialogProps {
  open: boolean;
  mode: "create" | "edit";
  contractor?: Contractor;
  onClose: () => void;
  onSubmit: (values: ContractorFormValues) => Promise<void>;
}

export function ContractorDialog({
  open,
  mode,
  contractor,
  onClose,
  onSubmit,
}: ContractorDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [loading, setLoading] = useState(false);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const selectRef = useRef<any>(null);

  const statusOptions = [
    {
      value: "ACTIVE",
      label: t("active"),
    },
    {
      value: "INACTIVE",
      label: t("inactive"),
    },
  ];

  const { control, handleSubmit, reset, watch } = useForm<ContractorFormValues>(
    {
      resolver: zodResolver(contractorSchema),
      defaultValues: {
        name: "",
        phone: "",
        address: "",
        nationalId: "",
        notes: "",
        status: "ACTIVE",
        equipment: [],
      },
    },
  );

  const { fields, replace, remove } = useFieldArray({
    control,
    name: "equipment",
  });

  useEffect(() => {
    async function loadOptions() {
      const types = await equipmentTypeService.getAll();
      setEquipmentTypeOptions(
        types.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function loadContractorEquipment() {
      if (open) {
        let contractorEq: any[] = [];
        if (mode === "edit" && contractor) {
          const allEq = await equipmentService.getAll();
          contractorEq = allEq
            .filter((eq) => eq.contractorId === contractor.id)
            .map((eq) => ({
              id: eq.id,
              equipmentTypeId: eq.equipmentTypeId,
              model: eq.model || "",
              plateNumber: eq.plateNumber || "",
              hourRate: eq.hourRate,
              notes: eq.notes || "",
            }));
        }

        reset({
          name: contractor?.name ?? "",
          phone: contractor?.phone ?? "",
          address: contractor?.address ?? "",
          nationalId: contractor?.nationalId ?? "",
          notes: contractor?.notes ?? "",
          status: contractor?.status ?? "ACTIVE",
          equipment: contractorEq,
        });
      }
    }

    loadContractorEquipment();
  }, [contractor, open, reset, mode]);

  const handleEquipmentTypesChange = (newValue: any) => {
    const selectedOptions = (newValue || []) as {
      value: string;
      label: string;
    }[];
    const currentEquipment = watch("equipment") || [];

    const newEquipment = selectedOptions.map((opt) => {
      const existing = currentEquipment.find(
        (eq: any) => eq.equipmentTypeId === opt.value,
      );
      if (existing) {
        return existing;
      }
      return {
        equipmentTypeId: opt.value,
        model: "",
        plateNumber: "",
        hourRate: 0,
        notes: "",
      };
    });

    replace(newEquipment);
  };

  const handleFocusSelect = () => {
    if (selectRef.current) {
      selectRef.current.focus();
    }
  };

  const submit = async (values: ContractorFormValues) => {
    setLoading(true);
    try {
      await onSubmit(values);
      reset({
        name: "",
        phone: "",
        address: "",
        nationalId: "",
        notes: "",
        status: "ACTIVE",
        equipment: [],
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
            direction: isArabic ? "rtl" : "ltr",
          }}
        >
          {/* Section 1: Contractor Info */}
          <Box
            sx={{
              border: "1px solid #E2E8F0",
              borderRadius: 3,
              p: 3,
              bgcolor: "#FFFFFF",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
            dir={isArabic ? "rtl" : "ltr"}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: "#2563EB",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                mb: 2.5,
              }}
            >
              <NoteIcon />
              {t("contractorInfo")}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems:"end",
                justifyContent:"space-between",
                // flexWrap: "wrap",
                gap: 2.5,
              }}
            >
              <Box sx={{ width: "35%" }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <AppInput
                      label={t("name")}
                      required
                      {...field}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: "#94A3B8" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ width: "35%" }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <AppInput
                      label={t("phone")}
                      required
                      {...field}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: "#94A3B8" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ width: "25%" }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field, fieldState }) => (
                    <AppSelect
                      label={t("status")}
                      required
                      options={statusOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      className="react_select_status"
                    />
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 2.5 }}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <AppTextarea label={t("notes")} {...field} />
                )}
              />
            </Box>
          </Box>

          {/* Section 2: Select Equipment Types */}
          <Box
            sx={{
              border: "1px solid #E2E8F0",
              borderRadius: 3,
              p: 3,
              bgcolor: "#FFFFFF",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
            dir={isArabic ? "rtl" : "ltr"}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: "#10B981",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                mb: 1.5,
              }}
            >
              <ShippingIcon />
              {t("selectEquipmentTypes")}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 2 }}
            >
              {t("selectEquipmentTypesDescription")}
            </Typography>

            <Select<any, true>
              ref={selectRef}
              isMulti
              options={equipmentTypeOptions}
              value={equipmentTypeOptions.filter((opt) =>
                (watch("equipment") || []).some(
                  (eq: any) => eq.equipmentTypeId === opt.value,
                ),
              )}
              onChange={handleEquipmentTypesChange}
              placeholder={t("selectPlaceholder")}
              isRtl={isArabic}
              styles={reactSelectStyles() as any}
              classNamePrefix="shared_Select"
            />
          </Box>

          {/* Section 3: Equipment Form Cards */}
          {(watch("equipment") || []).length > 0 && (
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
              dir={isArabic ? "rtl" : "ltr"}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#8B5CF6",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  mb: 1,
                }}
              >
                <GearIcon />
                {t("equipmentData")}
              </Typography>

              <Box
                dir={isArabic ? "rtl" : "ltr"}
                sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
              >
                {fields.map((field, index) => {
                  const eqType = equipmentTypeOptions.find(
                    (opt) => opt.value === (field as any).equipmentTypeId,
                  );
                  return (
                    <Box
                      key={field.id}
                      sx={{
                        border: "1px solid #E2E8F0",
                        borderRadius: 2.5,
                        p: 2.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        bgcolor: "#F8FAFC",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <ShippingIcon sx={{ color: "#8B5CF6" }} />
                          <Typography
                            sx={{ fontWeight: 600, color: "#1E293B" }}
                          >
                            {`${index + 1}. ${eqType?.label ?? ""}`}
                          </Typography>
                        </Box>
                        <AppButton
                          color="error"
                          variant="outlined"
                          size="small"
                          onClick={() => remove(index)}
                          startIcon={<DeleteIcon />}
                          sx={{
                            textTransform: "none",
                            bgcolor: "#FFFFFF",
                            borderColor: "#FECACA",
                            color: "#EF4444",
                            "&:hover": {
                              bgcolor: "#FEE2E2",
                              borderColor: "#FCA5A5",
                            },
                          }}
                        >
                          {t("delete")}
                        </AppButton>
                      </Box>

                      {/* Horizontal inputs layout */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            md: "1.6fr 1.6fr 1.6fr  1.6fr",
                          },
                          gap: 2,
                          alignItems: "start",
                        }}
                      >
                        {/* <AppInput
                          label={isArabic ? "نوع المعدة" : "Equipment Type"}
                          value={eqType?.label ?? ""}
                          InputProps={{ readOnly: true }}
                          disabled
                        /> */}

                        <Controller
                          name={`equipment.${index}.model` as any}
                          control={control}
                          render={({ field: inputField }) => (
                            <AppInput label={t("model")} {...inputField} />
                          )}
                        />

                        <Controller
                          name={`equipment.${index}.plateNumber` as any}
                          control={control}
                          render={({ field: inputField }) => (
                            <AppInput
                              label={t("plateNumber")}
                              {...inputField}
                            />
                          )}
                        />

                        <Controller
                          name={`equipment.${index}.hourRate` as any}
                          control={control}
                          render={({ field: inputField, fieldState }) => (
                            <AppInput
                              label={t("hourRate")}
                              type="number"
                              required
                              value={inputField.value}
                              onChange={(event) =>
                                inputField.onChange(Number(event.target.value))
                              }
                              error={Boolean(fieldState.error)}
                              helperText={fieldState.error?.message}
                              inputProps={{ min: 0, step: 0.01 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <MoneyIcon sx={{ color: "#94A3B8" }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />

                        <Controller
                          name={`equipment.${index}.notes` as any}
                          control={control}
                          render={({ field: inputField }) => (
                            <AppInput label={t("notes")} {...inputField} />
                          )}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <AppButton
                variant="outlined"
                fullWidth
                sx={{
                  borderStyle: "dashed",
                  borderColor: "#8B5CF6",
                  color: "#8B5CF6",
                  py: 1.5,
                  fontWeight: 600,
                  "&:hover": {
                    borderStyle: "dashed",
                    borderColor: "#7C3AED",
                    bgcolor: "#F5F3FF",
                  },
                }}
                onClick={handleFocusSelect}
                startIcon={<AddIcon />}
              >
                {t("addAnotherEquipment")}
              </AppButton>
            </Box>
          )}
        </Box>
      </DialogContent>

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
          {isArabic ? "إلغاء" : t("cancel")}
        </AppButton>
      </DialogActions>
    </AppDialog>
  );
}
