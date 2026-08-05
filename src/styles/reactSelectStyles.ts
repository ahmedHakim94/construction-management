import type { StylesConfig } from "react-select";
import type { SelectOption } from "@/components/ui/AppSelect";

export const reactSelectStyles = (
  error?: string,
): StylesConfig<SelectOption, false> => ({
  control: (base, state) => ({
    ...base,
    minHeight: 48,
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: "none",

    borderColor: error
      ? "#d32f2f"
      : state.isFocused
      ? "#1976d2"
      : "#D9E2F0",

    "&:hover": {
      borderColor: "#1976d2",
    },
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "2px 12px",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#94A3B8",
  }),

  singleValue: (base) => ({
    ...base,
    color: "#0F172A",
  }),

  menu: (base) => ({
    ...base,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 9999,
  }),

  option: (base, state) => ({
    ...base,
    cursor: "pointer",
    backgroundColor: state.isFocused ? "#EFF6FF" : "#fff",
    color: "#0F172A",

    ":active": {
      backgroundColor: "#DBEAFE",
    },
  }),
});