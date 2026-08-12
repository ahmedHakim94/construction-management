import { Box, FormHelperText } from "@mui/material";
import Select from "react-select";
import { useTranslation } from "react-i18next";

import { reactSelectStyles } from "../../styles/reactSelectStyles";

export interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  label?: string;
  required?: boolean;
  options: readonly SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  width?: any;
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
}: AppSelectProps) {
  const { i18n } = useTranslation();

  const isRtl = i18n.language === "ar";

  const finalLabel =
    label && required
      ? isRtl
        ? `* ${label}`
        : `${label} *`
      : label;

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
          value={options.find((item) => item.value === value) ?? null}
          onChange={(option) => onChange?.(option?.value ?? "")}
          placeholder={placeholder}
          isRtl={isRtl}
          styles={reactSelectStyles(error)}
          classNamePrefix="shared_Select"
          className={className}
        />
      </Box>

      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
}