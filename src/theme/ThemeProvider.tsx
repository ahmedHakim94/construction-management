import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getTheme } from "./theme";
import { rtlCache } from "./rtlCache";

interface Props {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: Props) {
  const { i18n } = useTranslation();

  const isArabic = i18n.language === "ar";

  const direction = isArabic ? "rtl" : "ltr";

  const theme = useMemo(() => getTheme(direction), [direction]);

  const content = (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div dir={direction}>
        {children}
      </div>
    </ThemeProvider>
  );

  if (isArabic) {
    return (
      <CacheProvider value={rtlCache}>
        {content}
      </CacheProvider>
    );
  }

  return content;
}