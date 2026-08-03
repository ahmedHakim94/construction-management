import { Button, type ButtonProps } from "@mui/material";

export function AppButton({ children, ...props }: ButtonProps) {
  return <Button {...props}>{children}</Button>;
}
