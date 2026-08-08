import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import ClearIcon from "@mui/icons-material/Clear";

interface AppDatePickerProps {
  label?: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  disabled?: boolean;
  format?: string;
  clearable?: boolean;
}

export function AppDatePicker({
  label,
  value,
  onChange,
  disabled,
  format = "DD/MM/YYYY",
  clearable=true
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
            // fullWidth: true,
          },
          field: {
            clearable,
          },
        }}
        
        
      />
    </LocalizationProvider>
  );
}