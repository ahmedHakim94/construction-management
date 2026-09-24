import { Box, Typography, InputAdornment, Collapse } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  MonetizationOnOutlined as MoneyIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { AppButton, AppInput, AppSelect } from "@/components/ui";
import type { SelectOption } from "@/components/ui/AppSelect";
import type { ContractorFormValues } from "../types";

interface EquipmentSectionProps {
  index: number;
  equipmentTypeOptions: readonly SelectOption[];
  onDelete: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function EquipmentSection({
  index,
  equipmentTypeOptions,
  onDelete,
  isExpanded,
  onToggle,
}: EquipmentSectionProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const { control, watch } = useFormContext<ContractorFormValues>();

  const equipmentTypeId = watch(`equipment.${index}.equipmentTypeId`);
  const isSelected = Boolean(equipmentTypeId);

  const selectedType = equipmentTypeOptions.find(
    (opt) => opt.value === equipmentTypeId,
  );

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: isExpanded ? "primary.main" : "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden",
        transition: "border-color 0.15s ease",
      }}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Accordion Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.75,
          cursor: "pointer",
          bgcolor: isExpanded ? "background.default" : "background.paper",
          borderBottom: isExpanded ? "1px solid" : "0px solid transparent",
          borderColor: "divider",
          transition: "background-color 0.15s ease",
          gap: 1.5,
          "&:hover": {
            bgcolor: "background.default",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            flex: 1,
            minWidth: 0,
          }}
        >
          <ExpandMoreIcon
            sx={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease-in-out",
              color: isExpanded ? "primary.main" : "text.secondary",
              flexShrink: 0,
              fontSize: 20,
            }}
          />
          <Typography
            sx={{
              fontWeight: 600,
              color: isExpanded ? "primary.main" : "text.primary",
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {`${index + 1}. ${selectedType?.label ?? (isArabic ? "اختر نوع المعدة" : "Select Equipment Type")}`}
          </Typography>
        </Box>

        <AppButton
          color="error"
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{ minHeight: 32, px: 1.5 }}
        >
          {t("delete")}
        </AppButton>
      </Box>

      {/* Accordion Details (Collapse) */}
      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit={false}
      >
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            bgcolor: "background.paper",
          }}
        >
          {/* Equipment Type Single Select */}
          <Box sx={{ maxWidth: { xs: "100%", sm: "50%" } }}>
            <Controller
              name={`equipment.${index}.equipmentTypeId`}
              control={control}
              render={({ field, fieldState }) => (
                <AppSelect
                  label={t("equipmentType") || "نوع المعدة"}
                  required
                  options={equipmentTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder={t("selectPlaceholder")}
                />
              )}
            />
          </Box>

          {/* Conditional inputs */}
          {isSelected && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
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
                          <MoneyIcon sx={{ color: "text.secondary", fontSize: 20 }} />
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
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
