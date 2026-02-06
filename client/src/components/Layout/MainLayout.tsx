import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EntryFormDialog from "../EntryFormDialog";
import SearchDialog from "../SearchDialog";
import DepartmentSelector from "../DepartmentSelector";
import { useAuth } from "../../context/AuthContext";
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Divider,
    IconButton,
    ListItemIcon,
    useTheme,
    InputBase,
    Avatar,
    Menu,
    MenuItem,
    Button,
} from "@mui/material";
import {
    Search as SearchIcon,
    Add as AddIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";

// Removed drawerWidth as it is no longer needed

// Main component definition moved to bottom

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: 24, // Pill shape
    backgroundColor: alpha(theme.palette.common.white, 0.03),
    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    "&:hover": {
        backgroundColor: alpha(theme.palette.common.white, 0.08),
        boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    transition: "all 0.2s ease-in-out",
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
    },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "250px",
            "&:focus": {
                width: "350px",
            },
        },
    },
}));

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isSuperAdmin, isDeptAdmin } = useAuth();
    // const [open, setOpen] = useState(true); // Drawer state no longer needed
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
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

    // Global keyboard shortcut for search (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const menuItems = [
        { text: "Dashboard", path: "/" },
        { text: "Transactions", path: "/transactions" },
        { text: "Budget", path: "/budget" },
        ...(isSuperAdmin || isDeptAdmin ? [{ text: "Admin", path: "/admin" }] : []),
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    zIndex: theme.zIndex.drawer + 1,
                    backdropFilter: "blur(20px)",
                    backgroundColor: alpha(theme.palette.background.default, 0.8),
                    borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between", py: 0.5 }}>
                    {/* Brand & Navigation */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Typography
                            variant="h5"
                            noWrap
                            component="div"
                            onClick={() => navigate('/')}
                            sx={{
                                cursor: 'pointer',
                                fontWeight: 800,
                                letterSpacing: '-0.02em',
                                background: theme => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)' : theme.palette.primary.main,
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            FinApp
                        </Typography>

                        {/* Top Navigation Links */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                                return (
                                    <Box
                                        key={item.text}
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            position: 'relative',
                                            px: 2,
                                            py: 1,
                                            cursor: 'pointer',
                                            borderRadius: 2,
                                            color: isActive ? 'text.primary' : 'text.secondary',
                                            fontWeight: isActive ? 600 : 500,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                color: 'text.primary',
                                                bgcolor: alpha(theme.palette.text.primary, 0.03),
                                            },
                                        }}
                                    >
                                        {item.text}
                                        {isActive && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 4,
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    width: '20%',
                                                    height: 3,
                                                    borderRadius: 4,
                                                    background: theme.palette.secondary.main,
                                                    boxShadow: `0 0 8px ${theme.palette.secondary.main}`,
                                                }}
                                            />
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* Search, Actions & Profile */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Search onClick={() => setSearchOpen(true)} sx={{ cursor: 'pointer', display: { xs: 'none', md: 'block' } }}>
                            <SearchIconWrapper>
                                <SearchIcon color="action" />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Search... (Cmd+K)"
                                inputProps={{ "aria-label": "search" }}
                                readOnly
                            />
                        </Search>

                        <DepartmentSelector />

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => setDialogOpen(true)}
                            sx={{
                                display: { xs: 'none', sm: 'flex' },
                                fontWeight: 700,
                                borderRadius: 10,
                                px: 3,
                                background: 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)',
                                boxShadow: '0 4px 14px 0 rgba(0, 229, 255, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px 0 rgba(0, 229, 255, 0.5)',
                                },
                                whiteSpace: 'nowrap',
                            }}
                        >
                            New Entry
                        </Button>

                        <IconButton onClick={() => setSearchOpen(true)} sx={{ display: { xs: 'flex', md: 'none' } }}>
                            <SearchIcon />
                        </IconButton>

                        <IconButton
                            onClick={handleUserMenuClick}
                            size="small"
                        >
                            <Avatar
                                src={user?.picture}
                                sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    width: 38,
                                    height: 38,
                                    border: `2px solid ${alpha(theme.palette.background.paper, 0.5)}`
                                }}
                            >
                                {user?.name?.charAt(0) || 'U'}
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu
                        id="user-menu"
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
                </Toolbar>
            </AppBar>

            <Main>
                {/* Removed top toolbar spacer since we are now sticky, not fixed covering content */}
                {children}
            </Main>

            <EntryFormDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSuccess={() => {
                    // Re-fetch data if needed
                    window.location.reload();
                }}
            />

            <SearchDialog
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </Box>
    );
}

// Remove the 'open' prop requirement from Main since we don't need drawer shifting anymore
const Main = styled("main")(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3, 3, 6, 3), // Add more bottom padding
    width: '100%',
    maxWidth: '1600px', // Limit max width for ultra-wide screens
    margin: '0 auto',
}));
