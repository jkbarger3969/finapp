import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Box,
    Alert,
    IconButton,
    Tooltip,
    Fade,
} from '@mui/material';
import { History as HistoryIcon, Save as SaveIcon } from '@mui/icons-material';
import { useMutation, useQuery } from 'urql';
import { useOnlineStatus } from '../context/OnlineStatusContext';
import EditHistoryViewer from './EditHistoryViewer';

const GET_FORM_DATA = `
  query GetFormData {
    categories {
        id
        name
        type
    }
    departments {
        id
        name
    }
  }
`;

const UPDATE_ENTRY_MUTATION = `
  mutation UpdateEntry($input: UpdateEntry!) {
    updateEntry(input: $input) {
      updatedEntry {
        id
        description
        date
        dateOfRecord {
            date
            overrideFiscalYear
        }
        total
        category {
            id
            name
        }
        department {
            id
            name
        }
      }
    }
  }
`;

const UPDATE_REFUND_MUTATION = `
  mutation UpdateEntryRefund($input: UpdateEntryRefund!) {
    updateEntryRefund(input: $input) {
      updatedEntryRefund {
        id
        description
        date
        dateOfRecord {
            date
            overrideFiscalYear
        }
        total
        reconciled
      }
    }
  }
`;

interface EditEntryDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    entry: {
        id: string;
        description?: string | null;
        date?: string;
        total?: string | { s: number; n: number; d: number };
        category?: { id: string; name: string; type?: string } | null;
        department?: { id: string; name: string } | null;
        reconciled?: boolean;
        dateOfRecord?: { date?: string; overrideFiscalYear?: boolean | null } | null;
        isRefund?: boolean;
    } | null;
}

type EntryValue = NonNullable<EditEntryDialogProps['entry']>;
interface FormAmountRational {
    n: number;
    d: number;
}

interface FormDataQuery {
    categories: Array<{ id: string; name: string; type: string }>;
    departments: Array<{ id: string; name: string }>;
}

export default function EditEntryDialog({ open, onClose, onSuccess, entry }: EditEntryDialogProps) {
    const { isOnline } = useOnlineStatus();
    const [formData, setFormData] = useState({
        description: '',
        date: '',
        categoryId: '',
        departmentId: '',
        amount: '',
        reconciled: false,
        hasDifferentPostedDate: false,
        postedDate: '',
        usePostedDateForFiscalYear: false,
    });

    const [result] = useQuery<FormDataQuery>({ query: GET_FORM_DATA });
    const [, updateEntry] = useMutation(UPDATE_ENTRY_MUTATION);
    const [, updateRefund] = useMutation(UPDATE_REFUND_MUTATION);
    const [error, setError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false); // Toggle for history viewer

    const isRefund = entry?.isRefund || false;
    const entryData = entry as EntryValue | null;

    const { data, fetching } = result;

    const getInitialFormData = useCallback((): typeof formData => {
        if (!entry || !open) {
            return {
                description: '',
                date: '',
                categoryId: '',
                departmentId: '',
                amount: '',
                reconciled: false,
                hasDifferentPostedDate: false,
                postedDate: '',
                usePostedDateForFiscalYear: false,
            };
        }

        let amountStr = '';
        if (entry.total) {
            try {
                const t: FormAmountRational = typeof entry.total === 'string' ? JSON.parse(entry.total) : entry.total;
                if (t && t.n !== undefined && t.d !== undefined) {
                    amountStr = (t.n / t.d).toFixed(2);
                }
            } catch {
                amountStr = '';
            }
        }

        return {
            description: entry.description || '',
            date: entry.date ? entry.date.split('T')[0] : '',
            categoryId: entry.category?.id || '',
            departmentId: entry.department?.id || '',
            amount: amountStr,
            reconciled: entry.reconciled || false,
            hasDifferentPostedDate: !!entry.dateOfRecord?.date,
            postedDate: entry.dateOfRecord?.date ? entry.dateOfRecord.date.split('T')[0] : '',
            usePostedDateForFiscalYear: entry.dateOfRecord?.overrideFiscalYear || false,
        };
    }, [entry, open]);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            setFormData(getInitialFormData());
        }, 0);
        return () => clearTimeout(timer);
    }, [entry, open, getInitialFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!entry) return;

        if (!isOnline) {
            setError('Cannot save while offline. Please reconnect and try again.');
            return;
        }

        try {
            const amountFloat = parseFloat(formData.amount);
            if (isNaN(amountFloat) || amountFloat === 0) {
                setError('Invalid amount');
                return;
            }

            const rational = JSON.stringify({
                s: 1,
                n: Math.abs(Math.round(amountFloat * 100)),
                d: 100,
            });

            let response;

            if (isRefund && entryData) {
                const refundInput = {
                    id: entryData.id,
                    description: formData.description,
                    date: formData.date,
                    total: rational,
                    reconciled: formData.reconciled,
                    ...(formData.hasDifferentPostedDate && formData.postedDate && {
                        dateOfRecord: {
                            date: formData.postedDate,
                            overrideFiscalYear: formData.usePostedDateForFiscalYear,
                        },
                    }),
                };
                response = await updateRefund({ input: refundInput });
            } else if (entryData) {
                const input = {
                    id: entryData.id,
                    description: formData.description,
                    date: formData.date,
                    category: formData.categoryId,
                    department: formData.departmentId,
                    total: rational,
                    reconciled: formData.reconciled,
                    ...(formData.hasDifferentPostedDate && formData.postedDate && {
                        dateOfRecord: {
                            date: formData.postedDate,
                            overrideFiscalYear: formData.usePostedDateForFiscalYear,
                        },
                    }),
                };
                response = await updateEntry({ input });
            }

            if (!response) {
                setError('Unable to build update request');
                return;
            }

            if (response.error) {
                setError(response.error.message);
            } else {
                onSuccess();
                onClose();
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update entry');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isRefund ? 'Edit Refund' : 'Edit Transaction'}
                    <Tooltip title="View Edit History">
                        <IconButton onClick={() => setShowHistory(true)} size="small">
                            <HistoryIcon />
                        </IconButton>
                    </Tooltip>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        {error && <Alert severity="error">{error}</Alert>}

                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.hasDifferentPostedDate}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        hasDifferentPostedDate: e.target.checked,
                                        postedDate: e.target.checked ? formData.postedDate : '',
                                        usePostedDateForFiscalYear: e.target.checked ? formData.usePostedDateForFiscalYear : false,
                                    })}
                                />
                            }
                            label="Different posted date (when bank charged/credited)"
                        />

                        {formData.hasDifferentPostedDate && (
                            <Box sx={{ pl: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Posted Date"
                                    type="date"
                                    value={formData.postedDate}
                                    onChange={(e) => setFormData({ ...formData, postedDate: e.target.value })}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    helperText="Date the transaction appeared on the bank statement"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.usePostedDateForFiscalYear}
                                            onChange={(e) => setFormData({ ...formData, usePostedDateForFiscalYear: e.target.checked })}
                                        />
                                    }
                                    label="Use posted date for fiscal year assignment"
                                />
                            </Box>
                        )}

                        {!isRefund && (
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={formData.categoryId}
                                    label="Category"
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    disabled={fetching}
                                >
                                    {data?.categories.map((cat: { id: string; name: string; type: string }) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.name} ({cat.type})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {!isRefund && (
                            <FormControl fullWidth required>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    value={formData.departmentId}
                                    label="Department"
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    disabled={fetching}
                                >
                                    {data?.departments.map((dept: { id: string; name: string }) => (
                                        <MenuItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <TextField
                            label="Amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                            fullWidth
                            inputProps={{ step: '0.01', min: '0.01' }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.reconciled}
                                    onChange={(e) => setFormData({ ...formData, reconciled: e.target.checked })}
                                />
                            }
                            label="Reconciled"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={fetching} startIcon={<SaveIcon />}>
                        Save Changes
                    </Button>
                </DialogActions>
            </form>

            <EditHistoryViewer
                entryId={entryData?.id || ''}
                open={showHistory}
                onClose={() => setShowHistory(false)}
            />
        </Dialog>
    );
}
