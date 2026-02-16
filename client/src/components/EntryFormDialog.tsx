import { useState, useEffect, useMemo } from 'react';
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
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Chip,
    InputAdornment,
    RadioGroup,
    Radio,
    FormLabel,
    Divider,
    Fade,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useOnlineStatus } from '../context/OnlineStatusContext';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SaveIcon from '@mui/icons-material/Save';
import { useMutation, useQuery } from 'urql';
import CategoryAutocomplete from './CategoryAutocomplete';
import PersonAutocomplete from './PersonAutocomplete';
import BusinessAutocomplete from './BusinessAutocomplete';

const GET_FORM_DATA = `
  query GetFormData {
    categories {
      id
      name
      displayName
      type
      hidden
      groupName
      sortOrder
    }
    departments {
      id
      name
    }
    accountCards(where: { active: true }) {
      id
      trailingDigits
      type
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

const SEARCH_ENTRIES = `
  query SearchEntries($where: EntriesWhere!) {
    entries(where: $where) {
      id
      description
      date
      total
      department {
        id
        name
      }
      category {
        id
        name
        type
      }
      refunds {
        id
        total
      }
    }
  }
`;

const ADD_ENTRY_MUTATION = `
  mutation AddEntry($input: NewEntry!) {
    addNewEntry(input: $input) {
      newEntry {
        id
        description
        date
        total
      }
    }
  }
`;

const ADD_REFUND_MUTATION = `
  mutation AddRefund($input: NewEntryRefund!) {
    addNewEntryRefund(input: $input) {
      newEntryRefund {
        id
        date
        total
      }
    }
  }
`;

interface EntryFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialEntryType?: 'transaction' | 'refund';
    initialSelectedEntry?: any;
}

function formatRational(rational: any): number {
    if (!rational) return 0;
    const r = typeof rational === 'string' ? JSON.parse(rational) : rational;
    return (r.s * r.n) / r.d;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

export default function EntryFormDialog({ open, onClose, onSuccess, initialEntryType, initialSelectedEntry }: EntryFormDialogProps) {
    const { isOnline } = useOnlineStatus();
    const [entryType, setEntryType] = useState<'transaction' | 'refund'>(initialEntryType || 'transaction');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchAmount, setSearchAmount] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [debouncedAmount, setDebouncedAmount] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<any>(initialSelectedEntry || null);

    const [formData, setFormData] = useState({
        description: '',
        date: new Date().toISOString().split('T')[0],
        hasDifferentPostedDate: false,
        postedDate: '',
        usePostedDateForFiscalYear: false,
        categoryId: '',
        departmentId: '',
        amount: '',
        reconciled: false,
        paymentType: 'CASH',
        checkNumber: '',
        cardType: 'VISA',
        cardLast4: '',
        selectedCardId: '',
        useSavedCard: true,
        sourceType: 'person' as 'person' | 'business' | 'new_person' | 'new_business',
        sourceId: '',
        newPersonFirst: '',
        newPersonLast: '',
        newBusinessName: '',
        isVoidCheck: false,
    });

    // Sync with initial props when dialog opens
    useEffect(() => {
        if (open) {
            if (initialEntryType) {
                setEntryType(initialEntryType);
            }
            if (initialSelectedEntry) {
                setSelectedEntry(initialSelectedEntry);
            }
        }
    }, [open, initialEntryType, initialSelectedEntry]);

    // Debounce search terms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setDebouncedAmount(searchAmount);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, searchAmount]);

    // Build search where clause
    const buildSearchWhere = () => {
        const conditions: any[] = [];

        if (debouncedSearch.length >= 2) {
            conditions.push({
                description: { pattern: debouncedSearch, flags: ['I'] }
            });
        }

        if (debouncedAmount) {
            const amountNum = parseFloat(debouncedAmount);
            if (!isNaN(amountNum)) {
                const rational = JSON.stringify({ s: 1, n: Math.round(amountNum * 100), d: 100 });
                conditions.push({ total: { eq: rational } });
            }
        }

        if (conditions.length === 0) {
            return null;
        }

        if (conditions.length === 1) {
            return conditions[0];
        }

        return { or: conditions };
    };

    const searchWhere = buildSearchWhere();
    const shouldSearch = searchWhere !== null;

    const [result] = useQuery({ query: GET_FORM_DATA });
    const [searchResult] = useQuery({
        query: SEARCH_ENTRIES,
        variables: { where: searchWhere || {} },
        pause: !shouldSearch,
        requestPolicy: 'network-only',
    });

    const [, addEntry] = useMutation(ADD_ENTRY_MUTATION);
    const [, addRefund] = useMutation(ADD_REFUND_MUTATION);
    const [error, setError] = useState<string | null>(null);

    const { data, fetching } = result;
    const searchedEntries = searchResult.data?.entries || [];

    const personOptions = useMemo(() => {
        const seen = new Set<string>();
        return (data?.people || [])
            .filter((person: any) => {
                if (person.hidden) return false;
                const key = `${person.name?.first || ''} ${person.name?.last || ''}`.toLowerCase().trim();
                if (seen.has(key) || !key) return false;
                seen.add(key);
                return true;
            })
            .map((person: any) => ({
                id: person.id,
                label: `${person.name.first} ${person.name.last}`,
                firstName: person.name.first,
                lastName: person.name.last,
            }))
            .sort((a: any, b: any) => a.label.localeCompare(b.label));
    }, [data?.people]);

    const businessOptions = useMemo(() => {
        const seen = new Set<string>();
        return (data?.businesses || [])
            .filter((biz: any) => {
                if (biz.hidden) return false;
                const key = (biz.name || '').toLowerCase().trim();
                if (seen.has(key) || !key) return false;
                seen.add(key);
                return true;
            })
            .map((biz: any) => ({
                id: biz.id,
                label: biz.name,
            }))
            .sort((a: any, b: any) => a.label.localeCompare(b.label));
    }, [data?.businesses]);

    const categoryOptions = useMemo(() => {
        return (data?.categories || []).map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            displayName: cat.displayName,
            type: cat.type,
            groupName: cat.groupName,
            sortOrder: cat.sortOrder,
            hidden: cat.hidden,
        }));
    }, [data?.categories]);

    const calculateRemainingRefund = (entry: any): number => {
        const total = formatRational(entry.total);
        const refundedAmount = entry.refunds?.reduce((sum: number, r: any) => {
            return sum + Math.abs(formatRational(r.total));
        }, 0) || 0;
        return Math.abs(total) - refundedAmount;
    };



    const buildPaymentMethod = () => {
        return {
            ...(formData.paymentType === 'CASH' && { cash: { currency: 'USD' } }),
            ...(formData.paymentType === 'CHECK' && {
                check: {
                    currency: 'USD',
                    check: { checkNumber: formData.checkNumber }
                }
            }),
            ...(formData.paymentType === 'CARD' && (
                formData.useSavedCard && formData.selectedCardId ? {
                    accountCard: {
                        card: formData.selectedCardId,
                        currency: 'USD'
                    }
                } : {
                    card: {
                        currency: 'USD',
                        card: {
                            type: formData.cardType,
                            trailingDigits: formData.cardLast4
                        }
                    }
                }
            )),
            ...(formData.paymentType === 'ONLINE' && { online: { currency: 'USD' } }),
        };
    };

    const buildSource = () => {
        if (formData.sourceType === 'person' && formData.sourceId) {
            return { source: { type: 'PERSON', id: formData.sourceId } };
        }
        if (formData.sourceType === 'business' && formData.sourceId) {
            return { source: { type: 'BUSINESS', id: formData.sourceId } };
        }
        if (formData.sourceType === 'new_person') {
            return {
                person: {
                    name: {
                        first: formData.newPersonFirst,
                        last: formData.newPersonLast,
                    }
                }
            };
        }
        if (formData.sourceType === 'new_business') {
            return {
                business: {
                    name: formData.newBusinessName,
                }
            };
        }
        return {
            person: {
                name: { first: 'Unknown', last: 'Person' }
            }
        };
    };

    const resetForm = (keepDate: boolean = false) => {
        setFormData(prev => ({
            description: '',
            date: keepDate ? prev.date : new Date().toISOString().split('T')[0],
            hasDifferentPostedDate: false,
            postedDate: '',
            usePostedDateForFiscalYear: false,
            categoryId: '',
            departmentId: prev.departmentId, // Keep department for convenience
            amount: '',
            reconciled: false,
            paymentType: 'CASH',
            checkNumber: '',
            cardType: 'VISA',
            cardLast4: '',
            selectedCardId: '',
            useSavedCard: true,
            sourceType: 'person',
            sourceId: '',
            newPersonFirst: '',
            newPersonLast: '',
            newBusinessName: '',
            isVoidCheck: false,
        }));
        setEntryType('transaction');
        setSelectedEntry(null);
        setSearchTerm('');
        setSearchAmount('');
        setDebouncedSearch('');
        setDebouncedAmount('');
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // State to track if we should close or keep open
    const [keepOpen, setKeepOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isOnline) {
            setError('Cannot save while offline. Please reconnect and try again.');
            return;
        }

        try {
            const amountFloat = parseFloat(formData.amount);
            if (isNaN(amountFloat) || amountFloat <= 0) {
                setError('Invalid amount - must be greater than zero');
                return;
            }

            if (entryType === 'refund') {
                if (!selectedEntry) {
                    setError('Please select an original transaction for this refund');
                    return;
                }

                const remaining = calculateRemainingRefund(selectedEntry);
                if (amountFloat > remaining) {
                    setError(`Refund amount exceeds remaining balance of ${formatCurrency(remaining)}`);
                    return;
                }

                const rational = JSON.stringify({
                    s: 1,
                    n: Math.round(amountFloat * 100),
                    d: 100,
                });

                const refundInput = {
                    entry: selectedEntry.id,
                    date: formData.date,
                    description: formData.description || `Refund for: ${selectedEntry.description}`,
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

                const response = await addRefund({ input: refundInput });

                if (response.error) {
                    setError(response.error.message);
                } else {
                    if (keepOpen) {
                        resetForm(true); // Keep date
                        setError(null); // Clear any errors
                    } else {
                        onSuccess();
                        handleClose();
                    }
                }
            } else {
                const rational = JSON.stringify({
                    s: 1,
                    n: Math.round(amountFloat * 100),
                    d: 100,
                });

                const input = {
                    description: formData.description,
                    date: formData.date,
                    category: formData.categoryId,
                    department: formData.departmentId,
                    total: rational,
                    reconciled: formData.reconciled,
                    paymentMethod: buildPaymentMethod(),
                    source: buildSource(),
                    ...(formData.hasDifferentPostedDate && formData.postedDate && {
                        dateOfRecord: {
                            date: formData.postedDate,
                            overrideFiscalYear: formData.usePostedDateForFiscalYear,
                        },
                    }),
                };

                const response = await addEntry({ input });

                if (response.error) {
                    setError(response.error.message);
                } else {
                    if (keepOpen) {
                        resetForm(true); // Keep date
                        setError(null);
                    } else {
                        onSuccess();
                        handleClose();
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create entry');
        } finally {
            // Reset the flag
            setKeepOpen(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {entryType === 'transaction' ? 'New Transaction' : 'Record Refund'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        {error && <Alert severity="error">{error}</Alert>}

                        <ToggleButtonGroup
                            value={entryType}
                            exclusive
                            onChange={(_, value) => value && setEntryType(value)}
                            fullWidth
                            size="small"
                        >
                            <ToggleButton value="transaction">
                                New Transaction
                            </ToggleButton>
                            <ToggleButton value="refund">
                                Record Refund
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {entryType === 'refund' && (
                            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Search for Original Transaction
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField
                                        label="Search by description"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        size="small"
                                        fullWidth
                                        placeholder="Type 2+ characters..."
                                    />
                                    <TextField
                                        label="Search by amount"
                                        value={searchAmount}
                                        onChange={(e) => setSearchAmount(e.target.value)}
                                        size="small"
                                        type="number"
                                        sx={{ width: 150 }}
                                        placeholder="e.g. 50.00"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                    />
                                </Box>

                                {searchResult.fetching && (
                                    <Typography variant="caption" color="text.secondary">
                                        Searching...
                                    </Typography>
                                )}

                                {!searchResult.fetching && shouldSearch && searchedEntries.length === 0 && (
                                    <Typography variant="caption" color="text.secondary">
                                        No transactions found
                                    </Typography>
                                )}

                                {searchedEntries.length > 0 && (
                                    <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                        {searchedEntries.map((entry: any) => {
                                            const total = Math.abs(formatRational(entry.total));
                                            const remaining = calculateRemainingRefund(entry);
                                            const hasPartialRefund = remaining < total;
                                            const isSelected = selectedEntry?.id === entry.id;

                                            return (
                                                <Box
                                                    key={entry.id}
                                                    onClick={() => {
                                                        setSelectedEntry(entry);
                                                        const rem = calculateRemainingRefund(entry);
                                                        setFormData({
                                                            ...formData,
                                                            amount: rem.toFixed(2),
                                                            departmentId: entry.department?.id || formData.departmentId,
                                                        });
                                                    }}
                                                    sx={{
                                                        p: 1.5,
                                                        cursor: 'pointer',
                                                        bgcolor: isSelected ? 'primary.light' : 'background.paper',
                                                        '&:hover': { bgcolor: isSelected ? 'primary.light' : 'action.hover' },
                                                        borderBottom: '1px solid',
                                                        borderColor: 'divider',
                                                        '&:last-child': { borderBottom: 'none' }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="body2" fontWeight={isSelected ? 'bold' : 'normal'}>
                                                            {entry.description}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {formatCurrency(total)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {entry.date} - {entry.department?.name} - {entry.category?.name}
                                                        </Typography>
                                                        {hasPartialRefund && (
                                                            <Chip
                                                                label={`${formatCurrency(remaining)} remaining`}
                                                                size="small"
                                                                color="warning"
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}

                                {selectedEntry && (
                                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="body2" fontWeight="bold">
                                            {selectedEntry.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                            <Typography variant="caption">
                                                Original: {formatCurrency(Math.abs(formatRational(selectedEntry.total)))}
                                            </Typography>
                                            <Typography variant="caption" color="success.main">
                                                Available for refund: {formatCurrency(calculateRemainingRefund(selectedEntry))}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}

                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required={entryType === 'transaction'}
                            fullWidth
                            placeholder={entryType === 'refund' && selectedEntry ? `Refund for: ${selectedEntry.description}` : ''}
                        />

                        <TextField
                            label="Transaction Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            helperText="When the purchase/donation occurred"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.hasDifferentPostedDate}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        hasDifferentPostedDate: e.target.checked,
                                        postedDate: e.target.checked ? (formData.postedDate || formData.date) : '',
                                    })}
                                    size="small"
                                />
                            }
                            label="Different posted date"
                        />

                        {formData.hasDifferentPostedDate && (
                            <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <TextField
                                    label="Posted Date"
                                    type="date"
                                    value={formData.postedDate}
                                    onChange={(e) => setFormData({ ...formData, postedDate: e.target.value })}
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    helperText="When the bank processed the charge"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.usePostedDateForFiscalYear}
                                            onChange={(e) => setFormData({ ...formData, usePostedDateForFiscalYear: e.target.checked })}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2">Use posted date for fiscal year</Typography>}
                                />
                            </Box>
                        )}

                        {entryType === 'transaction' && (
                            <>
                                <CategoryAutocomplete
                                    categories={categoryOptions}
                                    value={formData.categoryId}
                                    onChange={(categoryId) => setFormData({ ...formData, categoryId })}
                                    disabled={fetching}
                                    required
                                />

                                <FormControl fullWidth required>
                                    <InputLabel>Department</InputLabel>
                                    <Select
                                        value={formData.departmentId}
                                        label="Department"
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        disabled={fetching}
                                    >
                                        {[...(data?.departments || [])]
                                            .sort((a: any, b: any) => a.name.localeCompare(b.name))
                                            .map((dept: any) => (
                                            <MenuItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Divider sx={{ my: 1 }} />

                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Source (Who is paying / receiving)</FormLabel>
                                    <RadioGroup
                                        row
                                        value={formData.sourceType}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            sourceType: e.target.value as any,
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
                            </>
                        )}

                        {entryType === 'refund' && selectedEntry?.paymentMethod?.__typename === 'PaymentMethodCheck' && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isVoidCheck}
                                        onChange={(e) => {
                                            const isVoid = e.target.checked;
                                            if (isVoid) {
                                                const remainingAmount = calculateRemainingRefund(selectedEntry);
                                                const originalCheckNumber = selectedEntry.paymentMethod?.check?.checkNumber || '';
                                                setFormData({
                                                    ...formData,
                                                    isVoidCheck: true,
                                                    amount: remainingAmount.toFixed(2),
                                                    paymentType: 'CHECK',
                                                    checkNumber: `VOID-${originalCheckNumber}`,
                                                    description: formData.description || `Void Check #${originalCheckNumber}`,
                                                });
                                            } else {
                                                setFormData({
                                                    ...formData,
                                                    isVoidCheck: false,
                                                    checkNumber: '',
                                                    paymentType: 'CASH',
                                                });
                                            }
                                        }}
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight="bold" color="warning.dark">
                                            Void Check #{selectedEntry.paymentMethod?.check?.checkNumber}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            (Full refund for voided check)
                                        </Typography>
                                    </Box>
                                }
                                sx={{
                                    mb: 2,
                                    p: 1.5,
                                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                                    border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                    borderRadius: 1,
                                    width: '100%',
                                    mx: 0,
                                }}
                            />
                        )}

                        <TextField
                            label={entryType === 'refund' ? 'Refund Amount' : 'Amount'}
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                            fullWidth
                            disabled={formData.isVoidCheck}
                            inputProps={{ step: '0.01', min: '0.01' }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            helperText={
                                entryType === 'refund' && selectedEntry
                                    ? formData.isVoidCheck
                                        ? 'Full amount for voided check'
                                        : `Max refund: ${formatCurrency(calculateRemainingRefund(selectedEntry))}`
                                    : entryType === 'transaction'
                                        ? "Enter amount (category type determines if income or expense)"
                                        : undefined
                            }
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    value={formData.paymentType}
                                    label="Payment Method"
                                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                    disabled={formData.isVoidCheck}
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
                                    disabled={formData.isVoidCheck}
                                    helperText={formData.isVoidCheck ? 'Auto-filled for void' : ''}
                                />
                            )}
                        </Box>

                        {formData.paymentType === 'CARD' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.useSavedCard}
                                            onChange={(e) => setFormData({ ...formData, useSavedCard: e.target.checked })}
                                        />
                                    }
                                    label="Use Saved Card"
                                />

                                {formData.useSavedCard ? (
                                    <FormControl fullWidth required>
                                        <InputLabel>Select Card</InputLabel>
                                        <Select
                                            value={formData.selectedCardId}
                                            label="Select Card"
                                            onChange={(e) => setFormData({ ...formData, selectedCardId: e.target.value })}
                                        >
                                            {data?.accountCards.map((card: any) => (
                                                <MenuItem key={card.id} value={card.id}>
                                                    {card.type} ****{card.trailingDigits} ({card.account?.name})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Card Type</InputLabel>
                                            <Select
                                                value={formData.cardType}
                                                label="Card Type"
                                                onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                                            >
                                                <MenuItem value="VISA">Visa</MenuItem>
                                                <MenuItem value="MASTER_CARD">MasterCard</MenuItem>
                                                <MenuItem value="AMERICAN_EXPRESS">Amex</MenuItem>
                                                <MenuItem value="DISCOVER">Discover</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            label="Last 4 Digits"
                                            value={formData.cardLast4}
                                            onChange={(e) => setFormData({ ...formData, cardLast4: e.target.value })}
                                            required
                                            fullWidth
                                            inputProps={{ maxLength: 4 }}
                                        />
                                    </Box>
                                )}
                            </Box>
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
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        type="submit"
                        disabled={fetching || (entryType === 'refund' && !selectedEntry)}
                        onClick={() => setKeepOpen(true)}
                        startIcon={<PlaylistAddIcon />}
                    >
                        Save & Add Another
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={fetching || (entryType === 'refund' && !selectedEntry)}
                        color={entryType === 'refund' ? 'success' : 'primary'}
                        onClick={() => setKeepOpen(false)}
                        startIcon={entryType === 'refund' ? <CurrencyExchangeIcon /> : <SaveIcon />}
                    >
                        {entryType === 'refund' ? 'Record Refund' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
