import { Box, FormHelperText } from "@mui/material";
import Select from "react-select";

export interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  options: SelectOption[];

  value?: string;

  onChange?: (value: string) => void;

  placeholder?: string;

  error?: string;
}

export function AppSelect({
  options,
  value,
  onChange,
  placeholder,
  error,
}: AppSelectProps) {
  return (
    <Box sx={{
      width: "100%",
    }}>
      <Select
        options={options}
        value={options.find((x) => x.value === value) ?? null}
        onChange={(option) => onChange?.(option?.value ?? "")}
        placeholder={placeholder}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: 48,
            borderRadius: 12,
            borderColor: error
              ? "#d32f2f"
              : state.isFocused
                ? "#1976d2"
                : "#D9E2F0",
            boxShadow: "none",
            "&:hover": {
              borderColor: "#1976d2",
            },
          }),
        }}
      />

      {error && (
        <FormHelperText error>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}