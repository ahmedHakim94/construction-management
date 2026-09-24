import type { StylesConfig } from "react-select";
import type { Theme } from "@mui/material/styles";
import type { SelectOption } from "@/components/ui/AppSelect";

export const reactSelectStyles = (
  theme?: Theme,
  error?: string,
): StylesConfig<SelectOption, false> => ({
  control: (base, state) => {
    const isError = Boolean(error);
    const borderColor = isError
      ? theme?.palette.error.main ?? "#E11D48"
      : state.isFocused
      ? theme?.palette.primary.main ?? "#0F1E36"
      : theme?.palette.divider ?? "#E2E8F0";

    const hoverBorderColor = isError
      ? theme?.palette.error.main ?? "#E11D48"
      : state.isFocused
      ? theme?.palette.primary.main ?? "#0F1E36"
      : theme?.palette.text.disabled ?? "#94A3B8";

    return {
      ...base,
      minHeight: 44,
      borderRadius: theme?.shape.borderRadius ? Number(theme.shape.borderRadius) - 2 : 10,
      cursor: "pointer",
      boxShadow: "none",
      backgroundColor: theme?.palette.background.paper ?? "#FFFFFF",
      borderColor,
      borderWidth: state.isFocused ? 1.5 : 1,
      "&:hover": {
        borderColor: hoverBorderColor,
      },
    };
  },

  valueContainer: (base) => ({
    ...base,
    padding: "2px 12px",
  }),

  placeholder: (base) => ({
    ...base,
    color: theme?.palette.text.disabled ?? "#94A3B8",
    fontSize: "0.875rem",
    fontFamily: theme?.typography.fontFamily,
  }),

  singleValue: (base) => ({
    ...base,
    color: theme?.palette.text.primary ?? "#0F172A",
    fontSize: "0.875rem",
    fontFamily: theme?.typography.fontFamily,
  }),

  menu: (base) => ({
    ...base,
    borderRadius: theme?.shape.borderRadius ? Number(theme.shape.borderRadius) - 2 : 10,
    backgroundColor: theme?.palette.background.paper ?? "#FFFFFF",
    border: `1px solid ${theme?.palette.divider ?? "#E2E8F0"}`,
    boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
    overflow: "hidden",
    zIndex: 9999,
  }),

  option: (base, state) => ({
    ...base,
    cursor: "pointer",
    fontSize: "0.875rem",
    fontFamily: theme?.typography.fontFamily,
    backgroundColor: state.isSelected
      ? theme?.palette.primary.main ?? "#0F1E36"
      : state.isFocused
      ? theme?.palette.background.default ?? "#F4F6F9"
      : theme?.palette.background.paper ?? "#FFFFFF",
    color: state.isSelected
      ? theme?.palette.primary.contrastText ?? "#FFFFFF"
      : theme?.palette.text.primary ?? "#0F172A",

    ":active": {
      backgroundColor: state.isSelected
        ? theme?.palette.primary.main ?? "#0F1E36"
        : theme?.palette.action.selected ?? "rgba(15, 30, 54, 0.08)",
    },
  }),
});