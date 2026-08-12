import { Dialog, type DialogProps } from "@mui/material";

export function AppDialog({ children, sx, ...props }: DialogProps) {
  return (
    <Dialog
      sx={{
        "& .MuiDialog-paper": {
          margin: { xs: 2, sm: 4 },
          maxWidth: { xs: "calc(100% - 32px)", sm: "100%" },
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Dialog>
  );
}
