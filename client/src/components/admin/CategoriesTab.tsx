import { useState, useMemo } from 'react';
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
    Tabs,
    Tab,
    Collapse,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Search as SearchIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, gql } from 'urql';
import { useOnlineStatus } from '../../context/OnlineStatusContext';

const CATEGORIES_QUERY = gql`
    query AllCategories {
        categories {
            id
            name
            displayName
            type
            hidden
            active
            accountNumber
            groupName
            sortOrder
        }
    }
`;

const UPDATE_CATEGORY_MUTATION = gql`
    mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
        updateCategory(id: $id, input: $input) {
            category {
                id
                name
                displayName
                type
                hidden
                active
                accountNumber
                groupName
                sortOrder
            }
        }
    }
`;

interface Category {
    id: string;
    name: string;
    displayName: string;
    type: 'CREDIT' | 'DEBIT';
    hidden?: boolean;
    active: boolean;
    accountNumber?: string;
    groupName?: string;
    sortOrder?: number;
}

interface GroupedCategories {
    [groupName: string]: Category[];
}

export const CategoriesTab = () => {
    const { isOnline } = useOnlineStatus();
    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
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
                message: `Category "${category.displayName}" ${category.hidden ? 'shown' : 'hidden'} successfully`,
                severity: 'success',
            });
            refetch({ requestPolicy: 'network-only' });
        }
    };

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupName)) {
                newSet.delete(groupName);
            } else {
                newSet.add(groupName);
            }
            return newSet;
        });
    };

    const { incomeCategories, expenseCategories, groupedIncome, groupedExpense } = useMemo(() => {
        const allCategories: Category[] = data?.categories || [];
        
        const filteredCategories = allCategories.filter((cat: Category) =>
            cat.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.accountNumber?.includes(searchTerm)
        );

        const income = filteredCategories.filter(c => c.type === 'CREDIT');
        const expense = filteredCategories.filter(c => c.type === 'DEBIT');

        const groupCategories = (cats: Category[]): GroupedCategories => {
            const grouped: GroupedCategories = {};
            const ungrouped: Category[] = [];
            
            // First, identify all group names that have subcategories
            const groupNamesWithChildren = new Set<string>();
            cats.forEach(cat => {
                if (cat.groupName && cat.name !== cat.groupName && cat.displayName !== cat.groupName) {
                    groupNamesWithChildren.add(cat.groupName);
                }
            });

            cats.forEach(cat => {
                if (cat.groupName) {
                    // Check if this is a parent category (name matches groupName)
                    // e.g., "Supplies" with groupName "Supplies"
                    const isParentCategory = cat.name === cat.groupName || cat.displayName === cat.groupName;
                    
                    if (!grouped[cat.groupName]) {
                        grouped[cat.groupName] = [];
                    }
                    
                    // Only add subcategories to the group list (not parent categories)
                    if (!isParentCategory) {
                        grouped[cat.groupName].push(cat);
                    }
                } else {
                    // Check if this category's name matches any group name with children
                    // If so, it's a parent category that should be excluded from ungrouped
                    const isParentWithoutGroupName = groupNamesWithChildren.has(cat.name) || 
                                                      groupNamesWithChildren.has(cat.displayName || '');
                    
                    if (!isParentWithoutGroupName) {
                        ungrouped.push(cat);
                    }
                }
            });

            Object.keys(grouped).forEach(key => {
                grouped[key].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            });

            if (ungrouped.length > 0) {
                grouped['_ungrouped'] = ungrouped.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            }

            return grouped;
        };

        return {
            incomeCategories: income.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
            expenseCategories: expense.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
            groupedIncome: groupCategories(income),
            groupedExpense: groupCategories(expense),
        };
    }, [data, searchTerm]);

    const renderCategoryRow = (category: Category) => (
        <TableRow
            key={category.id}
            sx={{
                opacity: category.hidden ? 0.6 : 1,
                '&:hover': { bgcolor: 'action.hover' },
            }}
        >
            <TableCell sx={{ pl: category.groupName ? 6 : 2 }}>
                <Typography
                    sx={{
                        textDecoration: category.hidden ? 'line-through' : 'none',
                        color: category.hidden ? 'text.secondary' : 'text.primary',
                    }}
                >
                    {category.groupName ? category.name : category.displayName}
                </Typography>
            </TableCell>
            <TableCell>
                <Typography variant="body2" color="text.secondary">
                    {category.accountNumber || '-'}
                </Typography>
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
                            color={category.hidden ? 'default' : 'success'}
                        >
                            {category.hidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                    </span>
                </Tooltip>
            </TableCell>
        </TableRow>
    );

    const renderGroupedTable = (grouped: GroupedCategories) => {
        const sortedGroupNames = Object.keys(grouped).sort((a, b) => {
            if (a === '_ungrouped') return 1;
            if (b === '_ungrouped') return -1;
            return a.localeCompare(b);
        });

        return (
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Account #</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedGroupNames.map(groupName => {
                            const categories = grouped[groupName];
                            const isUngrouped = groupName === '_ungrouped';
                            const isExpanded = isUngrouped || expandedGroups.has(groupName);
                            const hiddenCount = categories.filter(c => c.hidden).length;

                            if (isUngrouped) {
                                return categories.map(cat => renderCategoryRow(cat));
                            }

                            return (
                                <Box component="tbody" key={groupName}>
                                    <TableRow
                                        sx={{
                                            bgcolor: 'action.hover',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.selected' },
                                        }}
                                        onClick={() => toggleGroup(groupName)}
                                    >
                                        <TableCell colSpan={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                <Typography fontWeight="bold">
                                                    {groupName}
                                                </Typography>
                                                <Chip
                                                    label={`${categories.length} items`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {hiddenCount > 0 && (
                                                <Chip
                                                    label={`${hiddenCount} hidden`}
                                                    size="small"
                                                    color="default"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell />
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ p: 0 }}>
                                            <Collapse in={isExpanded}>
                                                <Table size="small">
                                                    <TableBody>
                                                        {categories.map(cat => renderCategoryRow(cat))}
                                                    </TableBody>
                                                </Table>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </Box>
                            );
                        })}
                        {Object.keys(grouped).length === 0 && (
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
        );
    };

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
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{ width: 250 }}
                />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Hidden categories will not appear in dropdown menus when creating transactions, 
                but historical data using these categories will remain intact.
            </Typography>

            <Paper sx={{ mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label={`Income (${incomeCategories.length})`} />
                    <Tab label={`Expense (${expenseCategories.length})`} />
                </Tabs>
            </Paper>

            {fetching && !data ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {tabValue === 0 && renderGroupedTable(groupedIncome)}
                    {tabValue === 1 && renderGroupedTable(groupedExpense)}
                </>
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
