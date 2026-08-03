import { Drawer, type DrawerProps } from "@mui/material";

export function AppDrawer({ children, ...props }: DrawerProps) {
  return <Drawer {...props}>{children}</Drawer>;
}
