import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepartment } from '../../context/DepartmentContext';
import { useOnlineStatus } from '../../context/OnlineStatusContext';
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
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
    CircularProgress,
    Tooltip,
    Tabs,
    Tab,
    TextField,
    Stack,
} from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { gql, useQuery, useMutation } from 'urql';

const GET_ALL_FISCAL_YEARS = gql`
    query GetAllFiscalYears {
        fiscalYears {
            id
            name
            begin
            end
            archived
            archivedAt
            archivedBy {
                id
                name
                email
            }
        }
    }
`;

const ARCHIVE_FISCAL_YEAR = gql`
    mutation ArchiveFiscalYear($id: ID!) {
        archiveFiscalYear(id: $id) {
            fiscalYear {
                id
                name
                archived
                archivedAt
            }
            entriesArchived
            budgetsArchived
        }
    }
`;

const RESTORE_FISCAL_YEAR = gql`
    mutation RestoreFiscalYear($id: ID!) {
        restoreFiscalYear(id: $id) {
            fiscalYear {
                id
                name
                archived
            }
            entriesRestored
            budgetsRestored
        }
    }
`;

const DELETE_FISCAL_YEAR = gql`
    mutation DeleteFiscalYear($id: ID!) {
        deleteFiscalYear(id: $id) {
            success
            entriesDeleted
            budgetsDeleted
        }
    }
`;

const EXPORT_FISCAL_YEAR = gql`
    query ExportFiscalYear($id: ID!) {
        exportFiscalYear(id: $id) {
            fiscalYear {
                id
                name
                begin
                end
            }
            entries {
                id
                description
                date
                total
                reconciled
                department { id name }
                category { id name type }
            }
            budgets {
                id
                total
                department { id name }
            }
            exportedAt
        }
    }
`;

const CREATE_FISCAL_YEAR = gql`
    mutation CreateFiscalYear($input: CreateFiscalYearInput!) {
        createFiscalYear(input: $input) {
            fiscalYear {
                id
                name
                begin
                end
            }
        }
    }
`;

interface FiscalYear {
    id: string;
    name: string;
    begin: string;
    end: string;
    archived: boolean;
    archivedAt?: string;
    archivedBy?: {
        id: string;
        name: string;
        email: string;
    };
}

export default function FiscalYearTab() {
    const navigate = useNavigate();
    const { refetchFiscalYears } = useDepartment();
    const { isOnline } = useOnlineStatus();
    const [tabValue, setTabValue] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        action: 'archive' | 'restore' | 'delete';
        fiscalYear: FiscalYear | null;
    }>({ open: false, action: 'archive', fiscalYear: null });
    const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [exportingId, setExportingId] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [createdFyName, setCreatedFyName] = useState('');
    const [newFyYear, setNewFyYear] = useState(new Date().getFullYear() + 1);
    const [newFyBegin, setNewFyBegin] = useState('');
    const [newFyEnd, setNewFyEnd] = useState('');
    const [saving, setSaving] = useState(false);

    const [{ data, fetching, error }, reexecuteQuery] = useQuery({
        query: GET_ALL_FISCAL_YEARS,
    });

    const [, archiveFiscalYear] = useMutation(ARCHIVE_FISCAL_YEAR);
    const [, restoreFiscalYear] = useMutation(RESTORE_FISCAL_YEAR);
    const [, deleteFiscalYear] = useMutation(DELETE_FISCAL_YEAR);
    const [, createFiscalYear] = useMutation(CREATE_FISCAL_YEAR);
    const [{ data: exportData }] = useQuery({
        query: EXPORT_FISCAL_YEAR,
        variables: { id: exportingId },
        pause: !exportingId,
    });

    const fiscalYears: FiscalYear[] = data?.fiscalYears || [];
    const activeFiscalYears = fiscalYears.filter(fy => !fy.archived);
    const archivedFiscalYears = fiscalYears.filter(fy => fy.archived);

    useEffect(() => {
        if (createDialogOpen && newFyYear) {
            const begin = `${newFyYear - 1}-09-01`;
            const end = `${newFyYear}-09-01`;
            setNewFyBegin(begin);
            setNewFyEnd(end);
        }
    }, [createDialogOpen, newFyYear]);

    const handleArchive = (fy: FiscalYear) => {
        setConfirmDialog({ open: true, action: 'archive', fiscalYear: fy });
    };

    const handleRestore = (fy: FiscalYear) => {
        setConfirmDialog({ open: true, action: 'restore', fiscalYear: fy });
    };

    const handleDelete = (fy: FiscalYear) => {
        setConfirmDialog({ open: true, action: 'delete', fiscalYear: fy });
    };

    const handleConfirm = async () => {
        if (!confirmDialog.fiscalYear) return;
        
        if (!isOnline) {
            setResultMessage({ type: 'error', message: 'Cannot perform this action while offline. Please reconnect and try again.' });
            setConfirmDialog({ open: false, action: 'archive', fiscalYear: null });
            return;
        }

        const { action, fiscalYear: fy } = confirmDialog;
        setConfirmDialog({ open: false, action: 'archive', fiscalYear: null });

        try {
            if (action === 'archive') {
                const result = await archiveFiscalYear({ id: fy.id });
                if (result.error) {
                    setResultMessage({ type: 'error', message: result.error.message });
                } else {
                    const data = result.data.archiveFiscalYear;
                    setResultMessage({
                        type: 'success',
                        message: `Archived ${fy.name}: ${data.entriesArchived} entries and ${data.budgetsArchived} budgets archived.`,
                    });
                    reexecuteQuery({ requestPolicy: 'network-only' });
                    refetchFiscalYears();
                }
            } else if (action === 'restore') {
                const result = await restoreFiscalYear({ id: fy.id });
                if (result.error) {
                    setResultMessage({ type: 'error', message: result.error.message });
                } else {
                    const data = result.data.restoreFiscalYear;
                    setResultMessage({
                        type: 'success',
                        message: `Restored ${fy.name}: ${data.entriesRestored} entries and ${data.budgetsRestored} budgets restored.`,
                    });
                    reexecuteQuery({ requestPolicy: 'network-only' });
                    refetchFiscalYears();
                }
            } else if (action === 'delete') {
                const result = await deleteFiscalYear({ id: fy.id });
                if (result.error) {
                    setResultMessage({ type: 'error', message: result.error.message });
                } else {
                    const data = result.data.deleteFiscalYear;
                    setResultMessage({
                        type: 'success',
                        message: `Deleted ${fy.name}: ${data.entriesDeleted} entries and ${data.budgetsDeleted} budgets permanently removed.`,
                    });
                    reexecuteQuery({ requestPolicy: 'network-only' });
                    refetchFiscalYears();
                }
            }
        } catch (err: any) {
            setResultMessage({ type: 'error', message: err.message });
        }

        setTimeout(() => setResultMessage(null), 5000);
    };

    const handleExport = async (fy: FiscalYear) => {
        setExportingId(fy.id);
    };

    const getSuggestedDates = (year: number) => {
        const begin = `${year - 1}-09-01`;
        const end = `${year}-09-01`;
        return { begin, end };
    };

    const handleYearChange = (year: number) => {
        setNewFyYear(year);
        const { begin, end } = getSuggestedDates(year);
        setNewFyBegin(begin);
        setNewFyEnd(end);
    };

    const handleCreateFiscalYear = async () => {
        if (!isOnline) {
            setResultMessage({ type: 'error', message: 'Cannot create fiscal year while offline. Please reconnect and try again.' });
            return;
        }
        
        if (!newFyYear || !newFyBegin || !newFyEnd) {
            setResultMessage({ type: 'error', message: 'Please fill all fiscal year fields' });
            return;
        }

        setSaving(true);
        const displayName = `${newFyYear - 1}-${newFyYear}`;

        try {
            const result = await createFiscalYear({
                input: {
                    name: displayName,
                    begin: newFyBegin,
                    end: newFyEnd,
                },
            });

            if (result.error) {
                setResultMessage({ type: 'error', message: result.error.message });
            } else {
                setCreateDialogOpen(false);
                setNewFyYear(new Date().getFullYear() + 1);
                setNewFyBegin('');
                setNewFyEnd('');
                setCreatedFyName(displayName);
                setSuccessDialogOpen(true);
                reexecuteQuery({ requestPolicy: 'network-only' });
                refetchFiscalYears();
            }
        } catch (err: any) {
            setResultMessage({ type: 'error', message: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (exportingId && exportData?.exportFiscalYear) {
        const exportInfo = exportData.exportFiscalYear;
        const jsonData = JSON.stringify(exportInfo, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fiscal-year-${exportInfo.fiscalYear.name.replace(/\s+/g, '-')}-export.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportingId(null);
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderFiscalYearTable = (years: FiscalYear[], showArchiveAction: boolean) => (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Fiscal Year</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell>Status</TableCell>
                        {!showArchiveAction && <TableCell>Archived Info</TableCell>}
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {years.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={showArchiveAction ? 4 : 5} align="center">
                                <Typography color="text.secondary" sx={{ py: 2 }}>
                                    {showArchiveAction ? 'No active fiscal years' : 'No archived fiscal years'}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                    {years.map((fy) => (
                        <TableRow key={fy.id} hover>
                            <TableCell>
                                <Typography fontWeight="medium">{fy.name}</Typography>
                            </TableCell>
                            <TableCell>
                                {formatDate(fy.begin)} - {formatDate(fy.end)}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={fy.archived ? 'Archived' : 'Active'}
                                    color={fy.archived ? 'default' : 'success'}
                                    size="small"
                                />
                            </TableCell>
                            {!showArchiveAction && (
                                <TableCell>
                                    {fy.archivedAt && (
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(fy.archivedAt)}
                                            {fy.archivedBy && ` by ${fy.archivedBy.name}`}
                                        </Typography>
                                    )}
                                </TableCell>
                            )}
                            <TableCell align="right">
                                <Tooltip title="Export Data">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleExport(fy)}
                                        disabled={exportingId === fy.id}
                                    >
                                        {exportingId === fy.id ? (
                                            <CircularProgress size={18} />
                                        ) : (
                                            <DownloadIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                                {showArchiveAction ? (
                                    <Tooltip title="Archive Fiscal Year">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleArchive(fy)}
                                            color="warning"
                                        >
                                            <ArchiveIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Restore Fiscal Year">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRestore(fy)}
                                            color="success"
                                        >
                                            <UnarchiveIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="Delete Fiscal Year">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(fy)}
                                        color="error"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Fiscal Year Management</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        size="small"
                    >
                        New Fiscal Year
                    </Button>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })}
                        size="small"
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {resultMessage && (
                <Alert severity={resultMessage.type} sx={{ mb: 2 }} onClose={() => setResultMessage(null)}>
                    {resultMessage.message}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading fiscal years: {error.message}
                </Alert>
            )}

            {fetching && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!fetching && (
                <>
                    <Paper sx={{ mb: 2 }}>
                        <Tabs
                            value={tabValue}
                            onChange={(_, v) => setTabValue(v)}
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Tab label={`Active (${activeFiscalYears.length})`} />
                            <Tab label={`Archived (${archivedFiscalYears.length})`} />
                        </Tabs>
                    </Paper>

                    {tabValue === 0 && renderFiscalYearTable(activeFiscalYears, true)}
                    {tabValue === 1 && renderFiscalYearTable(archivedFiscalYears, false)}

                    <Paper sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            About Fiscal Year Archiving
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Archiving a fiscal year will hide it from the fiscal year dropdown menus throughout the application.
                            All transactions and budget allocations for that fiscal year will be preserved but hidden from normal views.
                            You can restore an archived fiscal year at any time to make it available again.
                            Use the Export function to download a JSON backup of all data for a fiscal year.
                        </Typography>
                    </Paper>
                </>
            )}

            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                <DialogTitle>
                    {confirmDialog.action === 'archive' ? 'Archive Fiscal Year?' : 
                     confirmDialog.action === 'restore' ? 'Restore Fiscal Year?' : 
                     'Delete Fiscal Year?'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDialog.action === 'archive' ? (
                            <>
                                Are you sure you want to archive <strong>{confirmDialog.fiscalYear?.name}</strong>?
                                <br /><br />
                                This will:
                                <ul>
                                    <li>Hide this fiscal year from dropdown menus</li>
                                    <li>Archive all transactions for this fiscal year</li>
                                    <li>Archive all budget allocations for this fiscal year</li>
                                </ul>
                                You can restore this fiscal year later if needed.
                            </>
                        ) : confirmDialog.action === 'restore' ? (
                            <>
                                Are you sure you want to restore <strong>{confirmDialog.fiscalYear?.name}</strong>?
                                <br /><br />
                                This will:
                                <ul>
                                    <li>Make this fiscal year available in dropdown menus</li>
                                    <li>Restore all transactions for this fiscal year</li>
                                    <li>Restore all budget allocations for this fiscal year</li>
                                </ul>
                            </>
                        ) : (
                            <>
                                <strong style={{ color: '#d32f2f' }}>WARNING: This action cannot be undone!</strong>
                                <br /><br />
                                Are you sure you want to permanently delete <strong>{confirmDialog.fiscalYear?.name}</strong>?
                                <br /><br />
                                This will:
                                <ul>
                                    <li>Permanently delete this fiscal year</li>
                                    <li>Permanently delete ALL transactions for this fiscal year</li>
                                    <li>Permanently delete ALL budget allocations for this fiscal year</li>
                                </ul>
                                <strong>Consider archiving instead if you may need this data later.</strong>
                            </>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        color={confirmDialog.action === 'delete' ? 'error' : confirmDialog.action === 'archive' ? 'warning' : 'success'}
                        variant="contained"
                    >
                        {confirmDialog.action === 'archive' ? 'Archive' : 
                         confirmDialog.action === 'restore' ? 'Restore' : 
                         'Delete Permanently'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Fiscal Year Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Create New Fiscal Year</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Alert severity="info" sx={{ mb: 1 }}>
                            Fiscal year runs from September 1 to August 31.
                            Select the ending year to auto-populate dates.
                        </Alert>

                        <TextField
                            label="Fiscal Year Ending"
                            type="number"
                            value={newFyYear}
                            onChange={(e) => handleYearChange(parseInt(e.target.value) || 0)}
                            fullWidth
                            helperText={`Will be displayed as: ${newFyYear - 1}-${newFyYear}`}
                            inputProps={{ min: 2020, max: 2100 }}
                        />

                        <TextField
                            label="Start Date (Sept 1)"
                            type="date"
                            value={newFyBegin}
                            onChange={(e) => setNewFyBegin(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            helperText="First day of fiscal year (inclusive)"
                        />
                        <TextField
                            label="End Date (Sept 1 of next year)"
                            type="date"
                            value={newFyEnd}
                            onChange={(e) => setNewFyEnd(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            helperText="Day after last day of fiscal year (exclusive boundary)"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateFiscalYear} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Dialog - Navigate to Budget Allocations */}
            <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Fiscal Year Created</DialogTitle>
                <DialogContent>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Fiscal year {createdFyName} has been created successfully.
                    </Alert>
                    <Typography>
                        Would you like to set up budget allocations for this fiscal year now?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSuccessDialogOpen(false)}>
                        Later
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={() => {
                            setSuccessDialogOpen(false);
                            navigate('/budget');
                        }}
                    >
                        Set Up Budgets
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
