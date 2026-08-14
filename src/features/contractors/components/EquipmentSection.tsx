import { Box, Typography, InputAdornment, Collapse } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  DeleteOutline as DeleteIcon,
  MonetizationOnOutlined as MoneyIcon,
  LocalShippingOutlined as ShippingIcon,
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
        // border: "1px solid #E2E8F0",
        // borderRadius: 2,
        bgcolor: "#F8FAFC",
        overflow: isExpanded ? "visible" : "hidden",
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": {
          borderColor: isExpanded ? "#8B5CF6" : "#CBD5E1",
        },
        boxShadow: isExpanded
          ? "0 4px 6px -1px rgba(139, 92, 246, 0.08), 0 2px 4px -1px rgba(139, 92, 246, 0.04)"
          : "none",
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
          p: 2,
          cursor: "pointer",
          bgcolor: isExpanded ? "#F5F3FF" : "#FFFFFF",
          borderBottom: isExpanded ? "1px solid #E2E8F0" : "0px solid transparent",
          transition: "background-color 0.2s, border-color 0.2s",
          gap: 1.5,
          "&:hover": {
            bgcolor: isExpanded ? "#EDE9FE" : "#F8FAFC",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flex: 1,
            minWidth: 0,
          }}
        >
          <ExpandMoreIcon
            sx={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease-in-out",
              color: isExpanded ? "#8B5CF6" : "#64748B",
              flexShrink: 0,
            }}
          />
          <ShippingIcon
            sx={{
              color: isExpanded ? "#8B5CF6" : "#64748B",
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontWeight: 600,
              color: isExpanded ? "#7C3AED" : "#1E293B",
              fontSize: "0.95rem",
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
          startIcon={<DeleteIcon />}
          sx={{
            textTransform: "none",
            bgcolor: "#FFFFFF",
            borderColor: "#FECACA",
            color: "#EF4444",
            minWidth: "fit-content",
            "&:hover": {
              bgcolor: "#FEE2E2",
              borderColor: "#FCA5A5",
            },
          }}
        >
          {t("delete")}
        </AppButton>
      </Box>

      {/* Accordion Details (Collapse) */}
      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit={false}
        sx={{ overflow: isExpanded ? "visible" : "hidden" }}
      >
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            bgcolor: "#FFFFFF",
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
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
