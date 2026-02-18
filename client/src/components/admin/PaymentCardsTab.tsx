import { useState } from 'react';
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
    Alert
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
    accounts(where: { accountType: CREDIT_CARD }) {
       id
       name
       # accountType
    }
    # Also fetch all accounts for the dropdown
    allAccounts: accounts {
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

export default function PaymentCardsTab() {
    const [result, reexecuteQuery] = useQuery({ query: GET_CARDS });
    const { data, fetching, error } = result;

    const [createResult, createCard] = useMutation(CREATE_CARD);
    const [updateResult, updateCard] = useMutation(UPDATE_CARD);
    const [deleteResult, deleteCard] = useMutation(DELETE_CARD);

    // Error handling wrapper
    const handleMutationError = (res: any) => {
        if (res.error) console.error(res.error);
    };
    handleMutationError(createResult);
    handleMutationError(updateResult);
    handleMutationError(deleteResult);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<string | null>(null);
    const [editingCard, setEditingCard] = useState<any>(null);
    const [formData, setFormData] = useState({
        accountId: '',
        type: 'VISA',
        trailingDigits: '',
        label: '',
        active: true
    });

    const handleOpen = (card?: any) => {
        if (card) {
            setEditingCard(card);
            setFormData({
                accountId: card.account.id,
                type: card.type,
                trailingDigits: card.trailingDigits,
                label: card.label || '',
                active: card.active
            });
        } else {
            setEditingCard(null);
            setFormData({
                accountId: '', // Needs to be selected
                type: 'VISA',
                trailingDigits: '',
                label: '',
                active: true
            });
        }
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setEditingCard(null);
    };

    const handleSubmit = async () => {
        if (editingCard) {
            await updateCard({
                id: editingCard.id,
                input: {
                    type: formData.type,
                    trailingDigits: formData.trailingDigits,
                    label: formData.label || null,
                    active: formData.active
                }
            });
        } else {
            await createCard({
                input: {
                    accountId: formData.accountId,
                    type: formData.type,
                    trailingDigits: formData.trailingDigits,
                    label: formData.label || null,
                    active: formData.active
                }
            });
        }
        reexecuteQuery({ requestPolicy: 'network-only' });
        handleClose();
    };

    const handleDelete = async (id: string) => {
        setCardToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (cardToDelete) {
            await deleteCard({ id: cardToDelete });
            reexecuteQuery({ requestPolicy: 'network-only' });
        }
        setDeleteDialogOpen(false);
        setCardToDelete(null);
    };

    if (fetching) return <Typography>Loading...</Typography>;
    if (error) return <Alert severity="error">{error.message}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Payment Cards</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => handleOpen()}
                >
                    Add Card
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Label</TableCell>
                            <TableCell>Last 4 Digits</TableCell>
                            <TableCell>Card Type</TableCell>
                            <TableCell>Bank Account</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...(data?.accountCards || [])]
                            .sort((a: any, b: any) => {
                                // Active cards first, then by label
                                if (a.active !== b.active) return a.active ? -1 : 1;
                                // Then by label (cards with labels first)
                                if (a.label && !b.label) return -1;
                                if (!a.label && b.label) return 1;
                                // Then alphabetically by label
                                if (a.label && b.label) return a.label.localeCompare(b.label);
                                // Finally by trailing digits
                                return a.trailingDigits.localeCompare(b.trailingDigits);
                            })
                            .map((card: any) => (
                            <TableRow key={card.id}>
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
                    {!editingCard && (
                        <FormControl fullWidth>
                            <InputLabel>Bank Account</InputLabel>
                            <Select
                                value={formData.accountId}
                                label="Bank Account"
                                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                            >
                                {data?.allAccounts.map((acc: any) => (
                                    <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

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
