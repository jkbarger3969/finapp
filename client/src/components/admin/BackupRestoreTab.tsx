import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
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
import VerifiedIcon from '@mui/icons-material/VerifiedUser';
import DeleteIcon from '@mui/icons-material/Delete';
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
            backup {
                filename
                sizeBytes
                createdAt
                label
            }
            verification {
                ok
                manifestFound
                collections {
                    collection
                    expectedCount
                    actualCount
                    ok
                }
            }
        }
    }
`;

const VERIFY_BACKUP = gql`
    mutation VerifyBackup($filename: String!) {
        verifyBackup(filename: $filename) {
            ok
            manifestFound
            collections {
                collection
                expectedCount
                actualCount
                ok
            }
        }
    }
`;

const DELETE_BACKUP = gql`
    mutation DeleteBackup($filename: String!) {
        deleteBackup(filename: $filename)
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

interface BackupCollectionCheck {
    collection: string;
    expectedCount: number;
    actualCount: number;
    ok: boolean;
}

interface BackupVerification {
    ok: boolean;
    manifestFound: boolean;
    collections: BackupCollectionCheck[];
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function summarizeVerification(verification: BackupVerification): string {
    if (!verification.manifestFound) {
        return 'no manifest to verify against (pre-dates verification support)';
    }
    return verification.collections.map((c) => `${c.collection}: ${c.actualCount}`).join(', ');
}

export default function BackupRestoreTab() {
    const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
    const [creating, setCreating] = useState(false);
    const [downloadingFilename, setDownloadingFilename] = useState<string | null>(null);
    const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; backup: BackupInfo | null }>({
        open: false,
        backup: null,
    });
    const [confirmText, setConfirmText] = useState('');
    const [restoring, setRestoring] = useState(false);
    const [verifyDialog, setVerifyDialog] = useState<{
        open: boolean;
        backup: BackupInfo | null;
        loading: boolean;
        verification: BackupVerification | null;
        error: string | null;
    }>({ open: false, backup: null, loading: false, verification: null, error: null });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; backup: BackupInfo | null; deleting: boolean }>({
        open: false,
        backup: null,
        deleting: false,
    });

    const [{ data, fetching, error }, reexecuteQuery] = useQuery({ query: GET_BACKUPS });
    const [, createBackup] = useMutation(CREATE_BACKUP);
    const [, restoreBackup] = useMutation(RESTORE_BACKUP);
    const [, verifyBackup] = useMutation(VERIFY_BACKUP);
    const [, deleteBackup] = useMutation(DELETE_BACKUP);

    const backups: BackupInfo[] = data?.backups || [];

    const handleCreateBackup = async () => {
        setCreating(true);
        try {
            const result = await createBackup({});
            if (result.error) {
                setResultMessage({ type: 'error', message: result.error.message });
            } else {
                const { backup, verification } = result.data.createBackup;
                if (verification.ok) {
                    setResultMessage({
                        type: 'success',
                        message: `Backup created and verified: ${backup.filename} (${summarizeVerification(verification)})`,
                    });
                } else {
                    setResultMessage({
                        type: 'warning',
                        message: `Backup created as ${backup.filename}, but verification found a mismatch - check it with "Verify" before relying on it.`,
                    });
                }
                reexecuteQuery({ requestPolicy: 'network-only' });
            }
        } catch (err: unknown) {
            setResultMessage({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create backup' });
        } finally {
            setCreating(false);
        }
        setTimeout(() => setResultMessage(null), 8000);
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

    const handleVerifyClick = async (backup: BackupInfo) => {
        setVerifyDialog({ open: true, backup, loading: true, verification: null, error: null });
        try {
            const result = await verifyBackup({ filename: backup.filename });
            if (result.error) {
                setVerifyDialog({ open: true, backup, loading: false, verification: null, error: result.error.message });
            } else {
                setVerifyDialog({
                    open: true,
                    backup,
                    loading: false,
                    verification: result.data.verifyBackup,
                    error: null,
                });
            }
        } catch (err: unknown) {
            setVerifyDialog({
                open: true,
                backup,
                loading: false,
                verification: null,
                error: err instanceof Error ? err.message : 'Verification failed',
            });
        }
    };

    const handleDeleteClick = (backup: BackupInfo) => {
        setDeleteDialog({ open: true, backup, deleting: false });
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog.backup) return;
        setDeleteDialog((prev) => ({ ...prev, deleting: true }));
        try {
            const result = await deleteBackup({ filename: deleteDialog.backup.filename });
            if (result.error) {
                setResultMessage({ type: 'error', message: result.error.message });
            } else {
                setResultMessage({ type: 'success', message: `Deleted ${deleteDialog.backup.filename}` });
                reexecuteQuery({ requestPolicy: 'network-only' });
            }
        } catch (err: unknown) {
            setResultMessage({ type: 'error', message: err instanceof Error ? err.message : 'Delete failed' });
        } finally {
            setDeleteDialog({ open: false, backup: null, deleting: false });
        }
        setTimeout(() => setResultMessage(null), 6000);
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
                    A backup captures the entire database, including all users and permissions, and is
                    automatically verified (per-collection document counts re-checked against the archive
                    itself) right after creation. To move a backup to another server, copy its file into
                    that server's backup archives directory over SSH/scp - it will appear in this list
                    automatically.
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
                                            startIcon={<VerifiedIcon fontSize="small" />}
                                            onClick={() => handleVerifyClick(backup)}
                                        >
                                            Verify
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<RestoreIcon fontSize="small" />}
                                            onClick={() => handleRestoreClick(backup)}
                                        >
                                            Restore
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon fontSize="small" />}
                                            onClick={() => handleDeleteClick(backup)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Verify dialog */}
            <Dialog
                open={verifyDialog.open}
                onClose={() => setVerifyDialog({ open: false, backup: null, loading: false, verification: null, error: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Verify {verifyDialog.backup?.filename}</DialogTitle>
                <DialogContent>
                    {verifyDialog.loading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                            <CircularProgress size={20} />
                            <Typography>Extracting and re-counting documents in the archive...</Typography>
                        </Box>
                    )}
                    {verifyDialog.error && <Alert severity="error">{verifyDialog.error}</Alert>}
                    {verifyDialog.verification && (
                        <>
                            {!verifyDialog.verification.manifestFound ? (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    This backup pre-dates verification support - there's no recorded manifest
                                    to check it against.
                                </Alert>
                            ) : (
                                <Alert severity={verifyDialog.verification.ok ? 'success' : 'error'} sx={{ mb: 2 }}>
                                    {verifyDialog.verification.ok
                                        ? 'Every collection matches its recorded count.'
                                        : 'One or more collections do not match their recorded count.'}
                                </Alert>
                            )}
                            {verifyDialog.verification.collections.length > 0 && (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Collection</TableCell>
                                            <TableCell align="right">Expected</TableCell>
                                            <TableCell align="right">Actual</TableCell>
                                            <TableCell align="right">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {verifyDialog.verification.collections.map((c) => (
                                            <TableRow key={c.collection}>
                                                <TableCell>{c.collection}</TableCell>
                                                <TableCell align="right">{c.expectedCount}</TableCell>
                                                <TableCell align="right">{c.actualCount}</TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={c.ok ? 'OK' : 'Mismatch'}
                                                        color={c.ok ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setVerifyDialog({ open: false, backup: null, loading: false, verification: null, error: null })
                        }
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => (deleteDialog.deleting ? undefined : setDeleteDialog({ open: false, backup: null, deleting: false }))}
            >
                <DialogTitle>Delete this backup?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This permanently deletes <code>{deleteDialog.backup?.filename}</code>. It doesn't
                        touch any live data - it only removes this one backup file, so it can no longer be
                        restored from or downloaded.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialog({ open: false, backup: null, deleting: false })}
                        disabled={deleteDialog.deleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={deleteDialog.deleting}
                    >
                        {deleteDialog.deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

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
                        The archive is automatically re-verified against its own recorded counts right before
                        restoring, and the restore is refused if it doesn't match. A safety backup of the
                        current data is also taken automatically right before this runs, so this itself can
                        be undone by restoring that safety backup - but the restore you're about to run
                        cannot be undone by any other means.
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
