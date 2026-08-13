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
              sx={{ fontWeight: 600, mb: 1 }}
            >
              {label}
            </Typography>
            {isLoading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "text.primary" }}
              >
                {number}
              </Typography>
            )}
          </Box>
          <Avatar sx={style}>
            <Icon sx={{ fontSize: 28 }} />
          </Avatar>
        </Box>
      </AppCard>
    </Box>
  );
}

export default SharedTotalNumber;
