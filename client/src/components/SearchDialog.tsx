import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    Box,
    Typography,
    Chip,
    InputAdornment,
    Fade,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from 'urql';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
// import { useDepartment } from '../context/DepartmentContext'; // Unused


const SEARCH_DATA_QUERY = `
  query SearchEntries($query: String!, $limit: Int) {
    searchEntries(query: $query, limit: $limit) {
      id
      description
      date
      total
      category {
        name
        type
      }
      department {
        id
        name
      }
    }
  }
`;

// Helper to parse Rational JSON
const parseRational = (rationalStr: string) => {
    try {
        const { s, n, d } = JSON.parse(rationalStr);
        return (n / d) * s;
    } catch (e) {
        return 0;
    }
};

interface SearchDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const [result] = useQuery({
        query: SEARCH_DATA_QUERY,
        variables: { query: debouncedQuery, limit: 10 },
        pause: !open || !debouncedQuery.trim(),
    });

    const { data, fetching, error } = result;

    // Focus input when dialog opens
    useEffect(() => {
        if (open) {
            // Small delay to ensure dialog is fully rendered
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Use server results directly
    const searchResults = useMemo(() => {
        return data?.searchEntries || [];
    }, [data]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchResults]);

    // Reset search when dialog closes
    useEffect(() => {
        if (!open) {
            setSearchQuery('');
            setSelectedIndex(0);
        }
    }, [open]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && searchResults.length > 0) {
            e.preventDefault();
            handleSelectResult(searchResults[selectedIndex]);
        }
    };

    const handleSelectResult = (_entry: any) => {
        // Pass the search query so Transactions page can filter all matching results
        // Also signal to clear restrictive filters like fiscal year
        navigate('/transactions', { state: { searchQuery: searchQuery, clearFilters: true } });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
            PaperProps={{
                sx: {
                    position: 'fixed',
                    top: 100,
                    m: 0,
                    borderRadius: 2,
                },
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <TextField
                    inputRef={inputRef}
                    autoFocus
                    fullWidth
                    placeholder="Search transactions, categories, departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiInputBase-input': {
                            p: 2,
                            fontSize: '1.1rem',
                        },
                    }}
                />

                {searchQuery && (
                    <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                        {fetching ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">Loading...</Typography>
                            </Box>
                        ) : error ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="error">Error loading results</Typography>
                            </Box>
                        ) : searchResults.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">No results found</Typography>
                            </Box>
                        ) : (
                            <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
                                {searchResults.map((entry: any, index: number) => {
                                    const amount = Math.abs(parseRational(entry.total));
                                    const isCredit = entry.category?.type === 'CREDIT';
                                    const isSelected = index === selectedIndex;

                                    return (
                                        <ListItemButton
                                            key={entry.id}
                                            selected={isSelected}
                                            onClick={() => handleSelectResult(entry)}
                                            sx={{
                                                py: 2,
                                                px: 3,
                                                bgcolor: isSelected ? 'action.selected' : 'transparent',
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {entry.description || 'No Description'}
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight="bold"
                                                            color={isCredit ? 'success.main' : 'error.main'}
                                                        >
                                                            {isCredit ? '+' : '-'}${amount.toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {format(parseISO(entry.date), 'MMM dd, yyyy')}
                                                        </Typography>
                                                        {entry.category?.name && (
                                                            <Chip
                                                                label={entry.category.name}
                                                                size="small"
                                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {entry.department?.name && (
                                                            <Chip
                                                                label={entry.department.name}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                )}

                {!searchQuery && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            Type to search transactions...
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}
