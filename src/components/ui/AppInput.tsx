import { TextField, type TextFieldProps } from "@mui/material";
import { useTranslation } from "react-i18next";

export function AppInput({
  label,
  required,
  ...props
}: TextFieldProps) {
  const { i18n } = useTranslation();

  const isArabic = i18n.language === "ar";

  const finalLabel =
    typeof label === "string"
      ? required
        ? isArabic
          ? ` * ${label}`
          : `${label} * `
        : label
      : label;

  return (
    <TextField
      // fullWidth
      {...props}
      required={false}
      label={finalLabel}
      sx={{
        ...(props.sx || {}),
      }}
      
    />
  );
}