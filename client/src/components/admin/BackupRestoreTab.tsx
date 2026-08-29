import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import DownloadIcon from '@mui/icons-material/Download';
import RestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import RefreshIcon from '@mui/icons-material/Refresh';
import { gql, useMutation, useQuery } from 'urql';

const RESTORE_CONFIRMATION_PHRASE = 'RESTORE ALL DATA';
const AUTH_TOKEN_KEY = 'finapp_auth_token';

const GET_BACKUPS = gql`
    query GetBackups {
        backups {
            filename
            sizeBytes
            createdAt
            label
        }
    }
`;

const CREATE_BACKUP = gql`
    mutation CreateBackup {
        createBackup {
            filename
            sizeBytes
            createdAt
            label
        }
    }
`;

const RESTORE_BACKUP = gql`
    mutation RestoreBackup($filename: String!, $confirmationPhrase: String!) {
        restoreBackup(filename: $filename, confirmationPhrase: $confirmationPhrase) {
            success
            restoredFrom
            preRestoreBackup
        }
    }
`;

interface BackupInfo {
    filename: string;
    sizeBytes: number;
    createdAt: string;
    label: string;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BackupRestoreTab() {
    const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [creating, setCreating] = useState(false);
    const [downloadingFilename, setDownloadingFilename] = useState<string | null>(null);
    const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; backup: BackupInfo | null }>({
        open: false,
        backup: null,
    });
    const [confirmText, setConfirmText] = useState('');
    const [restoring, setRestoring] = useState(false);

    const [{ data, fetching, error }, reexecuteQuery] = useQuery({ query: GET_BACKUPS });
    const [, createBackup] = useMutation(CREATE_BACKUP);
    const [, restoreBackup] = useMutation(RESTORE_BACKUP);

    const backups: BackupInfo[] = data?.backups || [];

    const handleCreateBackup = async () => {
        setCreating(true);
        try {
            const result = await createBackup({});
            if (result.error) {
                setResultMessage({ type: 'error', message: result.error.message });
            } else {
                setResultMessage({ type: 'success', message: `Backup created: ${result.data.createBackup.filename}` });
                reexecuteQuery({ requestPolicy: 'network-only' });
            }
        } catch (err: unknown) {
            setResultMessage({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create backup' });
        } finally {
            setCreating(false);
        }
        setTimeout(() => setResultMessage(null), 6000);
    };

    const handleDownload = async (backup: BackupInfo) => {
        setDownloadingFilename(backup.filename);
        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            const response = await fetch(`/admin/backups/${encodeURIComponent(backup.filename)}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!response.ok) {
                throw new Error(`Download failed (${response.status})`);
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = backup.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: unknown) {
            setResultMessage({ type: 'error', message: err instanceof Error ? err.message : 'Download failed' });
            setTimeout(() => setResultMessage(null), 6000);
        } finally {
            setDownloadingFilename(null);
        }
    };

    const handleRestoreClick = (backup: BackupInfo) => {
        setConfirmText('');
        setRestoreDialog({ open: true, backup });
    };

    const handleConfirmRestore = async () => {
        if (!restoreDialog.backup) return;
        setRestoring(true);
        try {
            const result = await restoreBackup({
                filename: restoreDialog.backup.filename,
                confirmationPhrase: confirmText,
            });
            if (result.error) {
                setResultMessage({ type: 'error', message: result.error.message });
            } else {
                const restored = result.data.restoreBackup;
                setResultMessage({
                    type: 'success',
                    message: `Restored from ${restored.restoredFrom}. A safety backup of the prior data was saved as ${restored.preRestoreBackup}. Existing sessions may need to log in again.`,
                });
                reexecuteQuery({ requestPolicy: 'network-only' });
            }
        } catch (err: unknown) {
            setResultMessage({ type: 'error', message: err instanceof Error ? err.message : 'Restore failed' });
        } finally {
            setRestoring(false);
            setRestoreDialog({ open: false, backup: null });
            setConfirmText('');
        }
        setTimeout(() => setResultMessage(null), 10000);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Backup &amp; Restore</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={creating ? <CircularProgress size={16} color="inherit" /> : <BackupIcon />}
                        onClick={handleCreateBackup}
                        disabled={creating}
                        size="small"
                    >
                        Create Backup
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
                    Error loading backups: {error.message}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                    A backup captures the entire database, including all users and permissions. To move a
                    backup to another server, copy its file into that server's backup archives directory
                    over SSH/scp - it will appear in this list automatically.
                </Typography>
            </Paper>

            {fetching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Filename</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {backups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="text.secondary" sx={{ py: 2 }}>
                                            No backups yet. Click "Create Backup" to make one.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {backups.map((backup) => (
                                <TableRow key={backup.filename} hover>
                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        {backup.filename}
                                    </TableCell>
                                    <TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{formatBytes(backup.sizeBytes)}</TableCell>
                                    <TableCell>{backup.label}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            startIcon={
                                                downloadingFilename === backup.filename ? (
                                                    <CircularProgress size={14} />
                                                ) : (
                                                    <DownloadIcon fontSize="small" />
                                                )
                                            }
                                            onClick={() => handleDownload(backup)}
                                            disabled={downloadingFilename === backup.filename}
                                        >
                                            Download
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<RestoreIcon fontSize="small" />}
                                            onClick={() => handleRestoreClick(backup)}
                                        >
                                            Restore
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={restoreDialog.open}
                onClose={() => (restoring ? undefined : setRestoreDialog({ open: false, backup: null }))}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ color: 'error.main' }}>Restore ALL Data?</DialogTitle>
                <DialogContent>
                    <DialogContentText component="div">
                        <strong style={{ color: '#d32f2f' }}>
                            WARNING: This replaces every transaction, category, department, budget, and user
                            account currently in the database with the contents of{' '}
                            <code>{restoreDialog.backup?.filename}</code>.
                        </strong>
                        <br />
                        <br />
                        Anything created or changed after that backup was taken will be lost unless it's in a
                        newer backup. Everyone, including you, may be signed out and need to log in again
                        afterward.
                        <br />
                        <br />
                        A safety backup of the current data is taken automatically right before this runs, so
                        this itself can be undone by restoring that safety backup - but the restore you're
                        about to run cannot be undone by any other means.
                        <br />
                        <br />
                        Type <strong>{RESTORE_CONFIRMATION_PHRASE}</strong> below to confirm.
                    </DialogContentText>
                    <TextField
                        fullWidth
                        sx={{ mt: 2 }}
                        placeholder={RESTORE_CONFIRMATION_PHRASE}
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        disabled={restoring}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRestoreDialog({ open: false, backup: null })} disabled={restoring}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmRestore}
                        color="error"
                        variant="contained"
                        disabled={confirmText !== RESTORE_CONFIRMATION_PHRASE || restoring}
                    >
                        {restoring ? <CircularProgress size={20} color="inherit" /> : 'Restore Everything'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
