import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { useThemeMode } from "../../context/ThemeModeContext";
import Sidebar from "./Sidebar";
import EntryFormDialog from "../EntryFormDialog";

import {
    Box,
    AppBar,
    Toolbar,
    IconButton,
    useTheme,
} from "@mui/material";
import {
    Menu as MenuIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

interface MainLayoutProps {
    children: React.ReactNode;
}

const COLLAPSED_WIDTH = 80;
const EXPANDED_WIDTH = 280;

export default function MainLayout({ children }: MainLayoutProps) {
    const theme = useTheme();
    const { isEntryDialogOpen, openEntryDialog, closeEntryDialog, isSidebarCollapsed } = useLayout();
    const { mode, toggleTheme } = useThemeMode(); // Also unused? Toggle is in sidebar.
    // Wait, MainLayout doesn't toggle theme anymore.

    // Check if mode/toggleTheme is used in MainLayout?
    // Not in AppBar. AppBar is simplified.
    // So remove ThemeModeContext too?

    const drawerWidth = isSidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Top App Bar - Simplified */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    zIndex: theme.zIndex.drawer + 1,
                    backdropFilter: "blur(20px)",
                    backgroundColor: alpha(theme.palette.background.default, 0.8),
                    borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                    boxShadow: 'none',
                    transition: "width 0.3s ease, margin 0.3s ease",
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    {/* Mobile Menu Button - Only visible on small screens */}
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={() => { }} // Placeholder for mobile drawer toggle
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 7,
                    transition: "width 0.3s ease",
                }}
            >
                <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
                    {children}
                </Box>
            </Box>

            <EntryFormDialog
                open={isEntryDialogOpen}
                onClose={closeEntryDialog}
                onSuccess={() => {
                    closeEntryDialog();
                    window.location.reload();
                }}
            />
        </Box>
    );
}
