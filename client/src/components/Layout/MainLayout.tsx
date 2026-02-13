import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EntryFormDialog from "../EntryFormDialog";


import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { useThemeMode } from "../../context/ThemeModeContext";
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Divider,
    IconButton,
    ListItemIcon,
    useTheme,
    Avatar,
    Menu,
    MenuItem,
    Button,
} from "@mui/material";
import {
    Add as AddIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Menu as MenuIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";



interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isSuperAdmin, isDeptAdmin } = useAuth();
    const { isEntryDialogOpen, openEntryDialog, closeEntryDialog } = useLayout();
    const { mode, toggleTheme } = useThemeMode();
    // const [open, setOpen] = useState(true); // Drawer state no longer needed
    // const [dialogOpen, setDialogOpen] = useState(false); // Moved to context

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const userMenuOpen = Boolean(anchorEl);

    // Function to handle drawer open/close - unused but keeping if needed for mobile future
    // const handleDrawerOpen = () => setOpen(true);
    // const handleDrawerClose = () => setOpen(false);

    const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleUserMenuClose();
        logout();
        navigate('/login');
    };



    const menuItems = [
        { text: "Dashboard", path: "/" },
        { text: "Transactions", path: "/transactions" },
        { text: "Budget Allocations", path: "/budget" },
        { text: "Reports", path: "/reporting" },
        ...(isSuperAdmin || isDeptAdmin ? [{ text: "Admin", path: "/admin" }] : []),
    ];

    const drawerWidth = 260; // Define drawer width

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

            {/* Permanent Drawer for Desktop */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Box
                    sx={{
                        width: drawerWidth,
                        height: '100%',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bgcolor: 'background.paper',
                        borderRight: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        zIndex: theme.zIndex.drawer + 2, // Above AppBar backdrop? No, usually side-by-side. 
                    }}
                >
                    {/* Logo Area */}
                    <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography
                            variant="h5"
                            fontWeight={800}
                            sx={{
                                background: theme => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)' : theme.palette.primary.main,
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            FinApp
                        </Typography>
                        <IconButton
                            onClick={toggleTheme}
                            size="small"
                            data-tooltip={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            data-tooltip-pos="right"
                            sx={{
                                color: 'text.primary',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                }
                            }}
                        >
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Box>

                    {/* New Entry Button - Prominent in Sidebar */}
                    <Box sx={{ px: 3, mb: 4 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={openEntryDialog}
                            data-tooltip="Create a new financial entry"
                            data-tooltip-pos="right"
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)',
                                boxShadow: '0 4px 14px 0 rgba(108, 93, 211, 0.3)',
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            New Entry
                        </Button>
                    </Box>

                    {/* Navigation Items */}
                    <Box sx={{ px: 2, flex: 1 }}>
                        <Typography
                            variant="overline"
                            align="center"
                            sx={{
                                display: 'block',
                                mb: 2,
                                mt: 1,
                                color: 'text.secondary',
                                fontWeight: 800,
                                letterSpacing: '0.2em',
                                fontSize: '0.75rem',
                                userSelect: 'none',
                                cursor: 'default',
                            }}
                        >
                            MENU
                        </Typography>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <Box
                                    key={item.text}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        px: 2,
                                        py: 1.5,
                                        mb: 0.5,
                                        cursor: 'pointer',
                                        borderRadius: 2,
                                        borderLeft: '3px solid transparent',
                                        color: isActive ? 'text.primary' : 'text.secondary',
                                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.text.primary, 0.05),
                                            color: 'text.primary',
                                            borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                                            paddingLeft: '13px',
                                        },
                                        fontWeight: isActive ? 600 : 500,
                                    }}
                                >
                                    <Typography variant="body2">{item.text}</Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    {/* User Profile Mini - Bottom */}
                    <Box sx={{
                        p: 2,
                        borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                    }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                    border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                                }
                            }}
                            onClick={handleUserMenuClick}
                            data-tooltip="Account settings and profile"
                            data-tooltip-pos="right"
                        >
                            <Avatar
                                src={user?.picture}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: 'primary.main',
                                    border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                                }}
                            >
                                {user?.name?.charAt(0)}
                            </Avatar>
                            <Box sx={{ overflow: 'hidden', flex: 1 }}>
                                <Typography variant="subtitle2" noWrap fontWeight={600}>{user?.name}</Typography>
                                <Typography
                                    variant="caption"
                                    noWrap
                                    sx={{
                                        display: 'block',
                                        color: 'primary.main',
                                        fontWeight: 500,
                                    }}
                                >
                                    View Profile
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 7, // Reduced from 8 - header is now simpler without user button
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


            <Menu
                anchorEl={anchorEl}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                onClick={handleUserMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem disabled sx={{ opacity: 1 }}>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                    </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { navigate('/admin'); }}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    Sign Out
                </MenuItem>
            </Menu>
        </Box>
    );
}
