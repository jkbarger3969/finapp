import { createTheme, alpha } from "@mui/material/styles";

// Premium "Deep Space" Palette
const colors = {
    background: "#05050B", // Almost black, hint of blue
    surface: "#0F121E",    // Slightly lighter, rich dark blue
    primary: "#6C5DD3",    // Electric Violet
    secondary: "#00E5FF",  // Electric Cyan
    success: "#00D68F",    // Vibrant Green
    warning: "#FFAB00",    // Amber
    error: "#FF3D71",      // Vibrant Red
    text: {
        primary: "#FFFFFF",
        secondary: "#8F9BB3", // Cool Gray
        disabled: "rgba(255, 255, 255, 0.38)"
    },
    linearGradient: "linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)",
};

export const theme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: colors.background,
            paper: colors.surface,
        },
        primary: {
            main: colors.primary,
            light: "#8F7EE6",
            dark: "#4A3F99",
        },
        secondary: {
            main: colors.secondary,
        },
        error: {
            main: colors.error,
        },
        success: {
            main: colors.success,
        },
        text: {
            primary: colors.text.primary,
            secondary: colors.text.secondary,
        },
        divider: alpha(colors.text.primary, 0.08),
    },
    typography: {
        fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800, letterSpacing: "-0.02em" },
        h2: { fontWeight: 700, letterSpacing: "-0.01em" },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 600, letterSpacing: "0.01em" },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600, textTransform: "uppercase", fontSize: "0.875rem", letterSpacing: "0.05em" },
        button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.02em" },
        caption: { fontSize: "0.75rem", lineHeight: 1.5 },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: `radial-gradient(circle at 10% 20%, ${alpha(colors.primary, 0.05)} 0%, transparent 40%),
                                 radial-gradient(circle at 90% 80%, ${alpha(colors.secondary, 0.05)} 0%, transparent 40%),
                                 ${colors.background}`,
                    backgroundAttachment: "fixed",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    backgroundColor: alpha(colors.surface, 0.6), // Glass base
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${alpha(colors.text.primary, 0.08)}`,
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
                    "&.MuiMenu-paper": {
                        backgroundColor: alpha(colors.surface, 0.9), // Less transparent for menus
                        border: `1px solid ${alpha(colors.text.primary, 0.1)}`,
                    }
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 12px 40px 0 rgba(0, 0, 0, 0.3), 0 0 0 1px ${alpha(colors.secondary, 0.3)}`,
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: "8px 24px",
                    boxShadow: "none",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:active": {
                        transform: "scale(0.98)",
                    },
                },
                containedPrimary: {
                    background: colors.linearGradient,
                    color: "#FFFFFF",
                    border: "none",
                    "&:hover": {
                        boxShadow: `0 0 20px ${alpha(colors.primary, 0.5)}`,
                        background: colors.linearGradient, // Keep gradient
                        filter: "brightness(1.1)",
                    },
                },
                outlined: {
                    borderWidth: 2,
                    borderColor: alpha(colors.text.primary, 0.2),
                    "&:hover": {
                        borderWidth: 2,
                        borderColor: colors.primary,
                        backgroundColor: alpha(colors.primary, 0.08),
                    },
                },
                text: {
                    "&:hover": {
                        backgroundColor: alpha(colors.primary, 0.08),
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha(colors.background, 0.7),
                    backdropFilter: "blur(20px)",
                    borderBottom: `1px solid ${alpha(colors.text.primary, 0.05)}`,
                    backgroundImage: "none",
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: alpha(colors.background, 0.8),
                    backdropFilter: "blur(20px)",
                    borderRight: `1px solid ${alpha(colors.text.primary, 0.05)}`,
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    margin: "8px 12px",
                    padding: "10px 16px",
                    transition: "all 0.2s ease",
                    "&.Mui-selected": {
                        backgroundColor: alpha(colors.primary, 0.15),
                        color: colors.primary,
                        "& .MuiListItemIcon-root": {
                            color: colors.primary,
                        },
                        "&:before": {
                            content: '""',
                            position: "absolute",
                            left: -8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            height: "60%",
                            width: 3,
                            backgroundColor: colors.secondary,
                            borderRadius: "0 4px 4px 0",
                            boxShadow: `0 0 8px ${colors.secondary}`,
                        },
                        "&:hover": {
                            backgroundColor: alpha(colors.primary, 0.25),
                        },
                    },
                    "&:hover": {
                        backgroundColor: alpha(colors.text.primary, 0.05),
                        transform: "translateX(4px)",
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: 40,
                    color: colors.text.secondary,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 12,
                        backgroundColor: alpha(colors.surface, 0.4),
                        transition: "all 0.2s",
                        "& fieldset": {
                            borderColor: alpha(colors.text.primary, 0.1),
                        },
                        "&:hover fieldset": {
                            borderColor: alpha(colors.text.primary, 0.3),
                        },
                        "&.Mui-focused": {
                            backgroundColor: alpha(colors.surface, 0.8),
                            "& fieldset": {
                                borderColor: colors.primary,
                            },
                        },
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 24,
                    backgroundImage: "none",
                    backgroundColor: alpha(colors.surface, 0.95), // More opaque for dialogs
                    border: `1px solid ${alpha(colors.text.primary, 0.1)}`,
                    boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
                },
            },
        },
    },
});
