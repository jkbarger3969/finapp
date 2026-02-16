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

interface Person {
    id: string;
    label: string;
    firstName: string;
    lastName: string;
}

interface PersonBrowseDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (person: Person) => void;
    people: Person[];
    selectedId?: string;
}

export default function PersonBrowseDialog({
    open,
    onClose,
    onSelect,
    people,
    selectedId,
}: PersonBrowseDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPeople = useMemo(() => {
        if (!searchTerm) return people;
        const term = searchTerm.toLowerCase();
        return people.filter(p =>
            p.label.toLowerCase().includes(term) ||
            p.firstName.toLowerCase().includes(term) ||
            p.lastName.toLowerCase().includes(term)
        );
    }, [people, searchTerm]);

    const groupedByLetter = useMemo(() => {
        const groups: { [key: string]: Person[] } = {};
        filteredPeople.forEach(person => {
            const letter = person.lastName.charAt(0).toUpperCase() || '#';
            if (!groups[letter]) {
                groups[letter] = [];
            }
            groups[letter].push(person);
        });
        return groups;
    }, [filteredPeople]);

    const handleSelect = (person: Person) => {
        onSelect(person);
        onClose();
    };

    const sortedLetters = Object.keys(groupedByLetter).sort();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Browse People
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search people..."
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
                    {filteredPeople.length} people found
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
                                {groupedByLetter[letter].map(person => (
                                    <ListItemButton
                                        key={person.id}
                                        selected={person.id === selectedId}
                                        onClick={() => handleSelect(person)}
                                    >
                                        <ListItemText
                                            primary={person.label}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Box>
                    ))}
                    {sortedLetters.length === 0 && (
                        <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            No people found
                        </Typography>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
