import { useRef } from "react";
import { Box, Typography, InputAdornment } from "@mui/material";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Select, { type MultiValue } from "react-select";
import {
  DeleteOutline as DeleteIcon,
  SettingsOutlined as GearIcon,
  LocalShippingOutlined as ShippingIcon,
  MonetizationOnOutlined as MoneyIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { reactSelectStyles } from "@/styles/reactSelectStyles";
import { AppButton, AppInput } from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import type { ContractorFormValues } from "../types";

interface EquipmentSectionProps {
  equipmentTypeOptions: readonly SelectOption[];
}

export function EquipmentSection({ equipmentTypeOptions }: EquipmentSectionProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const { control, watch } = useFormContext<ContractorFormValues>();

  const { fields, replace, remove } = useFieldArray({
    control,
    name: "equipment",
  });

  const selectRef = useRef<any>(null);
  const equipment = watch("equipment") || [];

  const handleEquipmentTypesChange = (newValue: MultiValue<SelectOption>) => {
    const selectedOptions = newValue ? [...newValue] : [];
    const currentEquipment = watch("equipment") || [];

    const newEquipment = selectedOptions.map((opt) => {
      const existing = currentEquipment.find(
        (eq) => eq.equipmentTypeId === opt.value,
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

  return (
    <>
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

        <Select<SelectOption, true>
          ref={selectRef}
          isMulti
          options={equipmentTypeOptions}
          value={equipmentTypeOptions.filter((opt) =>
            equipment.some((eq) => eq.equipmentTypeId === opt.value),
          )}
          onChange={handleEquipmentTypesChange}
          placeholder={t("selectPlaceholder")}
          isRtl={isArabic}
          styles={reactSelectStyles() as any}
          classNamePrefix="shared_Select"
        />
      </Box>

      {/* Section 3: Equipment Form Cards */}
      {equipment.length > 0 && (
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
                (opt) => opt.value === field.equipmentTypeId,
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ShippingIcon sx={{ color: "#8B5CF6" }} />
                      <Typography sx={{ fontWeight: 600, color: "#1E293B" }}>
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
                        md: "1.6fr 1.6fr 1.6fr 1.6fr",
                      },
                      gap: 2,
                      alignItems: "start",
                    }}
                  >
                    <Controller
                      name={`equipment.${index}.model`}
                      control={control}
                      render={({ field: inputField }) => (
                        <AppInput label={t("model")} {...inputField} />
                      )}
                    />

                    <Controller
                      name={`equipment.${index}.plateNumber`}
                      control={control}
                      render={({ field: inputField }) => (
                        <AppInput label={t("plateNumber")} {...inputField} />
                      )}
                    />

                    <Controller
                      name={`equipment.${index}.hourRate`}
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
                      name={`equipment.${index}.notes`}
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
    </>
  );
}
