import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import {
  AssessmentOutlined,
  BusinessOutlined,
  ConstructionOutlined,
  GroupsOutlined,
  LanguageOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

function BoxOverLayer() {
  const { t } = useTranslation("auth");

  return (
    <>
      <Box className="login-page__branding-overlay" />

      <Stack className="login-page__branding-content">
        {/* Logo + Title */}
        <Stack className="login-page__brand">
          <Box className="login-page__brand-icon">
            <ConstructionOutlined />
          </Box>

          <Typography className="login-page__brand-title">
            {t("loginTitle")}
          </Typography>

          <Typography className="login-page__brand-subtitle">
            {t("loginSubtitle")}
          </Typography>

          <Box className="login-page__brand-divider" />
        </Stack>

        {/* Features */}
        <Box className="login-page__features">
          <Stack className="login-page__feature">
            <Box className="login-page__feature-icon">
              <GroupsOutlined />
            </Box>

            <Typography className="login-page__feature-title">
              {t("featureContractors")}
            </Typography>
          </Stack>

          <Stack className="login-page__feature">
            <Box className="login-page__feature-icon">
              <ConstructionOutlined />
            </Box>

            <Typography className="login-page__feature-title">
              {t("featureEquipment")}
            </Typography>
          </Stack>

          <Stack className="login-page__feature">
            <Box className="login-page__feature-icon">
              <BusinessOutlined />
            </Box>

            <Typography className="login-page__feature-title">
              {t("featureDailyWork")}
            </Typography>
          </Stack>

          <Stack className="login-page__feature">
            <Box className="login-page__feature-icon">
              <AssessmentOutlined />
            </Box>

            <Typography className="login-page__feature-title">
              {t("featureReports")}
            </Typography>
          </Stack>
        </Box>

        {/* Language 
          <Stack className="login-page__language">
            <LanguageOutlined className="login-page__language-icon" />

            <button
              type="button"
              className={`login-page__language-button ${
                isArabic ? "active" : ""
              }`}
              onClick={() => changeLanguage("ar")}
            >
              العربية
            </button>

            <span className="login-page__language-separator">|</span>

            <button
              type="button"
              className={`login-page__language-button ${
                !isArabic ? "active" : ""
              }`}
              onClick={() => changeLanguage("en")}
            >
              EN
            </button>
          </Stack>*/}
      </Stack>
    </>
  );
}

export default BoxOverLayer;
