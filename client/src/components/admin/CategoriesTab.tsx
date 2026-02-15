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
} from '@mui/icons-material';
import { useQuery, useMutation, gql } from 'urql';
import { useOnlineStatus } from '../../context/OnlineStatusContext';

const CATEGORIES_QUERY = gql`
    query AllCategories {
        categories {
            id
            name
            type
            hidden
            active
        }
    }
`;

const UPDATE_CATEGORY_MUTATION = gql`
    mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
        updateCategory(id: $id, input: $input) {
            category {
                id
                name
                type
                hidden
                active
            }
        }
    }
`;

interface Category {
    id: string;
    name: string;
    type: 'Credit' | 'Debit';
    hidden?: boolean;
    active: boolean;
}

export const CategoriesTab = () => {
    const { isOnline } = useOnlineStatus();
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [{ data, fetching, error }, refetch] = useQuery({
        query: CATEGORIES_QUERY,
        requestPolicy: 'cache-and-network',
    });

    const [, updateCategory] = useMutation(UPDATE_CATEGORY_MUTATION);

    const handleToggleHidden = async (category: Category) => {
        if (!isOnline) {
            setSnackbar({ open: true, message: 'Cannot update while offline', severity: 'error' });
            return;
        }

        const result = await updateCategory({
            id: category.id,
            input: { hidden: !category.hidden },
        });

        if (result.error) {
            setSnackbar({ open: true, message: `Failed to update: ${result.error.message}`, severity: 'error' });
        } else {
            setSnackbar({
                open: true,
                message: `Category "${category.name}" ${category.hidden ? 'shown' : 'hidden'} successfully`,
                severity: 'success',
            });
            refetch({ requestPolicy: 'network-only' });
        }
    };

    const filteredCategories = (data?.categories || []).filter((cat: Category) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedCategories = [...filteredCategories].sort((a: Category, b: Category) =>
        a.name.localeCompare(b.name)
    );

    if (error) {
        return <Alert severity="error">Failed to load categories: {error.message}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Category Management</Typography>
                <TextField
                    size="small"
                    placeholder="Search categories..."
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
                Hidden categories will not appear in dropdown menus when creating transactions, 
                but historical data using these categories will remain intact.
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
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedCategories.map((category: Category) => (
                                <TableRow
                                    key={category.id}
                                    sx={{
                                        opacity: category.hidden ? 0.6 : 1,
                                        textDecoration: category.hidden ? 'line-through' : 'none',
                                    }}
                                >
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                textDecoration: category.hidden ? 'line-through' : 'none',
                                                color: category.hidden ? 'text.secondary' : 'text.primary',
                                            }}
                                        >
                                            {category.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={category.type === 'Credit' ? 'Income' : 'Expense'}
                                            color={category.type === 'Credit' ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {category.hidden ? (
                                            <Chip label="Hidden" size="small" color="default" />
                                        ) : (
                                            <Chip label="Visible" size="small" color="primary" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={category.hidden ? 'Show in dropdowns' : 'Hide from dropdowns'}>
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleToggleHidden(category)}
                                                    disabled={!isOnline}
                                                    color={category.hidden ? 'primary' : 'default'}
                                                >
                                                    {category.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sortedCategories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography color="text.secondary" sx={{ py: 2 }}>
                                            {searchTerm ? 'No categories match your search' : 'No categories found'}
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
