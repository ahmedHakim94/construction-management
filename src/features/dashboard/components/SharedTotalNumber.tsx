import { Typography, Skeleton, Box, Avatar } from "@mui/material";
import { AppCard } from "@/components/ui";
import type { SxProps, Theme } from "@mui/material";
import type { SvgIconProps } from "@mui/material/SvgIcon";

function SharedTotalNumber({
  number,
  isLoading,
  label,
  Icon,
  style,
}: {
  number: number;
  isLoading: boolean;
  label: string;
  Icon: React.ComponentType<SvgIconProps>;
  style: SxProps<Theme>;
}) {

  return (
    <Box
      sx={{
        flex: {
          xs: "1 1 100%",
          sm: "1 1 calc(50% - 12px)",
          md: "1 1 calc(33.333% - 16px)",
        },
        minWidth: 280,
      }}
    >
      <AppCard sx={{ p: 3, height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500, mb: 0.75 }}
            >
              {label}
            </Typography>
            {isLoading ? (
              <Skeleton width={80} height={36} />
            ) : (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.01em",
                }}
              >
                {number}
              </Typography>
            )}
          </Box>
          <Avatar sx={style}>
            <Icon sx={{ fontSize: 26 }} />
          </Avatar>
        </Box>
      </AppCard>
    </Box>
  );
}

export default SharedTotalNumber;
