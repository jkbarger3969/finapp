
import { Box, Typography, IconButton, Button, Avatar, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Tooltip, useTheme, Menu, MenuItem, Divider } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    Add as AddIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
    Dashboard as DashboardIcon,
    Receipt as ReceiptIcon,
    PieChart as PieChartIcon,
    Assessment as AssessmentIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { useThemeMode } from "../../context/ThemeModeContext";

const COLLAPSED_WIDTH = 80;
const EXPANDED_WIDTH = 280;

export default function Sidebar() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isSuperAdmin } = useAuth();
    const { isSidebarCollapsed, toggleSidebar, openEntryDialog } = useLayout();
    const { mode, toggleTheme } = useThemeMode();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const userMenuOpen = Boolean(anchorEl);

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
    // Re-check useAuth destructuring in Sidebar
    // const { user, isSuperAdmin, canInviteUsers } = useAuth(); // It misses logout!


    const menuItems = [
        { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
        { text: "Transactions", path: "/transactions", icon: <ReceiptIcon /> },
        { text: "Budget Allocations", path: "/budget", icon: <PieChartIcon /> },
        { text: "Reports", path: "/reporting", icon: <AssessmentIcon /> },
        ...(isSuperAdmin ? [{ text: "Admin", path: "/admin", icon: <AdminPanelSettingsIcon /> }] : []),
    ];

    const drawerWidth = isSidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

    return (
        <Box
            component="nav"
            sx={{
                width: drawerWidth,
                transition: "width 0.3s ease",
                flexShrink: 0,
                position: 'relative', // Ensures it takes space in flex layout
            }}
        >
            <Box
                sx={{
                    width: drawerWidth,
                    height: '100%',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    // Glassmorphism
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    backdropFilter: "blur(20px)",
                    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    zIndex: theme.zIndex.drawer + 2,
                    transition: "width 0.3s ease",
                    boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
                    overflowX: 'hidden', // Hide overflow during transition
                }}
            >
                {/* Logo Area */}
                <Box sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                    minHeight: 80,
                }}>
                    {!isSidebarCollapsed && (
                        <Typography
                            variant="h5"
                            fontWeight={800}
                            sx={{
                                background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)' : theme.palette.primary.main,
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            FinApp
                        </Typography>
                    )}

                    {isSidebarCollapsed && (
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
                        }}>
                            F
                        </Box>
                    )}

                    {!isSidebarCollapsed && (
                        <IconButton onClick={toggleSidebar} size="small">
                            <ChevronLeftIcon />
                        </IconButton>
                    )}
                </Box>

                {/* Collapsed Toggle Button (Floating if collapsed) */}
                {isSidebarCollapsed && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <IconButton onClick={toggleSidebar} size="small">
                            <ChevronRightIcon />
                        </IconButton>
                    </Box>
                )}

                {/* New Entry Button */}
                <Box sx={{ px: isSidebarCollapsed ? 1 : 3, mb: 4, display: 'flex', justifyContent: 'center' }}>
                    {isSidebarCollapsed ? (
                        <Tooltip title="New Entry" placement="right">
                            <IconButton
                                onClick={openEntryDialog}
                                sx={{
                                    background: 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)',
                                    color: 'white',
                                    boxShadow: '0 4px 14px 0 rgba(108, 93, 211, 0.3)',
                                    '&:hover': { background: 'linear-gradient(135deg, #5b4cc4 0%, #00d4ee 100%)' }
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={openEntryDialog}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)',
                                boxShadow: '0 4px 14px 0 rgba(108, 93, 211, 0.3)',
                                textTransform: 'none',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            New Entry
                        </Button>
                    )}
                </Box>

                {/* Navigation Items */}
                <List sx={{ px: 2, flex: 1 }}>
                    {!isSidebarCollapsed && (
                        <Typography
                            variant="overline"
                            sx={{
                                display: 'block',
                                mb: 2,
                                mt: 1,
                                px: 1,
                                color: 'text.secondary',
                                fontWeight: 800,
                                letterSpacing: '0.1em',
                                fontSize: '0.7rem',
                            }}
                        >
                            MENU
                        </Typography>
                    )}
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <Tooltip key={item.text} title={isSidebarCollapsed ? item.text : ""} placement="right">
                                <ListItem disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: 2,
                                            justifyContent: isSidebarCollapsed ? 'center' : 'initial',
                                            px: isSidebarCollapsed ? 1 : 2,
                                            py: 1.5,
                                            color: isActive ? 'text.primary' : 'text.secondary',
                                            bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.text.primary, 0.05),
                                                color: 'text.primary',
                                                transform: 'translateX(4px)',
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: isSidebarCollapsed ? 0 : 2,
                                                justifyContent: 'center',
                                                color: isActive ? 'primary.main' : 'inherit',
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        {!isSidebarCollapsed && (
                                            <ListItemText
                                                primary={item.text}
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    fontWeight: isActive ? 600 : 500
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            </Tooltip>
                        );
                    })}
                </List>

                {/* User Profile / Theme Toggle - Bottom */}
                <Box sx={{
                    p: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: 'flex',
                    flexDirection: isSidebarCollapsed ? 'column' : 'row',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                }}>
                    <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }}>
                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>

                    {!isSidebarCollapsed && <Box sx={{ flex: 1 }} />}

                    <Tooltip title="Profile" placement="right">
                        <Avatar
                            src={user?.picture}
                            onClick={handleUserMenuClick}
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                                border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                                cursor: 'pointer',
                            }}
                        >
                            {user?.name?.charAt(0)}
                        </Avatar>
                    </Tooltip>
                </Box>

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
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
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
        </Box>
    );
}
