import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    TextField,
    InputAdornment,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    IconButton,
} from '@mui/material';
import {
    Search as SearchIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

interface Business {
    id: string;
    label: string;
}

interface BusinessBrowseDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (business: Business) => void;
    businesses: Business[];
    selectedId?: string;
}

export default function BusinessBrowseDialog({
    open,
    onClose,
    onSelect,
    businesses,
    selectedId,
}: BusinessBrowseDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBusinesses = useMemo(() => {
        if (!searchTerm) return businesses;
        const term = searchTerm.toLowerCase();
        return businesses.filter(b => b.label.toLowerCase().includes(term));
    }, [businesses, searchTerm]);

    const groupedByLetter = useMemo(() => {
        const groups: { [key: string]: Business[] } = {};
        filteredBusinesses.forEach(business => {
            const letter = business.label.charAt(0).toUpperCase() || '#';
            if (!groups[letter]) {
                groups[letter] = [];
            }
            groups[letter].push(business);
        });
        return groups;
    }, [filteredBusinesses]);

    const handleSelect = (business: Business) => {
        onSelect(business);
        onClose();
    };

    const sortedLetters = Object.keys(groupedByLetter).sort();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Browse Businesses
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {filteredBusinesses.length} businesses found
                </Typography>

                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {sortedLetters.map(letter => (
                        <Box key={letter}>
                            <Box
                                sx={{
                                    position: 'sticky',
                                    top: 0,
                                    bgcolor: 'background.paper',
                                    px: 2,
                                    py: 0.5,
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {letter}
                                </Typography>
                            </Box>
                            <List dense disablePadding>
                                {groupedByLetter[letter].map(business => (
                                    <ListItemButton
                                        key={business.id}
                                        selected={business.id === selectedId}
                                        onClick={() => handleSelect(business)}
                                    >
                                        <ListItemText primary={business.label} />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Box>
                    ))}
                    {sortedLetters.length === 0 && (
                        <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            No businesses found
                        </Typography>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
