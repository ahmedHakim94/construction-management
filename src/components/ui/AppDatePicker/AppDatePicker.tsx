import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";

interface AppDatePickerProps {
  label?: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  disabled?: boolean;
  format?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

export function AppDatePicker({
  label,
  value,
  onChange,
  disabled,
  format = "DD/MM/YYYY",
  error,
  helperText,
  fullWidth = false,
}: AppDatePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        format={format}
        slotProps={{
          textField: {
            size: "small",
            error,
            helperText,
            fullWidth: fullWidth ?? true,
          },
        }}
      />
    </LocalizationProvider>
  );
}