import { Card, type CardProps } from "@mui/material";

export function AppCard({ children, sx, ...props }: CardProps) {
  return (
    <Card
      {...props}
      sx={[
        {
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          overflow: "hidden",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Card>
  );
}