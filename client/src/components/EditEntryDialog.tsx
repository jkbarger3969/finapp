import { useState, useEffect } from 'react';
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

interface EditEntryDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    entry: any; // TODO: Type properly
}

export default function EditEntryDialog({ open, onClose, onSuccess, entry }: EditEntryDialogProps) {
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

    const [result] = useQuery({ query: GET_FORM_DATA });
    const [, updateEntry] = useMutation(UPDATE_ENTRY_MUTATION);
    const [error, setError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false); // Toggle for history viewer

    const { data, fetching } = result;

    useEffect(() => {
        if (entry && open) {
            // Parse rational amount
            let amountStr = '';
            if (entry.total) {
                try {
                    // Check if total is string or object
                    const t = typeof entry.total === 'string' ? JSON.parse(entry.total) : entry.total;
                    if (t && t.n !== undefined && t.d !== undefined) {
                        const val = (t.n / t.d).toFixed(2);
                        amountStr = val;
                    }
                } catch (e) {
                    console.error("Failed to parse total", e);
                }
            }

            setFormData({
                description: entry.description || '',
                date: entry.date ? entry.date.split('T')[0] : '', // Handle DateTime if needed
                categoryId: entry.category?.id || '',
                departmentId: entry.department?.id || '',
                amount: amountStr,
                reconciled: entry.reconciled || false,
                hasDifferentPostedDate: !!entry.dateOfRecord?.date,
                postedDate: entry.dateOfRecord?.date ? entry.dateOfRecord.date.split('T')[0] : '',
                usePostedDateForFiscalYear: entry.dateOfRecord?.overrideFiscalYear || false,
            });
        }
    }, [entry, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

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

            const input = {
                id: entry.id,
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

            const response = await updateEntry({ input });

            if (response.error) {
                setError(response.error.message);
            } else {
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update entry');
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
                    Edit Transaction
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

                        <FormControl fullWidth required>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.categoryId}
                                label="Category"
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                disabled={fetching}
                            >
                                {data?.categories.map((cat: any) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name} ({cat.type})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={formData.departmentId}
                                label="Department"
                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                disabled={fetching}
                            >
                                {data?.departments.map((dept: any) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

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
                entryId={entry?.id}
                open={showHistory}
                onClose={() => setShowHistory(false)}
            />
        </Dialog>
    );
}
