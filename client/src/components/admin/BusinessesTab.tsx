import { useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Search as SearchIcon,
    Business as BusinessIcon,
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

export const BusinessesTab = () => {
    const { isOnline } = useOnlineStatus();
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredBusinesses = (data?.businesses || []).filter((business: Business) =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedBusinesses = [...filteredBusinesses].sort((a: Business, b: Business) =>
        a.name.localeCompare(b.name)
    );

    if (error) {
        return <Alert severity="error">Failed to load businesses: {error.message}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                    <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Business Management
                </Typography>
                <TextField
                    size="small"
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 250 }}
                />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Hidden businesses will not appear in dropdown menus when creating transactions, 
                but historical data using these businesses will remain intact.
            </Typography>

            {fetching && !data ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedBusinesses.map((business: Business) => (
                                <TableRow
                                    key={business.id}
                                    sx={{
                                        opacity: business.hidden ? 0.6 : 1,
                                    }}
                                >
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                textDecoration: business.hidden ? 'line-through' : 'none',
                                                color: business.hidden ? 'text.secondary' : 'text.primary',
                                            }}
                                        >
                                            {business.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {business.hidden ? (
                                            <Chip label="Hidden" size="small" color="default" />
                                        ) : (
                                            <Chip label="Visible" size="small" color="primary" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
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
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sortedBusinesses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        <Typography color="text.secondary" sx={{ py: 2 }}>
                                            {searchTerm ? 'No businesses match your search' : 'No businesses found'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
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
