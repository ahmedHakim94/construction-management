import { Dialog, type DialogProps } from "@mui/material";

export function AppDialog({ children, ...props }: DialogProps) {
  return <Dialog {...props}>{children}</Dialog>;
}
