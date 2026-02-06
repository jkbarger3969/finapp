import { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Avatar,
    Alert,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, gql } from 'urql';
import { useAuth } from '../../context/AuthContext';

const USERS_QUERY = gql`
    query Users {
        users {
            id
            email
            name
            picture
            role
            status
            lastLoginAt
            createdAt
            departments {
                id
                accessLevel
                department {
                    id
                    name
                }
            }
        }
    }
`;

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
            role
            status
        }
    }
`;

const UPDATE_USER_MUTATION = gql`
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
            id
            role
            status
        }
    }
`;

const GRANT_PERMISSION_MUTATION = gql`
    mutation GrantPermission($input: GrantPermissionInput!) {
        grantPermission(input: $input) {
            id
            accessLevel
        }
    }
`;

const REVOKE_PERMISSION_MUTATION = gql`
    mutation RevokePermission($input: RevokePermissionInput!) {
        revokePermission(input: $input)
    }
`;

interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: 'SUPER_ADMIN' | 'DEPT_ADMIN' | 'USER';
    status: 'INVITED' | 'ACTIVE' | 'DISABLED';
    lastLoginAt?: string;
    createdAt: string;
    departments: {
        id: string;
        accessLevel: 'VIEW' | 'EDIT' | 'ADMIN';
        department: {
            id: string;
            name: string;
        };
    }[];
}

interface Department {
    id: string;
    name: string;
    parent?: {
        __typename: 'Business' | 'Department';
        id: string;
        name: string;
    };
}

export default function UsersTab() {
    const { isSuperAdmin } = useAuth();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editRole, setEditRole] = useState<'SUPER_ADMIN' | 'DEPT_ADMIN' | 'USER'>('USER');
    const [permissionUser, setPermissionUser] = useState<User | null>(null);
    const [newPermission, setNewPermission] = useState<{ departmentId: string; accessLevel: 'VIEW' | 'EDIT' | 'ADMIN' }>({ departmentId: '', accessLevel: 'VIEW' });
    const [inviteForm, setInviteForm] = useState<{ 
        email: string; 
        name: string; 
        role: 'SUPER_ADMIN' | 'DEPT_ADMIN' | 'USER';
        departments: { departmentId: string; accessLevel: 'VIEW' | 'EDIT' | 'ADMIN' }[];
    }>({ email: '', name: '', role: 'USER', departments: [] });
    const [inviteDeptSelection, setInviteDeptSelection] = useState<{ departmentId: string; accessLevel: 'VIEW' | 'EDIT' | 'ADMIN' }>({ departmentId: '', accessLevel: 'EDIT' });
    const [error, setError] = useState<string | null>(null);

    const [{ data: usersData, fetching: usersFetching }, refetchUsers] = useQuery({ query: USERS_QUERY });
    const [{ data: departmentsData }] = useQuery({ query: DEPARTMENTS_QUERY });

    const [, inviteUser] = useMutation(INVITE_USER_MUTATION);
    const [, updateUser] = useMutation(UPDATE_USER_MUTATION);
    const [, grantPermission] = useMutation(GRANT_PERMISSION_MUTATION);
    const [, revokePermission] = useMutation(REVOKE_PERMISSION_MUTATION);

    const users: User[] = usersData?.users || [];
    const departments: Department[] = departmentsData?.departments || [];

    const topLevelDepartments = departments.filter(d => !d.parent || d.parent.__typename === 'Business');
    const getSubdepartments = (parentId: string) => departments.filter(d => d.parent?.__typename === 'Department' && d.parent.id === parentId);
    const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || id;

    const handleInvite = async () => {
        setError(null);
        const result = await inviteUser({ input: { email: inviteForm.email, name: inviteForm.name, role: inviteForm.role } });
        if (result.error) {
            setError(result.error.message);
            return;
        }
        
        const newUserId = result.data?.inviteUser?.id;
        if (newUserId && inviteForm.departments.length > 0) {
            for (const dept of inviteForm.departments) {
                await grantPermission({
                    input: {
                        userId: newUserId,
                        departmentId: dept.departmentId,
                        accessLevel: dept.accessLevel,
                    },
                });
            }
        }
        
        setInviteOpen(false);
        setInviteForm({ email: '', name: '', role: 'USER', departments: [] });
        setInviteDeptSelection({ departmentId: '', accessLevel: 'EDIT' });
        refetchUsers();
    };

    const addDepartmentToInvite = () => {
        if (!inviteDeptSelection.departmentId) return;
        if (inviteForm.departments.some(d => d.departmentId === inviteDeptSelection.departmentId)) return;
        setInviteForm({
            ...inviteForm,
            departments: [...inviteForm.departments, { ...inviteDeptSelection }]
        });
        setInviteDeptSelection({ departmentId: '', accessLevel: 'EDIT' });
    };

    const removeDepartmentFromInvite = (departmentId: string) => {
        setInviteForm({
            ...inviteForm,
            departments: inviteForm.departments.filter(d => d.departmentId !== departmentId)
        });
    };

    const handleUpdateRole = async () => {
        if (!editUser) return;
        setError(null);
        const result = await updateUser({ id: editUser.id, input: { role: editRole } });
        if (result.error) {
            setError(result.error.message);
        } else {
            setEditUser(null);
            refetchUsers();
        }
    };

    const openEditRole = (user: User) => {
        setEditUser(user);
        setEditRole(user.role);
    };

    const handleToggleStatus = async (user: User) => {
        setError(null);
        const newStatus = user.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
        const result = await updateUser({ id: user.id, input: { status: newStatus } });
        if (result.error) {
            setError(result.error.message);
        } else {
            refetchUsers();
        }
    };

    const handleGrantPermission = async () => {
        if (!permissionUser || !newPermission.departmentId) return;
        setError(null);
        const result = await grantPermission({
            input: {
                userId: permissionUser.id,
                departmentId: newPermission.departmentId,
                accessLevel: newPermission.accessLevel,
            },
        });
        if (result.error) {
            setError(result.error.message);
        } else {
            setNewPermission({ departmentId: '', accessLevel: 'VIEW' });
            refetchUsers();
        }
    };

    const handleRevokePermission = async (userId: string, departmentId: string) => {
        setError(null);
        const result = await revokePermission({
            input: { userId, departmentId },
        });
        if (result.error) {
            setError(result.error.message);
        } else {
            refetchUsers();
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'error';
            case 'DEPT_ADMIN': return 'warning';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'INVITED': return 'info';
            case 'DISABLED': return 'default';
            default: return 'default';
        }
    };

    if (usersFetching) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">User Management</Typography>
                {isSuperAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setInviteOpen(true)}
                    >
                        Invite User
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Departments</TableCell>
                            <TableCell>Last Login</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar src={user.picture} sx={{ width: 32, height: 32 }}>
                                            {user.name?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {user.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role.replace('_', ' ')}
                                        size="small"
                                        color={getRoleColor(user.role)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.status}
                                        size="small"
                                        color={getStatusColor(user.status)}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {user.role === 'SUPER_ADMIN' ? (
                                            <Chip label="All Departments" size="small" color="error" variant="outlined" />
                                        ) : user.departments.length > 0 ? (
                                            user.departments.slice(0, 3).map((perm) => (
                                                <Chip
                                                    key={perm.id}
                                                    label={`${perm.department.name} (${perm.accessLevel})`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">
                                                No departments
                                            </Typography>
                                        )}
                                        {user.departments.length > 3 && (
                                            <Chip
                                                label={`+${user.departments.length - 3} more`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {user.lastLoginAt
                                        ? new Date(user.lastLoginAt).toLocaleDateString()
                                        : 'Never'}
                                </TableCell>
                                <TableCell align="right">
                                    {isSuperAdmin && (
                                        <>
                                            {user.role !== 'SUPER_ADMIN' && (
                                                <Tooltip title="Manage Permissions">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setPermissionUser(user)}
                                                    >
                                                        <SecurityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Edit Role">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openEditRole(user)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={user.status === 'DISABLED' ? 'Enable' : 'Disable'}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleToggleStatus(user)}
                                                    color={user.status === 'DISABLED' ? 'success' : 'error'}
                                                >
                                                    {user.status === 'DISABLED' ? (
                                                        <CheckCircleIcon fontSize="small" />
                                                    ) : (
                                                        <BlockIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Invite User</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Send an invitation to a user. They must have a @lonestarcowboychurch.org email.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        placeholder="user@lonestarcowboychurch.org"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={inviteForm.name}
                        onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={inviteForm.role}
                            label="Role"
                            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'USER' | 'DEPT_ADMIN' | 'SUPER_ADMIN' })}
                        >
                            <MenuItem value="USER">User</MenuItem>
                            <MenuItem value="DEPT_ADMIN">Department Admin</MenuItem>
                            {isSuperAdmin && <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>}
                        </Select>
                    </FormControl>

                    {inviteForm.role !== 'SUPER_ADMIN' && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            
                            {inviteForm.role === 'DEPT_ADMIN' ? (
                                <>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Department Admin Access
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Select top-level departments this admin will manage. They will have full admin access to selected departments and ALL subdepartments underneath.
                                    </Typography>

                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        {topLevelDepartments.map((topDept) => {
                                            const subdepts = getSubdepartments(topDept.id);
                                            const isSelected = inviteForm.departments.some(d => d.departmentId === topDept.id);
                                            
                                            return (
                                                <Box key={topDept.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { mb: 0, pb: 0, border: 'none' } }}>
                                                    <Button
                                                        variant={isSelected ? "contained" : "outlined"}
                                                        size="small"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                removeDepartmentFromInvite(topDept.id);
                                                            } else {
                                                                setInviteForm({
                                                                    ...inviteForm,
                                                                    departments: [...inviteForm.departments, { departmentId: topDept.id, accessLevel: 'ADMIN' }]
                                                                });
                                                            }
                                                        }}
                                                        sx={{ minWidth: 120 }}
                                                    >
                                                        {isSelected ? '✓ ' : ''}{topDept.name}
                                                    </Button>
                                                    {subdepts.length > 0 && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
                                                            Includes: {subdepts.map(s => s.name).join(', ')}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Paper>

                                    {inviteForm.departments.length === 0 && (
                                        <Alert severity="info" sx={{ mt: 2 }}>
                                            Select at least one department for this admin to manage.
                                        </Alert>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                        Department Access
                                    </Typography>
                            
                                    {inviteForm.departments.length > 0 && (
                                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Department</TableCell>
                                                        <TableCell>Access Level</TableCell>
                                                        <TableCell align="right">Remove</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {inviteForm.departments.map((dept) => {
                                                        const deptInfo = departments.find(d => d.id === dept.departmentId);
                                                        const parentName = deptInfo?.parent?.__typename === 'Department' 
                                                            ? getDepartmentName(deptInfo.parent.id) 
                                                            : null;
                                                        return (
                                                            <TableRow key={dept.departmentId}>
                                                                <TableCell>
                                                                    {parentName && (
                                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                                            {parentName}
                                                                        </Typography>
                                                                    )}
                                                                    {deptInfo?.name || dept.departmentId}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip label={dept.accessLevel} size="small" />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => removeDepartmentFromInvite(dept.departmentId)}
                                                                    >
                                                                        <BlockIcon fontSize="small" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}

                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Select departments to grant access:
                                        </Typography>
                                        
                                        {topLevelDepartments.map((topDept) => {
                                            const subdepts = getSubdepartments(topDept.id);
                                            const isTopSelected = inviteForm.departments.some(d => d.departmentId === topDept.id);
                                            
                                            return (
                                                <Box key={topDept.id} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', minWidth: 150 }}>
                                                            {topDept.name}
                                                        </Typography>
                                                        {!isTopSelected ? (
                                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                <Button 
                                                                    size="small" 
                                                                    variant="outlined"
                                                                    onClick={() => setInviteForm({
                                                                        ...inviteForm,
                                                                        departments: [...inviteForm.departments, { departmentId: topDept.id, accessLevel: 'VIEW' }]
                                                                    })}
                                                                >
                                                                    +View
                                                                </Button>
                                                                <Button 
                                                                    size="small" 
                                                                    variant="outlined"
                                                                    onClick={() => setInviteForm({
                                                                        ...inviteForm,
                                                                        departments: [...inviteForm.departments, { departmentId: topDept.id, accessLevel: 'EDIT' }]
                                                                    })}
                                                                >
                                                                    +Edit
                                                                </Button>
                                                            </Box>
                                                        ) : (
                                                            <Chip 
                                                                label={inviteForm.departments.find(d => d.departmentId === topDept.id)?.accessLevel}
                                                                size="small"
                                                                color="primary"
                                                                onDelete={() => removeDepartmentFromInvite(topDept.id)}
                                                            />
                                                        )}
                                                    </Box>
                                                    
                                                    {subdepts.length > 0 && (
                                                        <Box sx={{ pl: 3, borderLeft: '2px solid', borderColor: 'divider' }}>
                                                            {subdepts.map((subDept) => {
                                                                const isSubSelected = inviteForm.departments.some(d => d.departmentId === subDept.id);
                                                                return (
                                                                    <Box key={subDept.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                                                                        <Typography variant="body2" sx={{ minWidth: 140 }}>
                                                                            {subDept.name}
                                                                        </Typography>
                                                                        {!isSubSelected ? (
                                                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                                <Button 
                                                                                    size="small" 
                                                                                    variant="text"
                                                                                    onClick={() => setInviteForm({
                                                                                        ...inviteForm,
                                                                                        departments: [...inviteForm.departments, { departmentId: subDept.id, accessLevel: 'VIEW' }]
                                                                                    })}
                                                                                    sx={{ minWidth: 'auto', px: 1 }}
                                                                                >
                                                                                    +View
                                                                                </Button>
                                                                                <Button 
                                                                                    size="small" 
                                                                                    variant="text"
                                                                                    onClick={() => setInviteForm({
                                                                                        ...inviteForm,
                                                                                        departments: [...inviteForm.departments, { departmentId: subDept.id, accessLevel: 'EDIT' }]
                                                                                    })}
                                                                                    sx={{ minWidth: 'auto', px: 1 }}
                                                                                >
                                                                                    +Edit
                                                                                </Button>
                                                                            </Box>
                                                                        ) : (
                                                                            <Chip 
                                                                                label={inviteForm.departments.find(d => d.departmentId === subDept.id)?.accessLevel}
                                                                                size="small"
                                                                                color="primary"
                                                                                onDelete={() => removeDepartmentFromInvite(subDept.id)}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                );
                                                            })}
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Paper>

                                    {inviteForm.departments.length === 0 && (
                                        <Alert severity="info" sx={{ mt: 2 }}>
                                            Add at least one department so the user can access the system.
                                        </Alert>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {inviteForm.role === 'SUPER_ADMIN' && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Super Admins have access to all departments automatically.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setInviteOpen(false);
                        setInviteForm({ email: '', name: '', role: 'USER', departments: [] });
                        setInviteDeptSelection({ departmentId: '', accessLevel: 'EDIT' });
                    }}>Cancel</Button>
                    <Button 
                        onClick={handleInvite} 
                        variant="contained"
                        disabled={!inviteForm.email || !inviteForm.name || (inviteForm.role !== 'SUPER_ADMIN' && inviteForm.departments.length === 0)}
                    >
                        Invite User
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User Role</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Change role for <strong>{editUser?.name}</strong> ({editUser?.email})
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={editRole}
                            label="Role"
                            onChange={(e) => setEditRole(e.target.value as 'SUPER_ADMIN' | 'DEPT_ADMIN' | 'USER')}
                        >
                            <MenuItem value="USER">
                                <Box>
                                    <Typography>User</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Can view and edit assigned departments only
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="DEPT_ADMIN">
                                <Box>
                                    <Typography>Department Admin</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Can manage users within their assigned departments
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="SUPER_ADMIN">
                                <Box>
                                    <Typography>Super Admin</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Full access to all departments and settings
                                    </Typography>
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>
                    {editRole === 'SUPER_ADMIN' && editUser?.role !== 'SUPER_ADMIN' && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Granting Super Admin access will give this user full control over all departments and system settings.
                        </Alert>
                    )}
                    {editRole !== 'SUPER_ADMIN' && editUser?.role === 'SUPER_ADMIN' && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Removing Super Admin access will restrict this user to only their assigned departments.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditUser(null)}>Cancel</Button>
                    <Button 
                        onClick={handleUpdateRole} 
                        variant="contained"
                        disabled={editRole === editUser?.role}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={!!permissionUser}
                onClose={() => setPermissionUser(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Manage Department Access - {permissionUser?.name}</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Current Permissions
                    </Typography>
                    {permissionUser?.departments.length === 0 ? (
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            No department access assigned
                        </Typography>
                    ) : (
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Department</TableCell>
                                        <TableCell>Access Level</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {permissionUser?.departments.map((perm) => (
                                        <TableRow key={perm.id}>
                                            <TableCell>{perm.department.name}</TableCell>
                                            <TableCell>
                                                <Chip label={perm.accessLevel} size="small" />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() =>
                                                        handleRevokePermission(permissionUser.id, perm.department.id)
                                                    }
                                                >
                                                    Revoke
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Grant New Permission
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={newPermission.departmentId}
                                label="Department"
                                onChange={(e) =>
                                    setNewPermission({ ...newPermission, departmentId: e.target.value })
                                }
                            >
                                {departments
                                    .filter(
                                        (d) =>
                                            !permissionUser?.departments.some(
                                                (p) => p.department.id === d.id
                                            )
                                    )
                                    .map((dept) => (
                                        <MenuItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Access Level</InputLabel>
                            <Select
                                value={newPermission.accessLevel}
                                label="Access Level"
                                onChange={(e) =>
                                    setNewPermission({
                                        ...newPermission,
                                        accessLevel: e.target.value as 'VIEW' | 'EDIT' | 'ADMIN',
                                    })
                                }
                            >
                                <MenuItem value="VIEW">View</MenuItem>
                                <MenuItem value="EDIT">Edit</MenuItem>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            onClick={handleGrantPermission}
                            disabled={!newPermission.departmentId}
                        >
                            Grant
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPermissionUser(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
