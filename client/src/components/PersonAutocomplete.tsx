import { useState, useMemo } from 'react';
import {
    Autocomplete,
    TextField,
    Box,
    IconButton,
    Tooltip,
} from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
import PersonBrowseDialog from './PersonBrowseDialog';

interface Person {
    id: string;
    label: string;
    firstName: string;
    lastName: string;
}

interface PersonAutocompleteProps {
    people: Person[];
    value: string;
    onChange: (personId: string) => void;
    disabled?: boolean;
    required?: boolean;
    error?: boolean;
    helperText?: string;
    label?: string;
    placeholder?: string;
    size?: 'small' | 'medium';
}

export default function PersonAutocomplete({
    people,
    value,
    onChange,
    disabled = false,
    required = false,
    error = false,
    helperText,
    label = "Person",
    placeholder = "Type to search people...",
    size = 'medium',
}: PersonAutocompleteProps) {
    const [browseOpen, setBrowseOpen] = useState(false);

    const selectedPerson = useMemo(() => {
        return people.find(p => p.id === value) || null;
    }, [people, value]);

    const sortedPeople = useMemo(() => {
        return [...people].sort((a, b) => a.label.localeCompare(b.label));
    }, [people]);

    const handleBrowseSelect = (person: Person) => {
        onChange(person.id);
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Autocomplete
                fullWidth
                size={size}
                value={selectedPerson}
                onChange={(_, newValue) => {
                    onChange(newValue?.id || '');
                }}
                options={sortedPeople}
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
            <Tooltip title="Browse all people">
                <IconButton
                    onClick={() => setBrowseOpen(true)}
                    disabled={disabled}
                    sx={{ mt: 1 }}
                >
                    <ListIcon />
                </IconButton>
            </Tooltip>

            <PersonBrowseDialog
                open={browseOpen}
                onClose={() => setBrowseOpen(false)}
                onSelect={handleBrowseSelect}
                people={people}
                selectedId={value}
            />
        </Box>
    );
}
