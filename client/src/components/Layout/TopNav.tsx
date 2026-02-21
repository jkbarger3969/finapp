import {
    Box,
    Typography,
    IconButton,
    Button,
    Avatar,
    Tooltip,
    useTheme,
    Menu,
    MenuItem,
    Divider,
    Stack,
    ListItemIcon
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    Add as AddIcon,
    PersonAdd as PersonAddIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
    Dashboard as DashboardIcon,
    Receipt as ReceiptIcon,
    PieChart as PieChartIcon,
    Assessment as AssessmentIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { useThemeMode } from "../../context/ThemeModeContext";
import InviteUserDialog from "../InviteUserDialog";

export default function TopNav() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isSuperAdmin } = useAuth();
    const { openEntryDialog } = useLayout();
    const { mode, toggleTheme } = useThemeMode();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
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

    const menuItems = [
        { text: "Dashboard", path: "/", icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
        { text: "Transactions", path: "/transactions", icon: <ReceiptIcon sx={{ fontSize: 20 }} /> },
        { text: "Budget", path: "/budget", icon: <PieChartIcon sx={{ fontSize: 20 }} /> },
        { text: "Reports", path: "/reporting", icon: <AssessmentIcon sx={{ fontSize: 20 }} /> },
        ...(isSuperAdmin ? [{ text: "Admin", path: "/admin", icon: <AdminPanelSettingsIcon sx={{ fontSize: 20 }} /> }] : []),
    ];

    return (
        <Box
            component="nav"
            sx={{
                width: '100%',
                height: 64,
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: theme.zIndex.appBar,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(20px)",
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                px: 3,
                justifyContent: 'space-between'
            }}
        >
            {/* Left: Logo & Navigation */}
            <Stack direction="row" spacing={4} alignItems="center">
                {/* Logo */}
                <Typography
                    variant="h6"
                    fontWeight={800}
                    onClick={() => navigate('/')}
                    sx={{
                        background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)' : theme.palette.primary.main,
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        cursor: 'pointer',
                        letterSpacing: '-0.5px'
                    }}
                >
                    FinApp
                </Typography>

                {/* Navigation Links */}
                <Stack direction="row" spacing={1}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Button
                                key={item.text}
                                startIcon={item.icon}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    color: isActive ? 'text.primary' : 'text.secondary',
                                    fontWeight: isActive ? 700 : 500,
                                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                    borderRadius: 2,
                                    px: 2,
                                    py: 0.75,
                                    textTransform: 'none',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.text.primary, 0.05),
                                        color: 'text.primary',
                                    }
                                }}
                            >
                                {item.text}
                            </Button>
                        );
                    })}
                </Stack>
            </Stack>

            {/* Right: Actions, Theme, User */}
            <Stack direction="row" spacing={2} alignItems="center">
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openEntryDialog}
                    sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)',
                        boxShadow: '0 4px 14px 0 rgba(108, 93, 211, 0.3)',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3
                    }}
                >
                    New Entry
                </Button>

                {(user as any)?.canInviteUsers && (
                    <Button
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        onClick={() => setInviteDialogOpen(true)}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2
                        }}
                    >
                        Invite User
                    </Button>
                )}

                <Divider orientation="vertical" flexItem sx={{ my: 'auto', height: 24 }} />

                <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }}>
                    {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>

                <Tooltip title="Profile">
                    <Avatar
                        src={user?.picture}
                        onClick={handleUserMenuClick}
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'primary.main',
                            cursor: 'pointer',
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                    >
                        {user?.name?.charAt(0)}
                    </Avatar>
                </Tooltip>
            </Stack>

            {/* User Menu */}
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
                        minWidth: 200,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
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

            {(user as any)?.canInviteUsers && (
                <InviteUserDialog
                    open={inviteDialogOpen}
                    onClose={() => setInviteDialogOpen(false)}
                    onSuccess={() => setInviteDialogOpen(false)}
                />
            )}
        </Box>
    );
}
