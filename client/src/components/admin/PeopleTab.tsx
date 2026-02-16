import { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Chip,
    CircularProgress,
    Tooltip,
    Alert,
    Snackbar,
    Autocomplete,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Collapse,
    Divider,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Person as PersonIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, gql } from 'urql';
import { useOnlineStatus } from '../../context/OnlineStatusContext';

const PEOPLE_QUERY = gql`
    query AllPeople {
        people {
            id
            name {
                first
                last
            }
            email
            phone
            hidden
        }
    }
`;

const UPDATE_PERSON_MUTATION = gql`
    mutation UpdatePerson($id: ID!, $input: UpdatePersonInput!) {
        updatePerson(id: $id, input: $input) {
            person {
                id
                name {
                    first
                    last
                }
                email
                phone
                hidden
            }
        }
    }
`;

interface Person {
    id: string;
    name: {
        first: string;
        last: string;
    };
    email?: string;
    phone?: string;
    hidden?: boolean;
}

interface GroupedPeople {
    [letter: string]: Person[];
}

export const PeopleTab = () => {
    const { isOnline } = useOnlineStatus();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [{ data, fetching, error }, refetch] = useQuery({
        query: PEOPLE_QUERY,
        requestPolicy: 'cache-and-network',
    });

    const [, updatePerson] = useMutation(UPDATE_PERSON_MUTATION);

    const getFullName = (person: Person) => `${person.name.first} ${person.name.last}`;

    const handleToggleHidden = async (person: Person) => {
        if (!isOnline) {
            setSnackbar({ open: true, message: 'Cannot update while offline', severity: 'error' });
            return;
        }

        const fullName = getFullName(person);
        const result = await updatePerson({
            id: person.id,
            input: { hidden: !person.hidden },
        });

        if (result.error) {
            setSnackbar({ open: true, message: `Failed to update: ${result.error.message}`, severity: 'error' });
        } else {
            setSnackbar({
                open: true,
                message: `"${fullName}" ${person.hidden ? 'shown' : 'hidden'} successfully`,
                severity: 'success',
            });
            refetch({ requestPolicy: 'network-only' });
        }
    };

    const toggleGroup = (letter: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(letter)) {
                newSet.delete(letter);
            } else {
                newSet.add(letter);
            }
            return newSet;
        });
    };

    const { allPeople, groupedPeople, visibleCount, hiddenCount } = useMemo(() => {
        const people: Person[] = data?.people || [];
        const sorted = [...people].sort((a, b) => getFullName(a).localeCompare(getFullName(b)));
        
        const grouped: GroupedPeople = {};
        sorted.forEach(person => {
            const letter = person.name.last.charAt(0).toUpperCase() || '#';
            if (!grouped[letter]) {
                grouped[letter] = [];
            }
            grouped[letter].push(person);
        });

        return {
            allPeople: sorted,
            groupedPeople: grouped,
            visibleCount: people.filter(p => !p.hidden).length,
            hiddenCount: people.filter(p => p.hidden).length,
        };
    }, [data]);

    if (error) {
        return <Alert severity="error">Failed to load people: {error.message}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    People Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`${visibleCount} visible`} size="small" color="primary" variant="outlined" />
                    {hiddenCount > 0 && <Chip label={`${hiddenCount} hidden`} size="small" color="default" />}
                </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Search for a person to quickly toggle visibility, or browse the alphabetical list below.
            </Typography>

            {/* Quick Search Autocomplete */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Autocomplete
                    options={allPeople}
                    getOptionLabel={(option) => getFullName(option)}
                    value={selectedPerson}
                    onChange={(_, newValue) => setSelectedPerson(newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search People"
                            placeholder="Type to search..."
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <>
                                        <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                                        {params.InputProps.startAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    renderOption={(props, option) => (
                        <Box component="li" {...props} sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                <Typography sx={{ textDecoration: option.hidden ? 'line-through' : 'none' }}>
                                    {getFullName(option)}
                                </Typography>
                                {option.hidden && <Chip label="Hidden" size="small" color="default" />}
                            </Box>
                            <Tooltip title={option.hidden ? 'Show in dropdowns' : 'Hide from dropdowns'}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleHidden(option);
                                    }}
                                    disabled={!isOnline}
                                    color={option.hidden ? 'primary' : 'default'}
                                >
                                    {option.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    loading={fetching}
                    noOptionsText="No people found"
                />
            </Paper>

            {/* Collapsible Alphabetical List */}
            {fetching && !data ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper>
                    <List disablePadding>
                        {Object.keys(groupedPeople).sort().map((letter, index) => {
                            const people = groupedPeople[letter];
                            const isExpanded = expandedGroups.has(letter);
                            const hiddenInGroup = people.filter(p => p.hidden).length;

                            return (
                                <Box key={letter}>
                                    {index > 0 && <Divider />}
                                    <ListItem
                                        component="div"
                                        onClick={() => toggleGroup(letter)}
                                        sx={{
                                            bgcolor: 'action.hover',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.selected' },
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    <Typography fontWeight="bold">{letter}</Typography>
                                                    <Chip label={`${people.length}`} size="small" variant="outlined" />
                                                    {hiddenInGroup > 0 && (
                                                        <Chip label={`${hiddenInGroup} hidden`} size="small" color="default" />
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    <Collapse in={isExpanded}>
                                        <List disablePadding sx={{ pl: 4 }}>
                                            {people.map(person => (
                                                <ListItem
                                                    key={person.id}
                                                    sx={{ opacity: person.hidden ? 0.6 : 1 }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Typography
                                                                sx={{
                                                                    textDecoration: person.hidden ? 'line-through' : 'none',
                                                                    color: person.hidden ? 'text.secondary' : 'text.primary',
                                                                }}
                                                            >
                                                                {getFullName(person)}
                                                            </Typography>
                                                        }
                                                        secondary={person.email || person.phone || null}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        {person.hidden && (
                                                            <Chip label="Hidden" size="small" color="default" sx={{ mr: 1 }} />
                                                        )}
                                                        <Tooltip title={person.hidden ? 'Show in dropdowns' : 'Hide from dropdowns'}>
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleToggleHidden(person)}
                                                                    disabled={!isOnline}
                                                                    color={person.hidden ? 'primary' : 'default'}
                                                                >
                                                                    {person.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                </Box>
                            );
                        })}
                        {Object.keys(groupedPeople).length === 0 && (
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                                            No people found
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};
