import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import constructionBg from "@/assets/images/construction-login.png";

import { LoginForm } from "../components/LoginForm";

import "../styles/login.scss";
import BoxOverLayer from "../components/BoxOverLayer";

export function LoginPage() {
  const { t, i18n } = useTranslation("auth");

  const isArabic = i18n.language === "ar";

  const changeLanguage = (language: "ar" | "en") => {
    i18n.changeLanguage(language);
  };

  return (
    <Box
      className={`login-page ${isArabic ? "login-page--rtl" : "login-page--ltr"}`}
    >
     <Box className="login-page__content">
        <Box className="login-page__card">
          <LoginForm />

          {/* <Typography className="login-page__copyright">
            {t("copyright", {
              year: new Date().getFullYear(),
            })}
          </Typography> */}
        </Box>
      </Box>
      <Box
        className="login-page__branding"
        sx={{
          backgroundImage: `url(${constructionBg})`,
        }}
      >
        <BoxOverLayer/>
        
      </Box>
      
    </Box>
  );
}
