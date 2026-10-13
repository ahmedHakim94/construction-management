import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppCard, AppPageHeader } from "@/components/ui";

export function AttendancePage() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <AppPageHeader
        title={t("attendance")}
        description={t("attendanceDescription")}
      />
      <Box sx={{ mt: 3 }}>
        <AppCard sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {t("comingSoon")}
          </Typography>
        </AppCard>
      </Box>
    </PageContainer>
  );
}
