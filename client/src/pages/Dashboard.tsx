import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "urql";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Alert,
    LinearProgress,
    Chip,
    Collapse,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useDepartment } from "../context/DepartmentContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/currency";
import PageHeader from "../components/PageHeader";
import EntryFormDialog from "../components/EntryFormDialog";
import SearchDialog from "../components/SearchDialog";
import InviteUserDialog from "../components/InviteUserDialog";
import { DashboardSkeleton } from "../components/common/DashboardSkeleton";

const GET_BUDGET_DATA = `
    query GetBudgetData($fiscalYearId: ID!) {
        departmentBudgetSummaries(fiscalYearId: $fiscalYearId) {
            id
            name
            budget
            spent
            level
            parentId
        }
        fiscalYears(where: { archived: false }) {
            id
            name
        }
    }
`;

interface DeptNode {
    id: string;
    name: string;
    budget: number;
    spent: number;
    children: DeptNode[];
    level: number;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { fiscalYearId, setFiscalYearId } = useDepartment();
    const { user, isSuperAdmin } = useAuth();

    const [topLevelDeptId, setTopLevelDeptId] = useState('');
    const [subDeptId, setSubDeptId] = useState('');
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [entryDialogOpen, setEntryDialogOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

    const [result] = useQuery({
        query: GET_BUDGET_DATA,
        variables: { fiscalYearId },
        pause: !fiscalYearId,
        requestPolicy: 'cache-and-network'
    });

    const { data, fetching, error } = result;

    const fiscalYears = data?.fiscalYears || [];

    const userDepartments = (user as any)?.departments
        ?.map((p: any) => p.departmentId)
        .filter(Boolean) || [];

    // Debug: log user access info
    console.log('[Dashboard] User access:', { 
        isSuperAdmin, 
        userDepartments, 
        userRole: (user as any)?.role,
        departmentCount: userDepartments.length,
        rawDepartments: (user as any)?.departments
    });

    // Build department tree with budget and spending data from server-side aggregation
    const { topLevelDepts, totalBudget, totalSpent, topLevelDepartments, subDepartments } = (() => {
        if (!data?.departmentBudgetSummaries) {
            return { topLevelDepts: [], totalBudget: 0, totalSpent: 0, topLevelDepartments: [], subDepartments: [] };
        }

        const deptMap = new Map<string, DeptNode>();
        const rootDepts: DeptNode[] = [];

        // First pass: create all nodes
        data.departmentBudgetSummaries.forEach((dept: any) => {
            deptMap.set(dept.id, {
                id: dept.id,
                name: dept.name,
                budget: dept.budget || 0,
                spent: dept.spent || 0,
                children: [],
                level: dept.level || 0,
            });
        });

        // Second pass: build tree structure
        data.departmentBudgetSummaries.forEach((dept: any) => {
            const node = deptMap.get(dept.id)!;
            if (!dept.parentId) {
                rootDepts.push(node);
            } else {
                const parent = deptMap.get(dept.parentId);
                if (parent) {
                    parent.children.push(node);
                } else {
                    // Parent not found, treat as root
                    rootDepts.push(node);
                }
            }
        });

        // Filter by user access
        const canAccessDept = (deptId: string): boolean => {
            if (isSuperAdmin) return true;
            if (userDepartments.length === 0) return false;
            if (userDepartments.includes(deptId)) return true;

            // Check if any ancestor is accessible
            const dept = data.departmentBudgetSummaries.find((d: any) => d.id === deptId);
            if (dept?.parentId && userDepartments.includes(dept.parentId)) return true;
            
            // Recursively check parent chain
            let currentParentId = dept?.parentId;
            while (currentParentId) {
                if (userDepartments.includes(currentParentId)) return true;
                const parentDept = data.departmentBudgetSummaries.find((d: any) => d.id === currentParentId);
                currentParentId = parentDept?.parentId;
            }
            return false;
        };

        // Check if user has access to a department OR any of its descendants
        const hasAccessToTreeBranch = (node: DeptNode): boolean => {
            if (canAccessDept(node.id)) return true;
            return node.children.some(child => hasAccessToTreeBranch(child));
        };

        // Filter root departments: include if user has access to root OR any child
        const accessibleRootDepts = rootDepts.filter(dept => hasAccessToTreeBranch(dept));

        const filterAccessibleChildren = (node: DeptNode): DeptNode => {
            return {
                ...node,
                children: node.children
                    .filter(child => hasAccessToTreeBranch(child))
                    .map(filterAccessibleChildren),
            };
        };

        const filteredDepts = accessibleRootDepts.map(filterAccessibleChildren);

        const calcTotals = (nodes: DeptNode[]): { budget: number; spent: number } => {
            return nodes.reduce((acc, node) => {
                const childTotals = calcTotals(node.children);
                return {
                    budget: acc.budget + node.budget + childTotals.budget,
                    spent: acc.spent + node.spent + childTotals.spent,
                };
            }, { budget: 0, spent: 0 });
        };

        const totals = calcTotals(filteredDepts);

        // Build top level and sub department lists for selector
        const topLevelDepartmentsList = filteredDepts.map(d => ({ id: d.id, name: d.name }));
        const selectedTopDept = filteredDepts.find(d => d.id === topLevelDeptId);
        const subDepartmentsList = selectedTopDept?.children.map(c => ({ id: c.id, name: c.name })) || [];

        return {
            topLevelDepts: filteredDepts,
            totalBudget: totals.budget,
            totalSpent: totals.spent,
            topLevelDepartments: topLevelDepartmentsList,
            subDepartments: subDepartmentsList,
        };
    })();

    const toggleExpand = (deptId: string) => {
        const newExpanded = new Set(expandedDepts);
        if (newExpanded.has(deptId)) {
            newExpanded.delete(deptId);
        } else {
            newExpanded.add(deptId);
        }
        setExpandedDepts(newExpanded);
    };

    const calcSubtotals = (dept: DeptNode): { budget: number; spent: number } => {
        const childTotals = dept.children.reduce((acc, child) => {
            const childSubtotals = calcSubtotals(child);
            return {
                budget: acc.budget + childSubtotals.budget,
                spent: acc.spent + childSubtotals.spent,
            };
        }, { budget: 0, spent: 0 });

        return {
            budget: dept.budget + childTotals.budget,
            spent: dept.spent + childTotals.spent,
        };
    };

    const navigateToTransactions = (departmentId: string) => {
        navigate('/transactions', { state: { departmentId } });
    };

    const renderDeptCard = (dept: DeptNode) => {
        const hasChildren = dept.children.length > 0;
        const isExpanded = expandedDepts.has(dept.id);
        const subtotals = calcSubtotals(dept);
        const percentUsed = subtotals.budget > 0 ? (subtotals.spent / subtotals.budget) * 100 : 0;
        const remaining = subtotals.budget - subtotals.spent;

        return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={dept.id}>
                <Paper
                    sx={{
                        p: 2,
                        borderTop: 4,
                        borderColor: percentUsed > 100 ? 'error.main' : percentUsed > 80 ? 'warning.main' : 'success.main',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold" noWrap title={dept.name} sx={{ maxWidth: '70%' }}>
                            {dept.name}
                        </Typography>
                        <Chip
                            label={`${Math.round(percentUsed)}%`}
                            size="small"
                            color={percentUsed > 100 ? 'error' : percentUsed > 80 ? 'warning' : 'success'}
                        />
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={Math.min(percentUsed, 100)}
                        color={percentUsed > 100 ? 'error' : percentUsed > 80 ? 'warning' : 'success'}
                        sx={{ height: 6, borderRadius: 3, mb: 2 }}
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Budget</Typography>
                            <Typography variant="subtitle1" fontWeight="medium">{formatCurrency(subtotals.budget)}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">Spent</Typography>
                            <Typography variant="subtitle1" color="error.main">{formatCurrency(subtotals.spent)}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Remaining</Typography>
                        <Typography variant="body1" fontWeight="bold" color={remaining < 0 ? 'error.main' : 'success.main'}>
                            {formatCurrency(remaining)}
                        </Typography>
                    </Box>

                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReceiptLongIcon />}
                        onClick={() => navigateToTransactions(dept.id)}
                        sx={{ mt: 2 }}
                        fullWidth
                    >
                        View Transactions
                    </Button>

                    {hasChildren && (
                        <Box sx={{ mt: 2 }}>
                            <IconButton
                                size="small"
                                onClick={() => toggleExpand(dept.id)}
                                sx={{ width: '100%', borderRadius: 1, justifyContent: 'center', fontSize: '0.875rem' }}
                            >
                                {isExpanded ? <ExpandLessIcon fontSize="small" sx={{ mr: 1 }} /> : <ExpandMoreIcon fontSize="small" sx={{ mr: 1 }} />}
                                {isExpanded ? 'Hide Subdepartments' : 'View Subdepartments'}
                            </IconButton>
                            <Collapse in={isExpanded}>
                                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {dept.children.map(child => {
                                        const childSubtotals = calcSubtotals(child);
                                        const cPercent = childSubtotals.budget > 0 ? (childSubtotals.spent / childSubtotals.budget) * 100 : 0;

                                        return (
                                            <Paper 
                                                key={child.id} 
                                                variant="outlined" 
                                                sx={{ 
                                                    p: 1, 
                                                    cursor: 'pointer',
                                                    '&:hover': { bgcolor: 'action.hover' }
                                                }}
                                                onClick={() => navigateToTransactions(child.id)}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2" fontWeight="medium">{child.name}</Typography>
                                                    <Typography variant="caption" fontWeight="bold" color={cPercent > 100 ? 'error.main' : 'text.primary'}>
                                                        {Math.round(cPercent)}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(cPercent, 100)}
                                                    color={cPercent > 100 ? 'error' : cPercent > 80 ? 'warning' : 'success'}
                                                    sx={{ height: 4, borderRadius: 2 }}
                                                />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                    <Typography variant="caption" color="text.secondary">{formatCurrency(childSubtotals.spent)} spent</Typography>
                                                    <Typography variant="caption" color="text.secondary">of {formatCurrency(childSubtotals.budget)}</Typography>
                                                </Box>
                                            </Paper>
                                        );
                                    })}
                                </Box>
                            </Collapse>
                        </Box>
                    )}
                </Paper>
            </Grid>
        );
    };

    // Filter departments to display based on selector
    const getDisplayedDepts = () => {
        if (subDeptId) {
            for (const topDept of topLevelDepts) {
                const subDept = topDept.children.find(c => c.id === subDeptId);
                if (subDept) return [subDept];
            }
            return [];
        }
        if (topLevelDeptId) {
            const topDept = topLevelDepts.find(d => d.id === topLevelDeptId);
            return topDept ? [topDept] : [];
        }
        return topLevelDepts;
    };

    const displayedDepts = getDisplayedDepts();

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchDialogOpen(true);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                setEntryDialogOpen(true);
            }
            if (e.key === 'Escape') {
                setSearchDialogOpen(false);
                setEntryDialogOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const totalRemaining = totalBudget - totalSpent;

    return (
        <Box>
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your financial activity"
                actions={
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={() => setEntryDialogOpen(true)}
                            sx={{ textTransform: 'none' }}
                        >
                            + New Entry
                        </Button>
                        {(user as any)?.canInviteUsers && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => setInviteDialogOpen(true)}
                                sx={{ textTransform: 'none' }}
                            >
                                + Invite User
                            </Button>
                        )}
                    </Box>
                }
            />

            {/* Department Selector */}
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ minWidth: 80 }}>Department:</Typography>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Fiscal Year</InputLabel>
                    <Select
                        value={fiscalYearId || ''}
                        onChange={(e: SelectChangeEvent) => setFiscalYearId(e.target.value)}
                        label="Fiscal Year"
                    >
                        {fiscalYears.map((fy: any) => (
                            <MenuItem key={fy.id} value={fy.id}>{fy.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Top Dept</InputLabel>
                    <Select
                        value={topLevelDeptId}
                        onChange={(e: SelectChangeEvent) => {
                            setTopLevelDeptId(e.target.value);
                            setSubDeptId('');
                        }}
                        label="Top Dept"
                    >
                        <MenuItem value="">All</MenuItem>
                        {topLevelDepartments.map((dept: any) => (
                            <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {subDepartments.length > 0 && (
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Sub Dept</InputLabel>
                        <Select
                            value={subDeptId}
                            onChange={(e: SelectChangeEvent) => setSubDeptId(e.target.value)}
                            label="Sub Dept"
                        >
                            <MenuItem value="">All</MenuItem>
                            {subDepartments.map((dept: any) => (
                                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <TextField
                    placeholder="Search transactions..."
                    size="small"
                    onClick={() => setSearchDialogOpen(true)}
                    sx={{ minWidth: 350, cursor: 'pointer' }}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                🔍
                            </Box>
                        ),
                        endAdornment: (
                            <Box component="span" sx={{ ml: 1, display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.75rem' }}>
                                ⌘K / Ctrl+K
                            </Box>
                        ),
                    }}
                />
            </Paper>

            <Grid container spacing={3}>
                {/* Key Metrics */}
                <Grid size={12}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper sx={{ p: 3, borderLeft: '4px solid #00E5FF', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Total Budget</Typography>
                                <Typography variant="h4" fontWeight={800}>
                                    {formatCurrency(totalBudget)}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper sx={{ p: 3, borderLeft: '4px solid #FF6B6B', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Spent</Typography>
                                <Typography variant="h4" fontWeight={800} color="error.main">
                                    {formatCurrency(totalSpent)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget` : '0%'}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper sx={{ p: 3, borderLeft: `4px solid ${totalRemaining < 0 ? '#FF6B6B' : '#4CAF50'}`, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Remaining</Typography>
                                <Typography variant="h4" fontWeight={800} color={totalRemaining < 0 ? 'error.main' : 'success.main'}>
                                    {formatCurrency(totalRemaining)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {totalBudget > 0 ? `${((totalRemaining / totalBudget) * 100).toFixed(1)}% of budget` : '0%'}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Department Budget Cards */}
                <Grid size={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Department Budgets</Typography>
                </Grid>

                {fetching && <DashboardSkeleton />}

                {error && (
                    <Grid size={12}>
                        <Alert severity="error">Error loading budget data: {error.message}</Alert>
                    </Grid>
                )}

                {!fetching && !error && displayedDepts.map(dept => renderDeptCard(dept))}

                {!fetching && !error && displayedDepts.length === 0 && (
                    <Grid size={12}>
                        <Alert severity="info">
                            No budget allocations found for your accessible departments.
                            {isSuperAdmin && (
                                <> Go to Budget Allocations to set up budgets.</>
                            )}
                        </Alert>
                    </Grid>
                )}
            </Grid>

            <EntryFormDialog
                open={entryDialogOpen}
                onClose={() => setEntryDialogOpen(false)}
                onSuccess={() => {
                    setEntryDialogOpen(false);
                    window.location.reload();
                }}
            />

            <SearchDialog
                open={searchDialogOpen}
                onClose={() => setSearchDialogOpen(false)}
            />

            {(user as any)?.canInviteUsers && (
                <InviteUserDialog
                    open={inviteDialogOpen}
                    onClose={() => setInviteDialogOpen(false)}
                    onSuccess={() => setInviteDialogOpen(false)}
                />
            )}
        </Box>
    );
}
