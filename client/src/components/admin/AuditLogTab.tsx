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
    TablePagination,
    Typography,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton,
    Collapse,
    CircularProgress,
    Alert,
    Button,
    Tooltip,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { useQuery } from 'urql';

const GET_AUDIT_LOG = `
    query GetAuditLog($where: AuditLogWhere, $limit: Int, $offset: Int) {
        auditLog(where: $where, limit: $limit, offset: $offset) {
            id
            user {
                id
                name
                email
            }
            action
            resourceType
            resourceId
            details
            ipAddress
            userAgent
            timestamp
        }
    }
`;

const GET_USERS_FOR_FILTER = `
    query UsersForFilter {
        users {
            id
            name
            email
        }
    }
`;

type AuditAction =
    | 'LOGIN'
    | 'LOGOUT'
    | 'ENTRY_CREATE'
    | 'ENTRY_UPDATE'
    | 'ENTRY_DELETE'
    | 'REFUND_CREATE'
    | 'REFUND_UPDATE'
    | 'REFUND_DELETE'
    | 'RECONCILE'
    | 'USER_INVITE'
    | 'USER_UPDATE'
    | 'USER_DISABLE'
    | 'PERMISSION_GRANT'
    | 'PERMISSION_REVOKE'
    | 'RECEIPT_UPLOAD'
    | 'RECEIPT_DELETE';

const ACTION_COLORS: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
    LOGIN: 'info',
    LOGOUT: 'default',
    ENTRY_CREATE: 'success',
    ENTRY_UPDATE: 'info',
    ENTRY_DELETE: 'error',
    REFUND_CREATE: 'success',
    REFUND_UPDATE: 'info',
    REFUND_DELETE: 'error',
    RECONCILE: 'warning',
    USER_INVITE: 'success',
    USER_UPDATE: 'info',
    USER_DISABLE: 'error',
    PERMISSION_GRANT: 'success',
    PERMISSION_REVOKE: 'warning',
    RECEIPT_UPLOAD: 'success',
    RECEIPT_DELETE: 'error',
};

const ACTION_LABELS: Record<string, string> = {
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    ENTRY_CREATE: 'Entry Created',
    ENTRY_UPDATE: 'Entry Updated',
    ENTRY_DELETE: 'Entry Deleted',
    REFUND_CREATE: 'Refund Created',
    REFUND_UPDATE: 'Refund Updated',
    REFUND_DELETE: 'Refund Deleted',
    RECONCILE: 'Reconciled',
    USER_INVITE: 'User Invited',
    USER_UPDATE: 'User Updated',
    USER_DISABLE: 'User Disabled',
    PERMISSION_GRANT: 'Permission Granted',
    PERMISSION_REVOKE: 'Permission Revoked',
    RECEIPT_UPLOAD: 'Receipt Uploaded',
    RECEIPT_DELETE: 'Receipt Deleted',
};

interface AuditLogEntry {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    action: AuditAction;
    resourceType?: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
}

export default function AuditLogTab() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const [actionFilter, setActionFilter] = useState<string>('');
    const [userFilter, setUserFilter] = useState<string>('');
    const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    const where = useMemo(() => {
        const filter: Record<string, any> = {};
        if (actionFilter) filter.action = actionFilter;
        if (userFilter) filter.userId = { eq: userFilter };
        if (resourceTypeFilter) filter.resourceType = resourceTypeFilter;
        if (dateFrom || dateTo) {
            filter.timestamp = {};
            if (dateFrom) filter.timestamp.gte = new Date(dateFrom).toISOString();
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                filter.timestamp.lte = endDate.toISOString();
            }
        }
        return Object.keys(filter).length > 0 ? filter : undefined;
    }, [actionFilter, userFilter, resourceTypeFilter, dateFrom, dateTo]);

    const [result, reexecuteQuery] = useQuery({
        query: GET_AUDIT_LOG,
        variables: {
            where,
            limit: rowsPerPage,
            offset: page * rowsPerPage,
        },
    });

    const [usersResult] = useQuery({ query: GET_USERS_FOR_FILTER });

    const { data, fetching, error } = result;
    const auditLog: AuditLogEntry[] = data?.auditLog || [];
    const users = usersResult.data?.users || [];

    const toggleRowExpand = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const formatDetails = (details: Record<string, any> | undefined) => {
        if (!details) return null;
        return JSON.stringify(details, null, 2);
    };

    const getBrowserFromUserAgent = (userAgent: string | undefined) => {
        if (!userAgent) return 'Unknown';
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Other';
    };

    const clearFilters = () => {
        setActionFilter('');
        setUserFilter('');
        setResourceTypeFilter('');
        setDateFrom('');
        setDateTo('');
        setPage(0);
    };

    const exportToCsv = () => {
        const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'Browser'];
        const rows = auditLog.map(entry => [
            formatTimestamp(entry.timestamp),
            entry.user?.name || entry.user?.email || 'Unknown',
            ACTION_LABELS[entry.action] || entry.action,
            entry.resourceType || '',
            entry.resourceId || '',
            entry.ipAddress || '',
            getBrowserFromUserAgent(entry.userAgent),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Action</InputLabel>
                        <Select
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                            label="Action"
                        >
                            <MenuItem value="">All Actions</MenuItem>
                            {Object.entries(ACTION_LABELS).map(([value, label]) => (
                                <MenuItem key={value} value={value}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>User</InputLabel>
                        <Select
                            value={userFilter}
                            onChange={(e) => { setUserFilter(e.target.value); setPage(0); }}
                            label="User"
                        >
                            <MenuItem value="">All Users</MenuItem>
                            {users.map((user: any) => (
                                <MenuItem key={user.id} value={user.id}>{user.name || user.email}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Resource</InputLabel>
                        <Select
                            value={resourceTypeFilter}
                            onChange={(e) => { setResourceTypeFilter(e.target.value); setPage(0); }}
                            label="Resource"
                        >
                            <MenuItem value="">All Resources</MenuItem>
                            <MenuItem value="Entry">Entry</MenuItem>
                            <MenuItem value="Refund">Refund</MenuItem>
                            <MenuItem value="User">User</MenuItem>
                            <MenuItem value="Permission">Permission</MenuItem>
                            <MenuItem value="Attachment">Attachment</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        type="date"
                        label="From"
                        value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150 }}
                    />

                    <TextField
                        size="small"
                        type="date"
                        label="To"
                        value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150 }}
                    />

                    <Box sx={{ flexGrow: 1 }} />

                    <Button size="small" onClick={clearFilters}>Clear</Button>

                    <Tooltip title="Refresh">
                        <IconButton onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Export CSV">
                        <IconButton onClick={exportToCsv} disabled={auditLog.length === 0}>
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading audit log: {error.message}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell width={40}></TableCell>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Resource</TableCell>
                            <TableCell>IP Address</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fetching && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        )}

                        {!fetching && auditLog.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No audit log entries found</Typography>
                                </TableCell>
                            </TableRow>
                        )}

                        {!fetching && auditLog.map((entry) => (
                            <>
                                <TableRow
                                    key={entry.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => toggleRowExpand(entry.id)}
                                >
                                    <TableCell>
                                        <IconButton size="small">
                                            {expandedRows.has(entry.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>{formatTimestamp(entry.timestamp)}</TableCell>
                                    <TableCell>{entry.user?.name || entry.user?.email || 'Unknown'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={ACTION_LABELS[entry.action] || entry.action}
                                            color={ACTION_COLORS[entry.action] || 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {entry.resourceType && (
                                            <Typography variant="body2">
                                                {entry.resourceType}
                                                {entry.resourceId && (
                                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                        #{entry.resourceId.slice(-6)}
                                                    </Typography>
                                                )}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{entry.ipAddress || '-'}</TableCell>
                                </TableRow>
                                <TableRow key={`${entry.id}-details`}>
                                    <TableCell colSpan={6} sx={{ py: 0, borderBottom: expandedRows.has(entry.id) ? undefined : 'none' }}>
                                        <Collapse in={expandedRows.has(entry.id)} timeout="auto" unmountOnExit>
                                            <Box sx={{ py: 2, px: 4, bgcolor: 'grey.50' }}>
                                                <Typography variant="subtitle2" gutterBottom>Details</Typography>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">User Email</Typography>
                                                        <Typography variant="body2">{entry.user?.email || 'Unknown'}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Browser</Typography>
                                                        <Typography variant="body2">{getBrowserFromUserAgent(entry.userAgent)}</Typography>
                                                    </Box>
                                                    {entry.resourceId && (
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Resource ID</Typography>
                                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                                {entry.resourceId}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                                {entry.details && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography variant="caption" color="text.secondary">Change Details</Typography>
                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                mt: 0.5,
                                                                p: 1,
                                                                bgcolor: 'grey.100',
                                                                fontFamily: 'monospace',
                                                                fontSize: '0.75rem',
                                                                whiteSpace: 'pre-wrap',
                                                                maxHeight: 200,
                                                                overflow: 'auto',
                                                            }}
                                                        >
                                                            {formatDetails(entry.details)}
                                                        </Paper>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={-1}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelDisplayedRows={({ from, to }) => `${from}-${to}`}
                />
            </TableContainer>
        </Box>
    );
}
