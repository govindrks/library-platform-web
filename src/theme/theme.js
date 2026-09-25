import { createTheme } from "@mui/material/styles";
import colors from "./colors";
import typography from "./typography";

const theme = createTheme({
    palette: {
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,

        background: colors.background,

        text: colors.text,
    },

    typography,

    shape: {
        borderRadius: 10,
    },

    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    border: `1px solid ${colors.border}`,
                    boxShadow: "none",
                    borderRadius: 14,
                },
            },
        },

        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: "none",
                },
            },
        },

        MuiTextField: {
            defaultProps: {
                size: "small",
            },
        },
    },
});

export default theme;