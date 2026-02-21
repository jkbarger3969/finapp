import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import { useQuery, useMutation, gql } from 'urql';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS_QUERY = gql`
    query AllDepartments {
        departments {
            id
            name
            parent {
                __typename
                ... on Department {
                    id
                    name
                }
                ... on Business {
                    id
                    name
                }
            }
        }
    }
`;

const INVITE_USER_MUTATION = gql`
    mutation InviteUser($input: InviteUserInput!) {
        inviteUser(input: $input) {
            id
            email
            name
            status
        }
    }
`;

interface Department {
    id: string;
    name: string;
    parent?: {
        __typename: 'Business' | 'Department';
        id: string;
        name: string;
    };
}

interface InviteUserDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function InviteUserDialog({ open, onClose, onSuccess }: InviteUserDialogProps) {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState<{ departmentId: string; accessLevel: 'VIEW' | 'EDIT' }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [{ data: departmentsData }] = useQuery({ query: DEPARTMENTS_QUERY });
    const [, inviteUser] = useMutation(INVITE_USER_MUTATION);

    const allDepartments: Department[] = departmentsData?.departments || [];

    // Get user's accessible department IDs
    const userDeptIds = useMemo(() => {
        return (user as any)?.departments?.map((d: any) => d.departmentId) || [];
    }, [user]);

    // Filter departments to only those the user has access to (and their subdepartments)
    const accessibleDepartments = useMemo(() => {
        if (!userDeptIds.length) return [];
        
        const accessibleIds = new Set<string>();
        
        // Add departments user has direct access to
        userDeptIds.forEach((id: string) => accessibleIds.add(id));
        
        // Add subdepartments of accessible departments
        allDepartments.forEach((d: Department) => {
            if (d.parent?.__typename === 'Department' && userDeptIds.includes(d.parent.id)) {
                accessibleIds.add(d.id);
            }
        });
        
        return allDepartments.filter(d => accessibleIds.has(d.id));
    }, [allDepartments, userDeptIds]);

    // Group departments for display
    const topLevelDepts = useMemo(() => 
        accessibleDepartments.filter(d => d.parent?.__typename === 'Business' || !d.parent),
        [accessibleDepartments]
    );
    
    const getSubdepartments = (parentId: string) => 
        accessibleDepartments.filter(d => d.parent?.__typename === 'Department' && d.parent.id === parentId);

    const handleDepartmentToggle = (deptId: string, accessLevel: 'VIEW' | 'EDIT') => {
        const existing = selectedDepartments.find(d => d.departmentId === deptId);
        if (existing) {
            if (existing.accessLevel === accessLevel) {
                // Remove if clicking same level
                setSelectedDepartments(prev => prev.filter(d => d.departmentId !== deptId));
            } else {
                // Update access level
                setSelectedDepartments(prev => 
                    prev.map(d => d.departmentId === deptId ? { ...d, accessLevel } : d)
                );
            }
        } else {
            // Add new
            setSelectedDepartments(prev => [...prev, { departmentId: deptId, accessLevel }]);
        }
    };

    const handleSubmit = async () => {
        setError(null);
        
        if (!email.endsWith('@lonestarcowboychurch.org')) {
            setError('Email must be a @lonestarcowboychurch.org address');
            return;
        }
        
        if (!email || !name) {
            setError('Please fill in all required fields');
            return;
        }
        
        if (selectedDepartments.length === 0) {
            setError('Please select at least one department');
            return;
        }

        setLoading(true);
        try {
            const permissions = selectedDepartments.map(d => ({
                departmentId: d.departmentId,
                accessLevel: d.accessLevel,
            }));

            const result = await inviteUser({
                input: {
                    email,
                    name,
                    permissions,
                    canInviteUsers: false,
                },
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            // Reset form
            setEmail('');
            setName('');
            setSelectedDepartments([]);
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to invite user');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setName('');
        setSelectedDepartments([]);
        setError(null);
        onClose();
    };

    const getDeptAccessLevel = (deptId: string) => {
        return selectedDepartments.find(d => d.departmentId === deptId)?.accessLevel;
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Invite User</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@lonestarcowboychurch.org"
                    sx={{ mt: 1, mb: 2 }}
                    required
                />
                
                <TextField
                    label="Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                    required
                />
                
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Department Access
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Select departments and access level (View or Edit)
                </Typography>
                
                <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
                    {topLevelDepts.map(dept => {
                        const subs = getSubdepartments(dept.id);
                        const accessLevel = getDeptAccessLevel(dept.id);
                        
                        return (
                            <Box key={dept.id} sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold' }}>
                                        {dept.name}
                                    </Typography>
                                    <Chip
                                        label="View"
                                        size="small"
                                        color={accessLevel === 'VIEW' ? 'primary' : 'default'}
                                        onClick={() => handleDepartmentToggle(dept.id, 'VIEW')}
                                        variant={accessLevel === 'VIEW' ? 'filled' : 'outlined'}
                                    />
                                    <Chip
                                        label="Edit"
                                        size="small"
                                        color={accessLevel === 'EDIT' ? 'success' : 'default'}
                                        onClick={() => handleDepartmentToggle(dept.id, 'EDIT')}
                                        variant={accessLevel === 'EDIT' ? 'filled' : 'outlined'}
                                    />
                                </Box>
                                
                                {subs.length > 0 && (
                                    <Box sx={{ pl: 3 }}>
                                        {subs.map(sub => {
                                            const subAccessLevel = getDeptAccessLevel(sub.id);
                                            return (
                                                <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                                        {sub.name}
                                                    </Typography>
                                                    <Chip
                                                        label="View"
                                                        size="small"
                                                        color={subAccessLevel === 'VIEW' ? 'primary' : 'default'}
                                                        onClick={() => handleDepartmentToggle(sub.id, 'VIEW')}
                                                        variant={subAccessLevel === 'VIEW' ? 'filled' : 'outlined'}
                                                    />
                                                    <Chip
                                                        label="Edit"
                                                        size="small"
                                                        color={subAccessLevel === 'EDIT' ? 'success' : 'default'}
                                                        onClick={() => handleDepartmentToggle(sub.id, 'EDIT')}
                                                        variant={subAccessLevel === 'EDIT' ? 'filled' : 'outlined'}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
                
                {selectedDepartments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Selected: {selectedDepartments.length} department(s)
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={loading || !email || !name || selectedDepartments.length === 0}
                >
                    {loading ? <CircularProgress size={20} /> : 'Send Invite'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
