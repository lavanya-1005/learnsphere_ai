import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
      dark: "#1e3a8a",
      light: "#dbeafe",
    },
    secondary: {
      main: "#0f766e",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
  },

  typography: {
    fontFamily:
      '"Inter", "Segoe UI", Arial, sans-serif',

    h1: {
      fontWeight: 900,
    },

    h2: {
      fontWeight: 900,
    },

    h3: {
      fontWeight: 900,
    },

    h4: {
      fontWeight: 800,
    },

    h5: {
      fontWeight: 800,
    },

    h6: {
      fontWeight: 800,
    },

    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 8,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        },
      },
    },
  },
});

export default theme;