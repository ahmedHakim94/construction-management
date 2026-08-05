import { TextField, type TextFieldProps } from "@mui/material";
import { useTranslation } from "react-i18next";

export function AppTextarea(props: TextFieldProps) {
  
  return (
    <TextField
      multiline
      minRows={4}
      // fullWidth
      {...props}
    />
  );
}
