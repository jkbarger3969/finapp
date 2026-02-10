import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within ThemeModeProvider');
    }
    return context;
};

const createAppTheme = (mode: ThemeMode) => {
    const isDark = mode === 'dark';

    // Midnight Aurora colors for dark mode
    const darkColors = {
        background: "#07090c",
        surface: "#171f2e",
        surfaceElevated: "#1e293b",
        primary: "#10b981",
        primaryLight: "#34d399",
        primaryDark: "#059669",
        secondary: "#3b82f6",
        accent: "#10b981",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#f43f5e",
        info: "#3b82f6",
        text: {
            primary: "#f1f5f9",
            secondary: "#94a3b8",
            tertiary: "#64748b",
            disabled: "#475569",
        },
        glass: {
            bg: "rgba(255, 255, 255, 0.03)",
            border: "rgba(255, 255, 255, 0.08)",
            borderStrong: "rgba(255, 255, 255, 0.2)",
        },
        linearGradient: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
        bgGradient: "radial-gradient(circle at 50% 0%, #111827 0%, #07090c 100%)",
    };

    // Light mode colors
    const lightColors = {
        background: "#f8fafc",
        surface: "#ffffff",
        surfaceElevated: "#ffffff",
        primary: "#10b981",
        primaryLight: "#34d399",
        primaryDark: "#059669",
        secondary: "#3b82f6",
        accent: "#10b981",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#f43f5e",
        info: "#3b82f6",
        text: {
            primary: "#0f172a",
            secondary: "#475569",
            tertiary: "#64748b",
            disabled: "#94a3b8",
        },
        glass: {
            bg: "rgba(255, 255, 255, 0.8)",
            border: "rgba(0, 0, 0, 0.08)",
            borderStrong: "rgba(0, 0, 0, 0.15)",
        },
        linearGradient: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
        bgGradient: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    };

    const colors = isDark ? darkColors : lightColors;

    return createTheme({
        palette: {
            mode,
            background: {
                default: colors.background,
                paper: colors.surface,
            },
            primary: {
                main: colors.primary,
                light: colors.primaryLight,
                dark: colors.primaryDark,
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
            warning: {
                main: colors.warning,
            },
            info: {
                main: colors.info,
            },
            text: {
                primary: colors.text.primary,
                secondary: colors.text.secondary,
            },
            divider: colors.glass.border,
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
                        background: colors.bgGradient,
                        backgroundAttachment: "fixed",
                    },
                    '& :focus-visible': {
                        outline: `3px solid ${alpha(colors.primary, 0.5)}`,
                        outlineOffset: '2px',
                    },
                    '*::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '*::-webkit-scrollbar-track': {
                        background: alpha(colors.surface, 0.1),
                    },
                    '*::-webkit-scrollbar-thumb': {
                        background: alpha(colors.primary, 0.3),
                        borderRadius: '4px',
                        '&:hover': {
                            background: alpha(colors.primary, 0.5),
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none",
                        backgroundColor: alpha(colors.surfaceElevated, isDark ? 0.6 : 0.9),
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: `1px solid ${colors.glass.border}`,
                        boxShadow: isDark ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)" : "0 2px 8px 0 rgba(0, 0, 0, 0.1)",
                        "&.MuiMenu-paper": {
                            backgroundColor: alpha(colors.surfaceElevated, 0.95),
                            border: `1px solid ${colors.glass.borderStrong}`,
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
                            boxShadow: isDark
                                ? `0 12px 40px 0 rgba(0, 0, 0, 0.3), 0 0 0 1px ${alpha(colors.secondary, 0.3)}`
                                : `0 12px 40px 0 rgba(0, 0, 0, 0.15)`,
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
                            background: colors.linearGradient,
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
                        backgroundColor: alpha(colors.background, isDark ? 0.7 : 0.9),
                        backdropFilter: "blur(20px)",
                        borderBottom: `1px solid ${alpha(colors.text.primary, 0.05)}`,
                        backgroundImage: "none",
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: alpha(colors.background, isDark ? 0.8 : 0.95),
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
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'scale(1.1)',
                        },
                        '&:active': {
                            transform: 'scale(0.95)',
                        },
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
            MuiSelect: {
                styleOverrides: {
                    root: {
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary,
                            borderWidth: '2px',
                            boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
                        },
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 24,
                        backgroundImage: "none",
                        backgroundColor: alpha(colors.surface, 0.95),
                        border: `1px solid ${alpha(colors.text.primary, 0.1)}`,
                        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
                    },
                },
            },
        },
    });
};

interface ThemeModeProviderProps {
    children: ReactNode;
}

export const ThemeModeProvider = ({ children }: ThemeModeProviderProps) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const stored = localStorage.getItem('theme-mode');
        return (stored as ThemeMode) || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme-mode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const theme = createAppTheme(mode);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
