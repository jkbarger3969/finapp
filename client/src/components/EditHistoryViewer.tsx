import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItemText,
    Typography,
    Box,
    Collapse,
    Paper,
    CircularProgress,
    ListItemButton,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useQuery } from 'urql';
import { useState } from 'react';

const GET_ENTRY_HISTORY = `
  query GetEntryHistory($id: ID!) {
    entry(id: $id) {
        id
        editHistory {
            id
            editedAt
            editedBy
            changes
        }
    }
  }
`;

interface EditHistoryViewerProps {
    entryId: string;
    open: boolean;
    onClose: () => void;
}

export default function EditHistoryViewer({ entryId, open, onClose }: EditHistoryViewerProps) {
    const [result] = useQuery({
        query: GET_ENTRY_HISTORY,
        variables: { id: entryId },
        pause: !open, // Only fetch when open
    });

    const { data, fetching, error } = result;

    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Audit Log & Edit History</DialogTitle>
            <DialogContent>
                {fetching && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}
                {error && <Typography color="error">Failed to load history: {error.message}</Typography>}

                {!fetching && data?.entry?.editHistory?.length === 0 && (
                    <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                        No edit history available for this transaction.
                    </Typography>
                )}

                <List>
                    {data?.entry?.editHistory?.map((item: any) => (
                        <HistoryItem key={item.id} item={item} />
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

function HistoryItem({ item }: { item: any }) {
    const [expanded, setExpanded] = useState(false);

    // Changes is a JSON object: { field: { old: val, new: val } }
    const changes = item.changes;
    const changeCount = Object.keys(changes).length;

    return (
        <Paper elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
            <ListItemButton
                onClick={() => setExpanded(!expanded)}
                sx={{ bgcolor: 'action.hover' }}
            >
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1">
                                Edited by <strong>{item.editedBy}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {new Date(item.editedAt).toLocaleString()}
                            </Typography>
                        </Box>
                    }
                    secondary={`${changeCount} field${changeCount !== 1 ? 's' : ''} changed`}
                />
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <th style={{ textAlign: 'left', padding: '8px' }}>Field</th>
                                <th style={{ textAlign: 'left', padding: '8px', color: '#d32f2f' }}>Old Value</th>
                                <th style={{ textAlign: 'left', padding: '8px', color: '#2e7d32' }}>New Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(changes).map(([field, diff]: [string, any]) => (
                                <tr key={field} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{field}</td>
                                    <td style={{ padding: '8px', color: '#d32f2f', wordBreak: 'break-word' }}>
                                        {diff.old === null || diff.old === undefined ? <em>null</em> : String(diff.old)}
                                    </td>
                                    <td style={{ padding: '8px', color: '#2e7d32', wordBreak: 'break-word' }}>
                                        {diff.new === null || diff.new === undefined ? <em>null</em> : String(diff.new)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            </Collapse>
        </Paper>
    );
}
