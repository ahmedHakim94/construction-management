import { useState } from "react";

export function useDialog(initial = false) {
  const [open, setOpen] = useState(initial);

  return {
    open,
    openDialog: () => setOpen(true),
    closeDialog: () => setOpen(false),
    setOpen,
  };
}