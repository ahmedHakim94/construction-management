import { InputAdornment } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";

import { AppInput } from "./AppInput";

interface AppSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    fullWidth?: boolean;
    size?: "small" | "medium";
}

export function AppSearchInput({
    value,
    onChange,
    placeholder,
    size = "small",
    disabled = false,
    autoFocus = false,
    fullWidth = false,
}: AppSearchInputProps) {
    return (
        <AppInput
            size={size}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchOutlined fontSize="small" />
                        </InputAdornment>
                    ),
                },
            }}
            sx={{
                minWidth: {
                    xs: "100%",
                    sm: 260,
                },
            }}
            disabled={disabled}
            autoFocus={autoFocus}
            fullWidth={fullWidth}
        />
    );
}