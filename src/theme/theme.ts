import { createTheme } from "@mui/material/styles";

export const getTheme = (direction: "rtl" | "ltr") =>
  createTheme({
    direction,

    palette: {
      primary: {
        main: "#2563EB",
      },
      success: {
        main: "#16A34A",
      },
      error: {
        main: "#DC2626",
      },
      background: {
        default: "#F8FAFC",
        paper: "#FFFFFF",
      },
    },

    shape: {
      borderRadius: 12,
    },

    typography: {
      fontFamily: "Cairo, Roboto, sans-serif",

      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },

    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            minHeight: 44,
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          fullWidth: true,
          variant: "outlined",
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            overflow: "hidden",
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },
    },
  });
