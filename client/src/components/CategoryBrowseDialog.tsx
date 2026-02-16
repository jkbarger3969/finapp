import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    Chip,
    IconButton,
} from '@mui/material';
import {
    Search as SearchIcon,
    ExpandMore as ExpandMoreIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

interface Category {
    id: string;
    name: string;
    displayName?: string;
    type: string;
    groupName?: string;
    sortOrder?: number;
    hidden?: boolean;
}

interface CategoryBrowseDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (category: Category) => void;
    categories: Category[];
    selectedId?: string;
}

export default function CategoryBrowseDialog({
    open,
    onClose,
    onSelect,
    categories,
    selectedId,
}: CategoryBrowseDialogProps) {
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const visibleCategories = useMemo(() => {
        return categories.filter(c => !c.hidden);
    }, [categories]);

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return visibleCategories;
        const term = searchTerm.toLowerCase();
        return visibleCategories.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.displayName?.toLowerCase().includes(term) ||
            c.groupName?.toLowerCase().includes(term)
        );
    }, [visibleCategories, searchTerm]);

    const { incomeCategories, expenseCategories } = useMemo(() => {
        const income = filteredCategories.filter(c => c.type === 'CREDIT' || c.type === 'Credit');
        const expense = filteredCategories.filter(c => c.type === 'DEBIT' || c.type === 'Debit');
        return { incomeCategories: income, expenseCategories: expense };
    }, [filteredCategories]);

    const groupCategories = (cats: Category[]) => {
        const grouped: { [key: string]: Category[] } = {};
        const ungrouped: Category[] = [];

        cats.forEach(cat => {
            if (cat.groupName) {
                if (!grouped[cat.groupName]) {
                    grouped[cat.groupName] = [];
                }
                grouped[cat.groupName].push(cat);
            } else {
                ungrouped.push(cat);
            }
        });

        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        });
        ungrouped.sort((a, b) => a.name.localeCompare(b.name));

        return { grouped, ungrouped };
    };

    const handleSelect = (category: Category) => {
        onSelect(category);
        onClose();
    };

    const handleAccordionChange = (groupName: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedGroups(prev =>
            isExpanded
                ? [...prev, groupName]
                : prev.filter(g => g !== groupName)
        );
    };

    const renderCategoryList = (cats: Category[]) => {
        const { grouped, ungrouped } = groupCategories(cats);
        const sortedGroupNames = Object.keys(grouped).sort();

        return (
            <Box>
                {sortedGroupNames.map(groupName => (
                    <Accordion
                        key={groupName}
                        expanded={expandedGroups.includes(groupName) || !!searchTerm}
                        onChange={handleAccordionChange(groupName)}
                        disableGutters
                        sx={{ '&:before': { display: 'none' } }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                <Typography fontWeight="medium">{groupName}</Typography>
                                <Chip
                                    label={grouped[groupName].length}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <List dense disablePadding>
                                {grouped[groupName].map(cat => (
                                    <ListItemButton
                                        key={cat.id}
                                        selected={cat.id === selectedId}
                                        onClick={() => handleSelect(cat)}
                                        sx={{ pl: 4 }}
                                    >
                                        <ListItemText
                                            primary={cat.name}
                                            secondary={cat.displayName !== cat.name ? cat.displayName : undefined}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))}

                {ungrouped.length > 0 && (
                    <Accordion
                        expanded={expandedGroups.includes('_ungrouped') || !!searchTerm}
                        onChange={handleAccordionChange('_ungrouped')}
                        disableGutters
                        sx={{ '&:before': { display: 'none' } }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography fontWeight="medium">Other</Typography>
                                <Chip label={ungrouped.length} size="small" variant="outlined" />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <List dense disablePadding>
                                {ungrouped.map(cat => (
                                    <ListItemButton
                                        key={cat.id}
                                        selected={cat.id === selectedId}
                                        onClick={() => handleSelect(cat)}
                                        sx={{ pl: 4 }}
                                    >
                                        <ListItemText primary={cat.name} />
                                    </ListItemButton>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                )}

                {sortedGroupNames.length === 0 && ungrouped.length === 0 && (
                    <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        No categories found
                    </Typography>
                )}
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Browse Categories
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search categories..."
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

                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label={`Income (${incomeCategories.length})`} />
                    <Tab label={`Expense (${expenseCategories.length})`} />
                </Tabs>

                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {tabValue === 0 && renderCategoryList(incomeCategories)}
                    {tabValue === 1 && renderCategoryList(expenseCategories)}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
