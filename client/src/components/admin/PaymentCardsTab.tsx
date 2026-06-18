import { useMemo, useState } from 'react';
import { useQuery, useMutation } from 'urql';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Alert,
    Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const GET_CARDS = `
  query GetAccountCards {
    accountCards {
      id
      trailingDigits
      type
      label
      active
      account {
        id
        name
      }
    }
    creditCardAccounts: accounts(where: { accountType: CREDIT_CARD, active: true }) {
       id
       name
    }
  }
`;

const CREATE_CARD = `
  mutation CreateCard($input: CreateAccountCardInput!) {
    createAccountCard(input: $input) {
      id
      trailingDigits
      type
      label
      active
    }
  }
`;

const UPDATE_CARD = `
  mutation UpdateCard($id: ID!, $input: UpdateAccountCardInput!) {
    updateAccountCard(id: $id, input: $input) {
      id
      trailingDigits
      type
      label
      active
    }
  }
`;

const DELETE_CARD = `
  mutation DeleteCard($id: ID!) {
    deleteAccountCard(id: $id)
  }
`;

interface CardAccount {
    id: string;
    name: string;
}

interface AccountCardRecord {
    id: string;
    trailingDigits: string;
    type: string;
    label?: string | null;
    active: boolean;
    account?: CardAccount | null;
}

interface CardsQueryData {
    accountCards: AccountCardRecord[];
    creditCardAccounts: CardAccount[];
}

interface CardMutationResult {
    error?: { message?: string };
}

export default function PaymentCardsTab() {
    const [result, reexecuteQuery] = useQuery<CardsQueryData>({ query: GET_CARDS });
    const { data, fetching, error } = result;

    const [createResult, createCard] = useMutation(CREATE_CARD);
    const [updateResult, updateCard] = useMutation(UPDATE_CARD);
    const [deleteResult, deleteCard] = useMutation(DELETE_CARD);

    // Error handling wrapper
    const handleMutationError = (res: CardMutationResult) => {
        if (res.error) console.error(res.error);
    };
    handleMutationError(createResult);
    handleMutationError(updateResult);
    handleMutationError(deleteResult);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<string | null>(null);
    const [editingCard, setEditingCard] = useState<AccountCardRecord | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
    const defaultAccountId = data?.creditCardAccounts?.[0]?.id || '';
    const [formData, setFormData] = useState({
        accountId: '',
        type: 'VISA',
        trailingDigits: '',
        label: '',
        active: true
    });

    const handleOpen = (card?: AccountCardRecord) => {
        if (card) {
            setEditingCard(card);
            setFormData({
                accountId: card.account?.id || '',
                type: card.type,
                trailingDigits: card.trailingDigits,
                label: card.label || '',
                active: card.active
            });
        } else {
            setEditingCard(null);
            setFormData({
                accountId: defaultAccountId,
                type: 'VISA',
                trailingDigits: '',
                label: '',
                active: true
            });
        }
        setFormError(null);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setEditingCard(null);
        setFormError(null);
    };

    const handleSubmit = async () => {
        const trailingDigits = formData.trailingDigits.trim();
        if (!/^\d{4}$/.test(trailingDigits)) {
            setFormError('Last 4 Digits must be exactly 4 numbers.');
            return;
        }

        if (editingCard) {
            const res = await updateCard({
                id: editingCard.id,
                input: {
                    type: formData.type,
                    trailingDigits,
                    label: formData.label || null,
                    active: formData.active
                }
            });
            if (res.error) {
                setFormError(res.error.message || 'Unable to update card.');
                return;
            }
        } else {
            if (!defaultAccountId) {
                setFormError('No active credit card account is available. Please create/activate one first.');
                return;
            }
            const res = await createCard({
                input: {
                    accountId: defaultAccountId,
                    type: formData.type,
                    trailingDigits,
                    label: formData.label || null,
                    active: formData.active
                }
            });
            if (res.error) {
                setFormError(res.error.message || 'Unable to create card.');
                return;
            }
        }
        await reexecuteQuery({ requestPolicy: 'network-only' });
        setSelectedCardIds([]);
        handleClose();
    };

    const handleDelete = async (id: string) => {
        setCardToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (cardToDelete) {
            await deleteCard({ id: cardToDelete });
            await reexecuteQuery({ requestPolicy: 'network-only' });
            setSelectedCardIds((prev) => prev.filter((id) => id !== cardToDelete));
        }
        setDeleteDialogOpen(false);
        setCardToDelete(null);
    };

    const sortedCards = useMemo(
        () =>
            [...(data?.accountCards || [])].sort((a: AccountCardRecord, b: AccountCardRecord) => {
                if (a.active !== b.active) return a.active ? -1 : 1;
                if (a.label && !b.label) return -1;
                if (!a.label && b.label) return 1;
                if (a.label && b.label) return a.label.localeCompare(b.label);
                return a.trailingDigits.localeCompare(b.trailingDigits);
            }),
        [data?.accountCards]
    );

    const allSelected = sortedCards.length > 0 && sortedCards.every((card) => selectedCardIds.includes(card.id));
    const someSelected = selectedCardIds.length > 0 && !allSelected;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedCardIds(sortedCards.map((card) => card.id));
            return;
        }
        setSelectedCardIds([]);
    };

    const handleSelectCard = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedCardIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
            return;
        }
        setSelectedCardIds((prev) => prev.filter((cardId) => cardId !== id));
    };

    const handleDeactivateSelected = async () => {
        if (!selectedCardIds.length) return;
        setFormError(null);
        const results = await Promise.all(
            selectedCardIds.map((id) =>
                updateCard({
                    id,
                    input: {
                        active: false,
                    },
                })
            )
        );
        const firstError = results.find((res) => res.error)?.error;
        if (firstError) {
            setFormError(firstError.message || 'Unable to deactivate selected cards.');
            return;
        }
        await reexecuteQuery({ requestPolicy: 'network-only' });
        setSelectedCardIds([]);
    };

    if (fetching) return <Typography>Loading...</Typography>;
    if (error) return <Alert severity="error">{error.message}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Payment Cards</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        disabled={!selectedCardIds.length}
                        onClick={handleDeactivateSelected}
                    >
                        Set Selected Inactive
                    </Button>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={() => handleOpen()}
                    >
                        Add Card
                    </Button>
                </Box>
            </Box>

            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={allSelected}
                                    indeterminate={someSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </TableCell>
                            <TableCell>Label</TableCell>
                            <TableCell>Last 4 Digits</TableCell>
                            <TableCell>Card Type</TableCell>
                            <TableCell>Bank Account</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCards.map((card: AccountCardRecord) => (
                            <TableRow key={card.id}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedCardIds.includes(card.id)}
                                        onChange={(e) => handleSelectCard(card.id, e.target.checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography fontWeight={card.label ? 600 : 400} color={card.label ? 'text.primary' : 'text.secondary'}>
                                        {card.label || '—'}
                                    </Typography>
                                </TableCell>
                                <TableCell>**** {card.trailingDigits}</TableCell>
                                <TableCell>{card.type}</TableCell>
                                <TableCell>{card.account?.name || 'Unknown'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={card.active ? "Active" : "Inactive"}
                                        color={card.active ? "success" : "default"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(card)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(card.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleClose}>
                <DialogTitle>{editingCard ? 'Edit Card' : 'Add New Card'}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
                    <FormControl fullWidth>
                        <InputLabel>Card Type</InputLabel>
                        <Select
                            value={formData.type}
                            label="Card Type"
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <MenuItem value="VISA">Visa</MenuItem>
                            <MenuItem value="MASTER_CARD">MasterCard</MenuItem>
                            <MenuItem value="AMERICAN_EXPRESS">Amex</MenuItem>
                            <MenuItem value="DISCOVER">Discover</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Last 4 Digits"
                        value={formData.trailingDigits}
                        onChange={(e) => setFormData({ ...formData, trailingDigits: e.target.value })}
                        inputProps={{ maxLength: 4 }}
                        fullWidth
                    />

                    <TextField
                        label="Card Label"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        placeholder="e.g., General, Kids, Students"
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={formData.active ? "true" : "false"}
                            label="Status"
                            onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
                        >
                            <MenuItem value="true">Active</MenuItem>
                            <MenuItem value="false">Inactive</MenuItem>
                        </Select>
                    </FormControl>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Card</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this card? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
