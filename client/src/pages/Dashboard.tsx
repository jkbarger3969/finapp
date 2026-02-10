import { useQuery, useMutation } from "urql";
import { useState, useEffect } from "react";
import { Grid, Paper, Typography, Box, CircularProgress, Alert, Fade, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider, FormControl, InputLabel, Select, TextField } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDepartment } from "../context/DepartmentContext";
import { useLayout } from "../context/LayoutContext";
import EditEntryDialog from "../components/EditEntryDialog";
import EntryFormDialog from "../components/EntryFormDialog";
import PageHeader from "../components/PageHeader";
import SearchDialog from "../components/SearchDialog";

const GET_DASHBOARD_DATA = `
  query GetDashboardData($where: EntriesWhere) {
    entries(where: $where) {
      id
      description
      date
      total
      category {
        name
        type
      }
      department {
        name
      }
    }
  }
`;

const parseRational = (rationalStr: any) => {
    try {
        const r = typeof rationalStr === 'string' ? JSON.parse(rationalStr) : rationalStr;
        return (r.n / r.d) * r.s;
    } catch {
        return 0;
    }
};

const RECONCILE_ENTRIES_MUTATION = `
mutation ReconcileEntries($input: ReconcileEntries!) {
  reconcileEntries(input: $input) {
    reconciledEntries {
      id
      reconciled
    }
  }
}
`;

const DELETE_ENTRY_MUTATION = `
mutation DeleteEntry($id: ID!) {
  deleteEntry(id: $id) {
    id
  }
}
`;

const GET_DEPARTMENTS = `
  query GetDepartments {
    departments {
      id
      name
      parent {
        __typename
        ... on Department {
          id
          name
        }
        ... on Business {
          id
          name
        }
      }
    }
  }
`;

export default function Dashboard() {
    const { departmentId, fiscalYearId, fiscalYears, setFiscalYearId, setSelectedDepartment } = useDepartment();
    const { openEntryDialog } = useLayout();

    // Department selection state
    const [topLevelDeptId, setTopLevelDeptId] = useState<string>('');
    const [subDeptId, setSubDeptId] = useState<string>('');
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);

    // Fetch departments
    const [deptResult] = useQuery({ query: GET_DEPARTMENTS });
    const departments = deptResult.data?.departments || [];
    const topLevelDepartments = departments.filter((d: any) => d.parent?.__typename === 'Business' || !d.parent);
    const subDepartments = topLevelDeptId
        ? departments.filter((d: any) => d.parent?.__typename === 'Department' && d.parent?.id === topLevelDeptId)
        : [];

    // Update context when department selection changes
    useEffect(() => {
        const selectedDept = subDeptId || topLevelDeptId;
        setSelectedDepartment(selectedDept || null);
    }, [topLevelDeptId, subDeptId, setSelectedDepartment]);

    // Global keyboard shortcut for search (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchDialogOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const where: any = { deleted: false };

    if (departmentId) {
        where.department = {
            id: { lte: departmentId },
        };
    }

    if (fiscalYearId) {
        where.fiscalYear = {
            id: { eq: fiscalYearId },
        };
    }

    const [result, reexecuteQuery] = useQuery({
        query: GET_DASHBOARD_DATA,
        variables: { where },
        pause: !fiscalYearId,
    });
    const { data, fetching, error } = result;
    const navigate = useNavigate();

    // Action Menu State
    const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionMenuEntry, setActionMenuEntry] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editEntry, setEditEntry] = useState<any>(null);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [refundEntry, setRefundEntry] = useState<any>(null);

    const [, reconcileEntries] = useMutation(RECONCILE_ENTRIES_MUTATION);
    const [, deleteEntry] = useMutation(DELETE_ENTRY_MUTATION);

    const handleReexecute = () => {
        // Re-execute query to refresh data
        reexecuteQuery({ requestPolicy: 'network-only' });
    };

    const recentEntries = data?.entries
        ? [...data.entries]
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
        : [];


    const stats = {
        totalEntries: data?.entries?.length || 0,
        thisMonth: data?.entries ? data.entries.reduce((sum: number, entry: any) => {
            const amount = parseRational(entry.total);
            return sum + (entry.category?.type === 'CREDIT' ? Math.abs(amount) : -Math.abs(amount));
        }, 0) : 0,
    };

    return (
        <Box>
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your financial activity"
            />

            {/* Department Selector */}
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ minWidth: 80 }}>Department:</Typography>

                {/* Fiscal Year Selector */}
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Fiscal Year</InputLabel>
                    <Select
                        value={fiscalYearId || ''}
                        onChange={(e: SelectChangeEvent) => setFiscalYearId(e.target.value)}
                        label="Fiscal Year"
                    >
                        {fiscalYears.map((fy: any) => (
                            <MenuItem key={fy.id} value={fy.id}>{fy.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Top Dept</InputLabel>
                    <Select
                        value={topLevelDeptId}
                        onChange={(e: SelectChangeEvent) => {
                            setTopLevelDeptId(e.target.value);
                            setSubDeptId('');
                        }}
                        label="Top Dept"
                    >
                        <MenuItem value="">All</MenuItem>
                        {topLevelDepartments.map((dept: any) => (
                            <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {subDepartments.length > 0 && (
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Sub Dept</InputLabel>
                        <Select
                            value={subDeptId}
                            onChange={(e: SelectChangeEvent) => setSubDeptId(e.target.value)}
                            label="Sub Dept"
                            data-tooltip="Filter by sub-department"
                            data-tooltip-pos="top"
                        >
                            <MenuItem value="">All</MenuItem>
                            {subDepartments.map((dept: any) => (
                                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* Search Input */}
                <TextField
                    placeholder="Search transactions..."
                    size="small"
                    onClick={() => setSearchDialogOpen(true)}
                    data-tooltip="Search all transactions (⌘K / Ctrl+K)"
                    data-tooltip-pos="top"
                    sx={{ minWidth: 350, cursor: 'pointer' }}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                🔍
                            </Box>
                        ),
                        endAdornment: (
                            <Box component="span" sx={{ ml: 1, display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.75rem' }}>
                                ⌘K / Ctrl+K
                            </Box>
                        ),
                    }}
                />
            </Paper>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{
                        p: 3,
                        height: '100%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' }
                    }}
                        onClick={openEntryDialog}
                    >
                        <Typography variant="h6" fontWeight="bold">Quick Action</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>Add a new expense or income</Typography>
                        <Box sx={{ bgcolor: 'white', color: 'primary.main', py: 1, px: 3, borderRadius: 8, fontWeight: 'bold' }}>
                            + New Entry
                        </Box>
                    </Paper>
                </Grid>

                {/* Key Metrics Row - Simplified */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Paper sx={{ p: 3, borderLeft: '4px solid #00E5FF', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Current Period Balance</Typography>
                                <Typography variant="h4" fontWeight={800} color={stats.thisMonth >= 0 ? "success.main" : "error.main"}>
                                    ${stats.thisMonth.toFixed(2)}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Paper sx={{ p: 3, borderLeft: '4px solid #6C5DD3', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Total Pending (Unreconciled)</Typography>
                                <Typography variant="h4" fontWeight={800}>
                                    {stats.totalEntries} <Typography component="span" variant="body2" color="text.secondary">Transactions</Typography>
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Fade in timeout={1000}>
                        <Paper sx={{
                            p: 3,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Recent Transactions</Typography>
                                <Typography
                                    variant="body2"
                                    color="primary"
                                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                    onClick={() => navigate('/transactions')}
                                >
                                    View All
                                </Typography>
                            </Box>

                            {fetching && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
                            {error && <Alert severity="error">Error loading data: {error.message}</Alert>}

                            {recentEntries.length > 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {recentEntries.map((entry: any) => {
                                        const amount = Math.abs(parseRational(entry.total));
                                        const isCredit = entry.category?.type === 'CREDIT';
                                        return (
                                            <Box key={entry.id} sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                p: 2,
                                                bgcolor: 'background.default',
                                                borderRadius: 2,
                                                alignItems: 'center',
                                                transition: 'all 0.2s',
                                                '&:hover': { bgcolor: 'action.hover', transform: 'translateX(8px)', boxShadow: 2 }
                                            }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActionMenuAnchor(e.currentTarget);
                                                        setActionMenuEntry(entry);
                                                    }}
                                                    data-tooltip="Actions"
                                                    data-tooltip-pos="right"
                                                    sx={{ mr: 1 }}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {entry.description || "No Description"}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {format(parseISO(entry.date), 'MMM dd, yyyy')} • {entry.category?.name || "Uncategorized"}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body1" fontWeight="bold" color={isCredit ? 'success.main' : 'error.main'}>
                                                        {isCredit ? '+' : '-'}${amount.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                            {recentEntries.length === 0 && !fetching && (
                                <Alert severity="info">No transactions found for the selected department and fiscal year.</Alert>
                            )}
                        </Paper>
                    </Fade>
                </Grid>
            </Grid>

            {/* Action Menu */}
            <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={() => {
                    setActionMenuAnchor(null);
                    setActionMenuEntry(null);
                }}
            >
                <MenuItem onClick={() => {
                    setEditEntry(actionMenuEntry);
                    setEditDialogOpen(true);
                    setActionMenuAnchor(null);
                    setActionMenuEntry(null);
                }}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit Transaction</ListItemText>
                </MenuItem>
                <MenuItem onClick={async () => {
                    if (actionMenuEntry) {
                        await reconcileEntries({
                            input: { entries: [actionMenuEntry.id] }
                        });
                        handleReexecute();
                    }
                    setActionMenuAnchor(null);
                    setActionMenuEntry(null);
                }}>
                    <ListItemIcon>
                        <CheckCircleIcon fontSize="small" color={actionMenuEntry?.reconciled ? "disabled" : "success"} />
                    </ListItemIcon>
                    <ListItemText>
                        {actionMenuEntry?.reconciled ? "Already Reconciled" : "Mark as Reconciled"}
                    </ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    setRefundEntry(actionMenuEntry);
                    setRefundDialogOpen(true);
                    setActionMenuAnchor(null);
                    setActionMenuEntry(null);
                }}>
                    <ListItemIcon><ReplayIcon fontSize="small" color="info" /></ListItemIcon>
                    <ListItemText>Issue Refund</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={async () => {
                        if (actionMenuEntry && window.confirm('Are you sure you want to delete this transaction?')) {
                            await deleteEntry({ id: actionMenuEntry.id });
                            handleReexecute();
                        }
                        setActionMenuAnchor(null);
                        setActionMenuEntry(null);
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText>Delete Transaction</ListItemText>
                </MenuItem>
            </Menu>

            <EditEntryDialog
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setEditEntry(null);
                }}
                onSuccess={() => {
                    handleReexecute();
                }}
                entry={editEntry}
            />

            <EntryFormDialog
                open={refundDialogOpen}
                onClose={() => {
                    setRefundDialogOpen(false);
                    setRefundEntry(null);
                }}
                onSuccess={() => {
                    handleReexecute();
                }}
                initialEntryType="refund"
                initialSelectedEntry={refundEntry}
            />

            <SearchDialog
                open={searchDialogOpen}
                onClose={() => setSearchDialogOpen(false)}
            />
        </Box>
    );
}
