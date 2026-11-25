import { useCallback, useMemo } from "react";
import { Box, CircularProgress, FormHelperText, useTheme } from "@mui/material";
import Select from "react-select";
import { useTranslation } from "react-i18next";

import { reactSelectStyles } from "../../styles/reactSelectStyles";

export interface SelectOption {
  value: string | number;
  label: string;
}

const EMPTY_OPTIONS: readonly SelectOption[] = [];

const LOADING_INDICATOR_SX = {
  display: "inline-flex",
  alignItems: "center",
  px: 0.75,
} as const;

function LoadingIndicator() {
  return (
    <Box sx={LOADING_INDICATOR_SX}>
      <CircularProgress size={16} color="primary" />
    </Box>
  );
}

const SELECT_COMPONENTS = {
  LoadingIndicator,
};

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
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  emptyText?: string;
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
  loading = false,
  disabled = false,
  loadingText,
  emptyText,
}: AppSelectProps) {
  const { t, i18n } = useTranslation("common");
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

  const styles = useMemo(
    () => reactSelectStyles(theme, error),
    [theme, error],
  );

  const resolvedLoadingText = loadingText ?? t("common:loading");
  const resolvedEmptyText = emptyText ?? t("common:noData");

  const getLoadingMessage = useCallback(
    () => resolvedLoadingText,
    [resolvedLoadingText],
  );

  const getNoOptionsMessage = useCallback(
    () => resolvedEmptyText,
    [resolvedEmptyText],
  );

  return (
    <Box width={width}>
      {finalLabel && (
        <label className="app-select-label">
          {finalLabel}
        </label>
      )}

      <Box dir={isRtl ? "rtl" : "ltr"}>
        <Select
          options={loading ? EMPTY_OPTIONS : options}
          value={selectedOption}
          onChange={(option) => onChange?.(option?.value ?? "")}
          placeholder={placeholder}
          isRtl={isRtl}
          isLoading={loading}
          isDisabled={disabled}
          loadingMessage={getLoadingMessage}
          noOptionsMessage={getNoOptionsMessage}
          components={SELECT_COMPONENTS}
          menuPlacement={menuPlacement}
          maxMenuHeight={maxMenuHeight}
          styles={styles}
          classNamePrefix="shared_Select"
          className={className}
        />
      </Box>

      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
}
