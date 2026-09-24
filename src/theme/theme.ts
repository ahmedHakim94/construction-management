import { createTheme } from "@mui/material/styles";

export const BRAND_COLORS = {
  primary: {
    main: "#244A64",
    light: "#356783",
    dark: "#19364A",
    contrastText: "#FFFFFF",
  },

  secondary: {
    main: "#287F78",
    light: "#EAF6F4",
    dark: "#1F625D",
  },
  success: {
    main: "#059669",
    light: "#ECFDF5",
    dark: "#047857",
    contrastText: "#FFFFFF",
  },
  error: {
    main: "#E11D48",
    light: "#FFF1F2",
    dark: "#BE123C",
    contrastText: "#FFFFFF",
  },
  warning: {
    main: "#D97706",
    light: "#FFFBEB",
    dark: "#B45309",
    contrastText: "#FFFFFF",
  },
  info: {
    main: "#0284C7",
    light: "#F0F9FF",
    dark: "#0369A1",
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#F4F6F9",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#0F172A",
    secondary: "#64748B",
    disabled: "#94A3B8",
  },
  divider: "#E2E8F0",
  inputBorder: "#CBD5E1",
};

export const BRAND_FONTS = {
  arabic:
    '"IBM Plex Sans Arabic", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  english:
    '"IBM Plex Sans", "IBM Plex Sans Arabic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export const getTheme = (direction: "rtl" | "ltr") => {
  const isArabic = direction === "rtl";
  const fontFamily = isArabic ? BRAND_FONTS.arabic : BRAND_FONTS.english;
  const p = BRAND_COLORS;

  return createTheme({
    direction,

    palette: {
      primary: p.primary,
      secondary: p.secondary,
      success: p.success,
      error: p.error,
      warning: p.warning,
      info: p.info,
      background: p.background,
      text: p.text,
      divider: p.divider,
      action: {
        hover: "rgba(15, 30, 54, 0.04)",
        selected: "rgba(15, 30, 54, 0.08)",
        disabledBackground: "rgba(15, 23, 42, 0.12)",
        disabled: p.text.disabled,
        focus: "rgba(13, 148, 136, 0.12)",
      },
    },

    shape: {
      borderRadius: 12,
    },

    typography: {
      fontFamily,
      h1: { fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontWeight: 700, letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, letterSpacing: "-0.02em" },
      h4: { fontWeight: 700, letterSpacing: "-0.01em" },
      h5: { fontWeight: 700, letterSpacing: "-0.01em" },
      h6: { fontWeight: 600, letterSpacing: "-0.01em" },
      subtitle1: { fontWeight: 600, fontSize: "1rem" },
      subtitle2: { fontWeight: 500, fontSize: "0.875rem" },
      body1: { fontWeight: 400, fontSize: "0.9375rem", lineHeight: 1.5 },
      body2: { fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.5 },
      button: {
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.875rem",
      },
      caption: {
        fontWeight: 500,
        fontSize: "0.75rem",
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": {
            "--color-primary": p.primary.main,
            "--color-primary-light": p.primary.light,
            "--color-primary-dark": p.primary.dark,
            "--color-secondary": p.secondary.main,
            "--color-secondary-dark": p.secondary.dark,
            "--color-background": p.background.default,
            "--color-surface": p.background.paper,
            "--color-border": p.divider,
            "--color-text": p.text.primary,
            "--color-muted": p.text.secondary,
            "--font-family": fontFamily,
          },
          body: {
            margin: 0,
            backgroundColor: p.background.default,
            color: p.text.primary,
            fontFamily,
          },
          "*, *::before, *::after": {
            boxSizing: "border-box",
          },
          ".tabular-nums": {
            fontVariantNumeric: "tabular-nums",
          },
        },
      },

      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: p.background.paper,
            border: `1px solid ${p.divider}`,
            boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.05)",
            overflow: "hidden",
          },
        },
      },

      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
            minHeight: 42,
            textTransform: "none",
            fontWeight: 600,
            padding: "8px 16px",
            transition: "all 0.15s ease-in-out",
          },
          containedPrimary: {
            backgroundColor: p.primary.main,
            color: p.primary.contrastText,
            "&:hover": {
              backgroundColor: p.primary.light,
            },
            "&:active": {
              backgroundColor: p.primary.dark,
            },
          },
          containedSecondary: {
            backgroundColor: p.secondary.main,
            color: p.primary.contrastText,
            "&:hover": {
              backgroundColor: p.secondary.dark,
            },
          },
          outlined: {
            borderColor: p.inputBorder,
            color: p.text.primary,
            "&:hover": {
              borderColor: p.text.disabled,
              backgroundColor: "rgba(15, 30, 54, 0.04)",
            },
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          fullWidth: true,
          variant: "outlined",
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            minHeight: 44,
            backgroundColor: p.background.paper,
            "& fieldset": {
              borderColor: p.inputBorder,
              borderWidth: 1,
              transition: "border-color 0.15s ease-in-out",
            },
            "&:hover fieldset": {
              borderColor: p.text.disabled,
            },
            "&.Mui-focused fieldset": {
              borderColor: p.primary.main,
              borderWidth: 1.5,
            },
            "&.Mui-error fieldset": {
              borderColor: p.error.main,
            },
          },
          input: {
            padding: "10px 14px",
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            border: `1px solid ${p.divider}`,
            boxShadow:
              "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)",
            overflow: "hidden",
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: "1.125rem",
            color: p.text.primary,
            padding: "16px 24px",
            borderBottom: `1px solid ${p.divider}`,
          },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "14px 24px",
            borderTop: `1px solid ${p.divider}`,
            backgroundColor: p.background.default,
            gap: 8,
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "0.8125rem",
          },
          colorSuccess: {
            backgroundColor: p.success.light,
            color: p.success.main,
            border: `1px solid ${p.success.main}33`,
          },
          colorError: {
            backgroundColor: p.error.light,
            color: p.error.main,
            border: `1px solid ${p.error.main}33`,
          },
          colorWarning: {
            backgroundColor: p.warning.light,
            color: p.warning.main,
            border: `1px solid ${p.warning.main}33`,
          },
          colorInfo: {
            backgroundColor: p.info.light,
            color: p.info.main,
            border: `1px solid ${p.info.main}33`,
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: p.background.default,
            color: p.text.secondary,
            fontWeight: 600,
            fontSize: "0.8125rem",
            borderBottom: `1px solid ${p.divider}`,
            padding: "12px 16px",
          },
          body: {
            color: p.text.primary,
            fontSize: "0.875rem",
            borderBottom: `1px solid ${p.divider}`,
            padding: "14px 16px",
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: p.background.default,
            },
          },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            backgroundColor: p.divider,
            height: 8,
          },
          bar: {
            borderRadius: 6,
          },
        },
      },
    },
  });
};
