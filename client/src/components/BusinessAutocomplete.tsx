import { useState, useMemo } from 'react';
import {
    Autocomplete,
    TextField,
    Box,
    IconButton,
    Tooltip,
} from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
import BusinessBrowseDialog from './BusinessBrowseDialog';

interface Business {
    id: string;
    label: string;
}

interface BusinessAutocompleteProps {
    businesses: Business[];
    value: string;
    onChange: (businessId: string) => void;
    disabled?: boolean;
    required?: boolean;
    error?: boolean;
    helperText?: string;
    label?: string;
    placeholder?: string;
    size?: 'small' | 'medium';
}

export default function BusinessAutocomplete({
    businesses,
    value,
    onChange,
    disabled = false,
    required = false,
    error = false,
    helperText,
    label = "Business",
    placeholder = "Type to search businesses...",
    size = 'medium',
}: BusinessAutocompleteProps) {
    const [browseOpen, setBrowseOpen] = useState(false);

    const selectedBusiness = useMemo(() => {
        return businesses.find(b => b.id === value) || null;
    }, [businesses, value]);

    const sortedBusinesses = useMemo(() => {
        return [...businesses].sort((a, b) => a.label.localeCompare(b.label));
    }, [businesses]);

    const handleBrowseSelect = (business: Business) => {
        onChange(business.id);
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Autocomplete
                fullWidth
                size={size}
                value={selectedBusiness}
                onChange={(_, newValue) => {
                    onChange(newValue?.id || '');
                }}
                options={sortedBusinesses}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={disabled}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        required={required}
                        error={error}
                        helperText={helperText}
                        placeholder={placeholder}
                        size={size}
                    />
                )}
                renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                        <Box
                            component="li"
                            key={key}
                            {...otherProps}
                        >
                            {option.label}
                        </Box>
                    );
                }}
            />
            <Tooltip title="Browse all businesses">
                <IconButton
                    onClick={() => setBrowseOpen(true)}
                    disabled={disabled}
                    sx={{ mt: 1 }}
                >
                    <ListIcon />
                </IconButton>
            </Tooltip>

            <BusinessBrowseDialog
                open={browseOpen}
                onClose={() => setBrowseOpen(false)}
                onSelect={handleBrowseSelect}
                businesses={businesses}
                selectedId={value}
            />
        </Box>
    );
}
