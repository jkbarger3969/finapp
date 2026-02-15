import { useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Search as SearchIcon,
    Person as PersonIcon,
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

export const PeopleTab = () => {
    const { isOnline } = useOnlineStatus();
    const [searchTerm, setSearchTerm] = useState('');
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

    const handleToggleHidden = async (person: Person) => {
        if (!isOnline) {
            setSnackbar({ open: true, message: 'Cannot update while offline', severity: 'error' });
            return;
        }

        const fullName = `${person.name.first} ${person.name.last}`;
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

    const getFullName = (person: Person) => `${person.name.first} ${person.name.last}`;

    const filteredPeople = (data?.people || []).filter((person: Person) =>
        getFullName(person).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedPeople = [...filteredPeople].sort((a: Person, b: Person) =>
        getFullName(a).localeCompare(getFullName(b))
    );

    if (error) {
        return <Alert severity="error">Failed to load people: {error.message}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    People Management
                </Typography>
                <TextField
                    size="small"
                    placeholder="Search people..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 250 }}
                />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Hidden people will not appear in dropdown menus when creating transactions, 
                but historical data using these people will remain intact.
            </Typography>

            {fetching && !data ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedPeople.map((person: Person) => (
                                <TableRow
                                    key={person.id}
                                    sx={{
                                        opacity: person.hidden ? 0.6 : 1,
                                    }}
                                >
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                textDecoration: person.hidden ? 'line-through' : 'none',
                                                color: person.hidden ? 'text.secondary' : 'text.primary',
                                            }}
                                        >
                                            {getFullName(person)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ textDecoration: person.hidden ? 'line-through' : 'none' }}
                                        >
                                            {person.email || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ textDecoration: person.hidden ? 'line-through' : 'none' }}
                                        >
                                            {person.phone || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {person.hidden ? (
                                            <Chip label="Hidden" size="small" color="default" />
                                        ) : (
                                            <Chip label="Visible" size="small" color="primary" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
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
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sortedPeople.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="text.secondary" sx={{ py: 2 }}>
                                            {searchTerm ? 'No people match your search' : 'No people found'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
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
