import {
  Button,
  CircularProgress,
  type ButtonProps,
} from "@mui/material";

interface AppButtonProps extends ButtonProps {
  loading?: boolean;
}

export function AppButton({
  loading = false,
  disabled,
  children,
  startIcon,
  endIcon,
  ...props
}: AppButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
    >
      {loading ? <CircularProgress size={18} color="inherit" /> : children}
    </Button>
  );
}