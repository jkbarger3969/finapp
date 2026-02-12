import { useState, useEffect } from 'react';
import { useQuery } from "urql";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Alert,
    CircularProgress,
    LinearProgress,
    Chip,
    Collapse,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useDepartment } from "../context/DepartmentContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, parseRational } from "../utils/currency";
import PageHeader from "../components/PageHeader";
import EntryFormDialog from "../components/EntryFormDialog";
import SearchDialog from "../components/SearchDialog";

const GET_BUDGET_DATA = `
    query GetBudgetData($entriesWhere: EntriesWhere, $budgetsWhere: BudgetsWhere) {
        entries(where: $entriesWhere) {
            id
            total
            category {
                type
            }
            department {
                id
                name
            }
        }
        budgets(where: $budgetsWhere) {
            id
            amount
            owner {
                __typename
                ... on Department {
                    id
                    name
                }
            }
            fiscalYear {
                id
                name
            }
        }
        departments {
            id
            name
            ancestors {
                __typename
                ... on Department {
                    id
                    name
                }
                ... on Business {
                    id
                }
            }
        }
        fiscalYears {
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
    const { fiscalYearId, setFiscalYearId } = useDepartment();
    const { user, isSuperAdmin } = useAuth();

    const [topLevelDeptId, setTopLevelDeptId] = useState('');
    const [subDeptId, setSubDeptId] = useState('');
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [entryDialogOpen, setEntryDialogOpen] = useState(false);
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

    const entriesWhere: any = { deleted: false };
    const budgetsWhere: any = {};

    if (fiscalYearId) {
        entriesWhere.fiscalYear = { id: { eq: fiscalYearId } };
        budgetsWhere.fiscalYear = { id: { eq: fiscalYearId } };
    }

    const [result] = useQuery({
        query: GET_BUDGET_DATA,
        variables: { entriesWhere, budgetsWhere },
        pause: !fiscalYearId,
    });

    const { data, fetching, error } = result;

    const fiscalYears = data?.fiscalYears || [];

    const userDepartments = (user as any)?.departments
        ?.map((p: any) => p.department?.id)
        .filter(Boolean) || [];

    // Debug: log user access info
    console.log('[Dashboard] User access:', { 
        isSuperAdmin, 
        userDepartments, 
        userRole: (user as any)?.role,
        departmentCount: userDepartments.length 
    });

    // Build department tree with budget and spending data
    const { topLevelDepts, totalBudget, totalSpent, topLevelDepartments, subDepartments } = (() => {
        if (!data?.entries || !data?.budgets || !data?.departments) {
            return { topLevelDepts: [], totalBudget: 0, totalSpent: 0, topLevelDepartments: [], subDepartments: [] };
        }

        const spendingByDept = new Map<string, number>();
        data.entries.forEach((entry: any) => {
            if (entry.department?.id && entry.category?.type === 'DEBIT') {
                const deptId = entry.department.id;
                const current = spendingByDept.get(deptId) || 0;
                spendingByDept.set(deptId, current + Math.abs(parseRational(entry.total)));
            }
        });

        const budgetByDept = new Map<string, number>();
        data.budgets.forEach((budget: any) => {
            if (budget.owner?.__typename === 'Department' && budget.owner?.id) {
                budgetByDept.set(budget.owner.id, parseRational(budget.amount));
            }
        });

        const deptMap = new Map<string, DeptNode>();
        const rootDepts: DeptNode[] = [];

        data.departments.forEach((dept: any) => {
            const deptAncestors = dept.ancestors?.filter((a: any) => a.__typename === 'Department') || [];
            deptMap.set(dept.id, {
                id: dept.id,
                name: dept.name,
                budget: budgetByDept.get(dept.id) || 0,
                spent: spendingByDept.get(dept.id) || 0,
                children: [],
                level: deptAncestors.length,
            });
        });

        data.departments.forEach((dept: any) => {
            const node = deptMap.get(dept.id)!;
            const deptAncestors = dept.ancestors?.filter((a: any) => a.__typename === 'Department') || [];

            if (deptAncestors.length === 0) {
                rootDepts.push(node);
            } else {
                const parentId = deptAncestors[deptAncestors.length - 1]?.id;
                const parent = parentId ? deptMap.get(parentId) : null;
                if (parent) {
                    parent.children.push(node);
                }
            }
        });

        // Filter by user access
        const canAccessDept = (deptId: string): boolean => {
            if (isSuperAdmin) return true;
            if (userDepartments.length === 0) return false; // No access = no departments shown
            if (userDepartments.includes(deptId)) return true;

            const dept = data.departments.find((d: any) => d.id === deptId);
            const ancestors = dept?.ancestors?.filter((a: any) => a.__typename === 'Department')?.map((a: any) => a.id) || [];
            return ancestors.some((ancestorId: string) => userDepartments.includes(ancestorId));
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
                        height: '100%',
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
                                            <Paper key={child.id} variant="outlined" sx={{ p: 1 }}>
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
                {/* Quick Action Card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{
                        p: 3,
                        height: '100%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' }
                    }}
                        onClick={() => setEntryDialogOpen(true)}
                    >
                        <Typography variant="h6" fontWeight="bold">Quick Action</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>Add a new expense or income</Typography>
                        <Box sx={{ bgcolor: 'white', color: 'primary.main', py: 1, px: 3, borderRadius: 8, fontWeight: 'bold' }}>
                            + New Entry
                        </Box>
                    </Paper>
                </Grid>

                {/* Key Metrics */}
                <Grid size={{ xs: 12, md: 8 }}>
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

                {fetching && (
                    <Grid size={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    </Grid>
                )}

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
        </Box>
    );
}
