import { useState } from "react";
import {
  IconButton,
  InputAdornment,
  type TextFieldProps,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AppInput } from "./AppInput";

export function AppPasswordInput(props: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AppInput
      {...props}
      type={showPassword ? "text" : "password"}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}