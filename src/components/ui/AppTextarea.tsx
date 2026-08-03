import { TextField, type TextFieldProps } from "@mui/material";

export function AppTextarea(props: TextFieldProps) {
  return <TextField multiline minRows={4} fullWidth {...props} />;
}
