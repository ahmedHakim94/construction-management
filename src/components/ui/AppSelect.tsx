import { Box, FormHelperText, useTheme } from "@mui/material";
import Select from "react-select";
import { useTranslation } from "react-i18next";

import { reactSelectStyles } from "../../styles/reactSelectStyles";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface AppSelectProps {
  label?: string;
  required?: boolean;
  options: readonly SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  width?: string | number;
  menuPlacement?: "auto" | "top" | "bottom";
  maxMenuHeight?: number;
}

export function AppSelect({
  label,
  required,
  options,
  value,
  onChange,
  placeholder,
  error,
  className,
  width = "100%",
  menuPlacement = "auto",
  maxMenuHeight,
}: AppSelectProps) {
  const { i18n } = useTranslation();
  const theme = useTheme();

  const isRtl = i18n.language === "ar";

  const finalLabel =
    label && required
      ? isRtl
        ? `* ${label}`
        : `${label} *`
      : label;

  const selectedOption =
    value !== undefined && value !== null && value !== ""
      ? options?.find((item) => String(item.value) === String(value)) ?? null
      : null;

  return (
    <Box width={width}>
      {finalLabel && (
        <label className="app-select-label">
          {finalLabel}
        </label>
      )}

      <Box dir={isRtl ? "rtl" : "ltr"}>
        <Select
          options={options}
          value={selectedOption}
          onChange={(option) => onChange?.(option?.value ?? "")}
          placeholder={placeholder}
          isRtl={isRtl}
          menuPlacement={menuPlacement}
          maxMenuHeight={maxMenuHeight}
          styles={reactSelectStyles(theme, error)}
          classNamePrefix="shared_Select"
          className={className}
        />
      </Box>

      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
}
