import { useState, useEffect, useCallback, useMemo } from 'react';
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
    Divider,
    FormLabel,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';
import { History as HistoryIcon, Save as SaveIcon } from '@mui/icons-material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { useMutation, useQuery } from 'urql';
import { useOnlineStatus } from '../context/OnlineStatusContext';
import EditHistoryViewer from './EditHistoryViewer';
import PersonAutocomplete from './PersonAutocomplete';
import BusinessAutocomplete from './BusinessAutocomplete';
import type { EntrySource, PaymentMethod } from '../types/transactions';
import type { PersonRecord, BusinessRecord } from '../types/filterOptions';

const GET_FORM_DATA = `
  query GetFormData {
    categories {
        id
        name
        type
        allowStandalone
        children {
            id
        }
    }
    departments {
        id
        name
    }
    accountCards(where: { active: true }) {
        id
        trailingDigits
        type
        label
        account {
            name
        }
    }
    businesses {
        id
        name
        hidden
    }
    people {
        id
        name {
            first
            last
        }
        hidden
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
        paymentMethod?: PaymentMethod;
        source?: EntrySource;
    } | null;
}

type EntryValue = NonNullable<EditEntryDialogProps['entry']>;
interface FormAmountRational {
    n: number;
    d: number;
}

interface AccountCardRecord {
    id: string;
    trailingDigits: string;
    type: string;
    label?: string | null;
    account?: { name?: string } | null;
}

interface FormDataQuery {
    categories: Array<{ id: string; name: string; type: string }>;
    departments: Array<{ id: string; name: string }>;
    accountCards: AccountCardRecord[];
    businesses: BusinessRecord[];
    people: PersonRecord[];
}

type PaymentType = 'CASH' | 'CHECK' | 'CARD' | 'ONLINE';
type SourceType = 'person' | 'business' | 'new_person' | 'new_business';

const DEFAULT_FORM_DATA = {
    description: '',
    date: '',
    categoryId: '',
    departmentId: '',
    amount: '',
    reconciled: false,
    hasDifferentPostedDate: false,
    postedDate: '',
    usePostedDateForFiscalYear: false,
    paymentType: 'CASH' as PaymentType,
    checkNumber: '',
    selectedCardId: '',
    sourceType: 'person' as SourceType,
    sourceId: '',
    newPersonFirst: '',
    newPersonLast: '',
    newBusinessName: '',
};

// Derives the payment method fields from an existing entry/refund's
// paymentMethod so the edit form starts pre-filled with its current value
// instead of always defaulting to Cash.
function paymentMethodToFormFields(paymentMethod: PaymentMethod | undefined) {
    if (!paymentMethod) {
        return { paymentType: 'CASH' as PaymentType, checkNumber: '', selectedCardId: '' };
    }
    switch (paymentMethod.__typename) {
        case 'PaymentMethodCard':
            return { paymentType: 'CARD' as PaymentType, checkNumber: '', selectedCardId: paymentMethod.card?.id || '' };
        case 'PaymentMethodCheck':
            return { paymentType: 'CHECK' as PaymentType, checkNumber: paymentMethod.check?.checkNumber || '', selectedCardId: '' };
        case 'PaymentMethodOnline':
            return { paymentType: 'ONLINE' as PaymentType, checkNumber: '', selectedCardId: '' };
        default:
            return { paymentType: 'CASH' as PaymentType, checkNumber: '', selectedCardId: '' };
    }
}

// Only Person/Business sources are editable here (matching the New
// Transaction dialog, which only ever creates Person/Business sources) - a
// rare Department-sourced entry is left as-is rather than risk corrupting it.
function isEditableSource(source: EntrySource | undefined): source is NonNullable<EntrySource> {
    return source?.__typename === 'Person' || source?.__typename === 'Business';
}

function sourceToFormFields(source: EntrySource | undefined) {
    if (source?.__typename === 'Person') {
        return { sourceType: 'person' as SourceType, sourceId: source.id };
    }
    if (source?.__typename === 'Business') {
        return { sourceType: 'business' as SourceType, sourceId: source.id };
    }
    return { sourceType: 'person' as SourceType, sourceId: '' };
}

export default function EditEntryDialog({ open, onClose, onSuccess, entry }: EditEntryDialogProps) {
    const { isOnline } = useOnlineStatus();
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

    const [result] = useQuery<FormDataQuery>({ query: GET_FORM_DATA });
    const [, updateEntry] = useMutation(UPDATE_ENTRY_MUTATION);
    const [, updateRefund] = useMutation(UPDATE_REFUND_MUTATION);
    const [error, setError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false); // Toggle for history viewer

    const isRefund = entry?.isRefund || false;
    const entryData = entry as EntryValue | null;
    const sourceEditable = isEditableSource(entryData?.source);

    const { data, fetching } = result;

    const personOptions = useMemo(() => {
        const seen = new Set<string>();
        return (data?.people || [])
            .filter((person: PersonRecord) => {
                if (person.hidden) return false;
                const key = `${person.name?.first || ''} ${person.name?.last || ''}`.toLowerCase().trim();
                if (seen.has(key) || !key) return false;
                seen.add(key);
                return true;
            })
            .map((person: PersonRecord) => ({
                id: person.id,
                label: `${person.name.first} ${person.name.last}`,
                firstName: person.name.first,
                lastName: person.name.last,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [data?.people]);

    const businessOptions = useMemo(() => {
        const seen = new Set<string>();
        return (data?.businesses || [])
            .filter((biz: BusinessRecord) => {
                if (biz.hidden) return false;
                const key = (biz.name || '').toLowerCase().trim();
                if (seen.has(key) || !key) return false;
                seen.add(key);
                return true;
            })
            .map((biz: BusinessRecord) => ({ id: biz.id, label: biz.name }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [data?.businesses]);

    const getInitialFormData = useCallback((): typeof formData => {
        if (!entry || !open) {
            return DEFAULT_FORM_DATA;
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
            newPersonFirst: '',
            newPersonLast: '',
            newBusinessName: '',
            ...paymentMethodToFormFields(entry.paymentMethod),
            ...sourceToFormFields(entry.source),
        };
    }, [entry, open]);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            setFormData(getInitialFormData());
        }, 0);
        return () => clearTimeout(timer);
    }, [entry, open, getInitialFormData]);

    const buildPaymentMethod = () => ({
        ...(formData.paymentType === 'CASH' && { cash: { currency: 'USD' } }),
        ...(formData.paymentType === 'CHECK' && {
            check: { currency: 'USD', check: { checkNumber: formData.checkNumber } },
        }),
        ...(formData.paymentType === 'CARD' && formData.selectedCardId && {
            accountCard: { card: formData.selectedCardId, currency: 'USD' },
        }),
        ...(formData.paymentType === 'ONLINE' && { online: { currency: 'USD' } }),
    });

    const buildSource = () => {
        if (formData.sourceType === 'person' && formData.sourceId) {
            return { source: { type: 'PERSON', id: formData.sourceId } };
        }
        if (formData.sourceType === 'business' && formData.sourceId) {
            return { source: { type: 'BUSINESS', id: formData.sourceId } };
        }
        if (formData.sourceType === 'new_person') {
            return { person: { name: { first: formData.newPersonFirst, last: formData.newPersonLast } } };
        }
        if (formData.sourceType === 'new_business') {
            return { business: { name: formData.newBusinessName } };
        }
        return null;
    };

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

            if (formData.paymentType === 'CARD' && !formData.selectedCardId) {
                setError('Please select a card');
                return;
            }
            if (formData.paymentType === 'CHECK' && !formData.checkNumber.trim()) {
                setError('Please enter a check number');
                return;
            }

            if (!isRefund && sourceEditable) {
                if ((formData.sourceType === 'person' || formData.sourceType === 'business') && !formData.sourceId) {
                    setError('Please select a source');
                    return;
                }
                if (formData.sourceType === 'new_person' && (!formData.newPersonFirst.trim() || !formData.newPersonLast.trim())) {
                    setError('Please enter first and last name');
                    return;
                }
                if (formData.sourceType === 'new_business' && !formData.newBusinessName.trim()) {
                    setError('Please enter a business name');
                    return;
                }
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
                    paymentMethod: buildPaymentMethod(),
                    ...(formData.hasDifferentPostedDate && formData.postedDate && {
                        dateOfRecord: {
                            date: formData.postedDate,
                            overrideFiscalYear: formData.usePostedDateForFiscalYear,
                        },
                    }),
                };
                response = await updateRefund({ input: refundInput });
            } else if (entryData) {
                const builtSource = sourceEditable ? buildSource() : null;
                const input = {
                    id: entryData.id,
                    description: formData.description,
                    date: formData.date,
                    category: formData.categoryId,
                    department: formData.departmentId,
                    total: rational,
                    reconciled: formData.reconciled,
                    paymentMethod: buildPaymentMethod(),
                    ...(builtSource && { source: builtSource }),
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
                                    {data?.categories
                                        .filter((cat: { id: string; allowStandalone?: boolean; children?: { id: string }[] }) =>
                                            // Exclude "group" categories (have children, not flagged
                                            // allowStandalone) - the backend rejects assigning an entry
                                            // directly to one ("select a specific subcategory"). Always
                                            // keep the entry's current category selectable even if it's
                                            // a legacy group category, so the field doesn't go blank.
                                            cat.id === formData.categoryId || cat.allowStandalone || !cat.children || cat.children.length === 0
                                        )
                                        .map((cat: { id: string; name: string; type: string }) => (
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

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    value={formData.paymentType}
                                    label="Payment Method"
                                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as PaymentType })}
                                >
                                    <MenuItem value="CASH">Cash</MenuItem>
                                    <MenuItem value="CHECK">Check</MenuItem>
                                    <MenuItem value="CARD">Card</MenuItem>
                                    <MenuItem value="ONLINE">Online</MenuItem>
                                </Select>
                            </FormControl>

                            {formData.paymentType === 'CHECK' && (
                                <TextField
                                    label="Check Number"
                                    value={formData.checkNumber}
                                    onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
                                    required
                                    fullWidth
                                />
                            )}
                        </Box>

                        {formData.paymentType === 'CARD' && (
                            <FormControl fullWidth required>
                                <InputLabel>Select Card</InputLabel>
                                <Select
                                    value={formData.selectedCardId}
                                    label="Select Card"
                                    onChange={(e) => setFormData({ ...formData, selectedCardId: e.target.value })}
                                    disabled={fetching}
                                >
                                    {data?.accountCards.map((card) => (
                                        <MenuItem key={card.id} value={card.id}>
                                            {card.label ? `${card.label} - ` : ''}{card.type} ****{card.trailingDigits}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {!isRefund && sourceEditable && (
                            <>
                                <Divider sx={{ my: 1 }} />

                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Source (Who is paying / receiving)</FormLabel>
                                    <RadioGroup
                                        row
                                        value={formData.sourceType}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            sourceType: e.target.value as SourceType,
                                            sourceId: '',
                                        })}
                                    >
                                        <FormControlLabel
                                            value="person"
                                            control={<Radio size="small" />}
                                            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PersonIcon fontSize="small" /> Existing Person</Box>}
                                        />
                                        <FormControlLabel
                                            value="business"
                                            control={<Radio size="small" />}
                                            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><BusinessIcon fontSize="small" /> Existing Business</Box>}
                                        />
                                        <FormControlLabel
                                            value="new_person"
                                            control={<Radio size="small" />}
                                            label="New Person"
                                        />
                                        <FormControlLabel
                                            value="new_business"
                                            control={<Radio size="small" />}
                                            label="New Business"
                                        />
                                    </RadioGroup>
                                </FormControl>

                                {formData.sourceType === 'person' && (
                                    <PersonAutocomplete
                                        people={personOptions}
                                        value={formData.sourceId}
                                        onChange={(personId) => setFormData({ ...formData, sourceId: personId })}
                                        disabled={fetching}
                                        label="Search Person"
                                    />
                                )}

                                {formData.sourceType === 'business' && (
                                    <BusinessAutocomplete
                                        businesses={businessOptions}
                                        value={formData.sourceId}
                                        onChange={(businessId) => setFormData({ ...formData, sourceId: businessId })}
                                        disabled={fetching}
                                        label="Search Business"
                                    />
                                )}

                                {formData.sourceType === 'new_person' && (
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <TextField
                                            label="First Name"
                                            value={formData.newPersonFirst}
                                            onChange={(e) => setFormData({ ...formData, newPersonFirst: e.target.value })}
                                            required
                                            fullWidth
                                        />
                                        <TextField
                                            label="Last Name"
                                            value={formData.newPersonLast}
                                            onChange={(e) => setFormData({ ...formData, newPersonLast: e.target.value })}
                                            required
                                            fullWidth
                                        />
                                    </Box>
                                )}

                                {formData.sourceType === 'new_business' && (
                                    <TextField
                                        label="Business Name"
                                        value={formData.newBusinessName}
                                        onChange={(e) => setFormData({ ...formData, newBusinessName: e.target.value })}
                                        required
                                        fullWidth
                                    />
                                )}

                                <Divider sx={{ my: 1 }} />
                            </>
                        )}

                        {!isRefund && !sourceEditable && (
                            <Typography variant="caption" color="text.secondary">
                                This transaction's source can't be edited here.
                            </Typography>
                        )}

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
