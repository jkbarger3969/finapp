import { useState, useMemo } from 'react';
import {
    Autocomplete,
    TextField,
    Box,
    IconButton,
    Tooltip,
    Chip,
} from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
import CategoryBrowseDialog from './CategoryBrowseDialog';

interface Category {
    id: string;
    name: string;
    displayName?: string;
    type: string;
    groupName?: string;
    sortOrder?: number;
    hidden?: boolean;
}

interface CategoryAutocompleteProps {
    categories: Category[];
    value: string;
    onChange: (categoryId: string) => void;
    disabled?: boolean;
    required?: boolean;
    error?: boolean;
    helperText?: string;
}

export default function CategoryAutocomplete({
    categories,
    value,
    onChange,
    disabled = false,
    required = false,
    error = false,
    helperText,
}: CategoryAutocompleteProps) {
    const [browseOpen, setBrowseOpen] = useState(false);

    const visibleCategories = useMemo(() => {
        return categories.filter(c => !c.hidden);
    }, [categories]);

    const selectedCategory = useMemo(() => {
        return visibleCategories.find(c => c.id === value) || null;
    }, [visibleCategories, value]);

    const sortedCategories = useMemo(() => {
        return [...visibleCategories].sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'CREDIT' || a.type === 'Credit' ? -1 : 1;
            }
            if (a.groupName !== b.groupName) {
                if (!a.groupName) return 1;
                if (!b.groupName) return -1;
                return a.groupName.localeCompare(b.groupName);
            }
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });
    }, [visibleCategories]);

    const getGroupLabel = (option: Category) => {
        const typeLabel = option.type === 'CREDIT' || option.type === 'Credit' ? 'Income' : 'Expense';
        if (option.groupName) {
            return `${typeLabel} - ${option.groupName}`;
        }
        return `${typeLabel} - Other`;
    };

    const handleBrowseSelect = (category: Category) => {
        onChange(category.id);
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Autocomplete
                fullWidth
                value={selectedCategory}
                onChange={(_, newValue) => {
                    onChange(newValue?.id || '');
                }}
                options={sortedCategories}
                groupBy={getGroupLabel}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={disabled}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Category"
                        required={required}
                        error={error}
                        helperText={helperText}
                        placeholder="Type to search categories..."
                    />
                )}
                renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                        <Box
                            component="li"
                            key={key}
                            {...otherProps}
                            sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                        >
                            <span>{option.name}</span>
                            <Chip
                                label={option.type === 'CREDIT' || option.type === 'Credit' ? 'Income' : 'Expense'}
                                size="small"
                                color={option.type === 'CREDIT' || option.type === 'Credit' ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ ml: 1 }}
                            />
                        </Box>
                    );
                }}
                renderGroup={(params) => (
                    <li key={params.key}>
                        <Box
                            sx={{
                                position: 'sticky',
                                top: -8,
                                px: 2,
                                py: 1,
                                bgcolor: 'background.paper',
                                fontWeight: 'bold',
                                color: 'text.secondary',
                                borderBottom: 1,
                                borderColor: 'divider',
                            }}
                        >
                            {params.group}
                        </Box>
                        <ul style={{ padding: 0 }}>{params.children}</ul>
                    </li>
                )}
                slotProps={{
                    listbox: {
                        sx: { maxHeight: 400 },
                    },
                }}
            />
            <Tooltip title="Browse all categories">
                <IconButton
                    onClick={() => setBrowseOpen(true)}
                    disabled={disabled}
                    sx={{ mt: 1 }}
                >
                    <ListIcon />
                </IconButton>
            </Tooltip>

            <CategoryBrowseDialog
                open={browseOpen}
                onClose={() => setBrowseOpen(false)}
                onSelect={handleBrowseSelect}
                categories={categories}
                selectedId={value}
            />
        </Box>
    );
}
