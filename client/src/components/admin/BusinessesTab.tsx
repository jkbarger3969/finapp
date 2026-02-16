import { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Chip,
    CircularProgress,
    Tooltip,
    Alert,
    Snackbar,
    Autocomplete,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Collapse,
    Divider,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Business as BusinessIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, gql } from 'urql';
import { useOnlineStatus } from '../../context/OnlineStatusContext';

const BUSINESSES_QUERY = gql`
    query AllBusinesses {
        businesses {
            id
            name
            hidden
        }
    }
`;

const UPDATE_BUSINESS_MUTATION = gql`
    mutation UpdateBusiness($id: ID!, $input: UpdateBusinessInput!) {
        updateBusiness(id: $id, input: $input) {
            business {
                id
                name
                hidden
            }
        }
    }
`;

interface Business {
    id: string;
    name: string;
    hidden?: boolean;
}

interface GroupedBusinesses {
    [letter: string]: Business[];
}

export const BusinessesTab = () => {
    const { isOnline } = useOnlineStatus();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [{ data, fetching, error }, refetch] = useQuery({
        query: BUSINESSES_QUERY,
        requestPolicy: 'cache-and-network',
    });

    const [, updateBusiness] = useMutation(UPDATE_BUSINESS_MUTATION);

    const handleToggleHidden = async (business: Business) => {
        if (!isOnline) {
            setSnackbar({ open: true, message: 'Cannot update while offline', severity: 'error' });
            return;
        }

        const result = await updateBusiness({
            id: business.id,
            input: { hidden: !business.hidden },
        });

        if (result.error) {
            setSnackbar({ open: true, message: `Failed to update: ${result.error.message}`, severity: 'error' });
        } else {
            setSnackbar({
                open: true,
                message: `"${business.name}" ${business.hidden ? 'shown' : 'hidden'} successfully`,
                severity: 'success',
            });
            refetch({ requestPolicy: 'network-only' });
        }
    };

    const toggleGroup = (letter: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(letter)) {
                newSet.delete(letter);
            } else {
                newSet.add(letter);
            }
            return newSet;
        });
    };

    const { allBusinesses, groupedBusinesses, visibleCount, hiddenCount } = useMemo(() => {
        const businesses: Business[] = data?.businesses || [];
        const sorted = [...businesses].sort((a, b) => a.name.localeCompare(b.name));
        
        const grouped: GroupedBusinesses = {};
        sorted.forEach(business => {
            const letter = business.name.charAt(0).toUpperCase() || '#';
            if (!grouped[letter]) {
                grouped[letter] = [];
            }
            grouped[letter].push(business);
        });

        return {
            allBusinesses: sorted,
            groupedBusinesses: grouped,
            visibleCount: businesses.filter(b => !b.hidden).length,
            hiddenCount: businesses.filter(b => b.hidden).length,
        };
    }, [data]);

    if (error) {
        return <Alert severity="error">Failed to load businesses: {error.message}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Business Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`${visibleCount} visible`} size="small" color="primary" variant="outlined" />
                    {hiddenCount > 0 && <Chip label={`${hiddenCount} hidden`} size="small" color="default" />}
                </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Search for a business to quickly toggle visibility, or browse the alphabetical list below.
            </Typography>

            {/* Quick Search Autocomplete */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Autocomplete
                    options={allBusinesses}
                    getOptionLabel={(option) => option.name}
                    value={selectedBusiness}
                    onChange={(_, newValue) => setSelectedBusiness(newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Businesses"
                            placeholder="Type to search..."
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <>
                                        <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                                        {params.InputProps.startAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    renderOption={(props, option) => (
                        <Box component="li" {...props} sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                <Typography sx={{ textDecoration: option.hidden ? 'line-through' : 'none' }}>
                                    {option.name}
                                </Typography>
                                {option.hidden && <Chip label="Hidden" size="small" color="default" />}
                            </Box>
                            <Tooltip title={option.hidden ? 'Show in dropdowns' : 'Hide from dropdowns'}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleHidden(option);
                                    }}
                                    disabled={!isOnline}
                                    color={option.hidden ? 'primary' : 'default'}
                                >
                                    {option.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    loading={fetching}
                    noOptionsText="No businesses found"
                />
            </Paper>

            {/* Collapsible Alphabetical List */}
            {fetching && !data ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper>
                    <List disablePadding>
                        {Object.keys(groupedBusinesses).sort().map((letter, index) => {
                            const businesses = groupedBusinesses[letter];
                            const isExpanded = expandedGroups.has(letter);
                            const hiddenInGroup = businesses.filter(b => b.hidden).length;

                            return (
                                <Box key={letter}>
                                    {index > 0 && <Divider />}
                                    <ListItem
                                        component="div"
                                        onClick={() => toggleGroup(letter)}
                                        sx={{
                                            bgcolor: 'action.hover',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.selected' },
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    <Typography fontWeight="bold">{letter}</Typography>
                                                    <Chip label={`${businesses.length}`} size="small" variant="outlined" />
                                                    {hiddenInGroup > 0 && (
                                                        <Chip label={`${hiddenInGroup} hidden`} size="small" color="default" />
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    <Collapse in={isExpanded}>
                                        <List disablePadding sx={{ pl: 4 }}>
                                            {businesses.map(business => (
                                                <ListItem
                                                    key={business.id}
                                                    sx={{ opacity: business.hidden ? 0.6 : 1 }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Typography
                                                                sx={{
                                                                    textDecoration: business.hidden ? 'line-through' : 'none',
                                                                    color: business.hidden ? 'text.secondary' : 'text.primary',
                                                                }}
                                                            >
                                                                {business.name}
                                                            </Typography>
                                                        }
                                                    />
                                                    <ListItemSecondaryAction>
                                                        {business.hidden && (
                                                            <Chip label="Hidden" size="small" color="default" sx={{ mr: 1 }} />
                                                        )}
                                                        <Tooltip title={business.hidden ? 'Show in dropdowns' : 'Hide from dropdowns'}>
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleToggleHidden(business)}
                                                                    disabled={!isOnline}
                                                                    color={business.hidden ? 'primary' : 'default'}
                                                                >
                                                                    {business.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                </Box>
                            );
                        })}
                        {Object.keys(groupedBusinesses).length === 0 && (
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                                            No businesses found
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};
