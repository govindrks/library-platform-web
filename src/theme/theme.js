import { createTheme } from "@mui/material/styles";
import colors from "./colors";
import typography from "./typography";

const theme = createTheme({
    palette: {
        mode: "light",

        primary: colors.primary,
        secondary: colors.secondary,

        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,

        background: colors.background,

        text: colors.text,

        divider: colors.divider,
    },

    typography,

    shape: {
        borderRadius: 10,
    },

    spacing: 8,

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    margin: 0,
                    backgroundColor: colors.background.default,
                },

                "*": {
                    boxSizing: "border-box",
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    border: `1px solid ${colors.border}`,
                    borderRadius: 14,
                    boxShadow: "none",
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
            },
        },

        MuiButton: {
            styleOverrides: {
                root: {
                    minHeight: 40,
                    borderRadius: 8,
                    textTransform: "none",
                    fontWeight: 600,
                },
            },
        },

        MuiTextField: {
            defaultProps: {
                size: "small",
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 7,
                    fontWeight: 600,
                },
            },
        },

        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    color: colors.text.secondary,
                    backgroundColor: "#F8FAFC",
                },
            },
        },

        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 14,
                },
            },
        },
    },
});

export default theme;