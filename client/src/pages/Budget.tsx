import { useQuery } from "urql";
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    LinearProgress,
    Chip,
    Collapse,
    IconButton,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from "react";
import { useDepartment } from "../context/DepartmentContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, parseRational } from "../utils/currency";

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

export default function Budget() {
    const { fiscalYearId } = useDepartment();
    const { user } = useAuth();
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

    const entriesWhere: any = { deleted: false };
    const budgetsWhere: any = {};

    if (fiscalYearId) {
        entriesWhere.fiscalYear = {
            id: { eq: fiscalYearId },
        };
        budgetsWhere.fiscalYear = {
            id: { eq: fiscalYearId },
        };
    }

    const [result] = useQuery({
        query: GET_BUDGET_DATA,
        variables: { entriesWhere, budgetsWhere },
        pause: !fiscalYearId,
    });

    const { data, fetching, error } = result;

    const userDepartments = (user as any)?.departments
        ?.map((p: any) => p.department?.id)
        .filter(Boolean) || [];
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const { topLevelDepts, totalBudget, totalSpent } = (() => {
        if (!data?.entries || !data?.budgets || !data?.departments) {
            return { topLevelDepts: [], totalBudget: 0, totalSpent: 0 };
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

        const canAccessDept = (deptId: string): boolean => {
            if (isSuperAdmin) return true;
            if (userDepartments.length === 0) return true;
            if (userDepartments.includes(deptId)) return true;

            const dept = data.departments.find((d: any) => d.id === deptId);
            const ancestors = dept?.ancestors?.filter((a: any) => a.__typename === 'Department')?.map((a: any) => a.id) || [];
            return ancestors.some((ancestorId: string) => userDepartments.includes(ancestorId));
        };

        const accessibleRootDepts = rootDepts.filter(dept => canAccessDept(dept.id));

        const filterAccessibleChildren = (node: DeptNode): DeptNode => {
            return {
                ...node,
                children: node.children
                    .filter(child => canAccessDept(child.id))
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

        return {
            topLevelDepts: filteredDepts,
            totalBudget: totals.budget,
            totalSpent: totals.spent
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
            <Box key={dept.id} sx={{ mb: 2 }}>
                <Paper
                    sx={{
                        p: 2,
                        borderLeft: 4,
                        borderColor: percentUsed > 100 ? 'error.main' : percentUsed > 80 ? 'warning.main' : 'success.main',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {hasChildren && (
                                <IconButton size="small" onClick={() => toggleExpand(dept.id)}>
                                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            )}
                            <Typography variant="h6" fontWeight="bold">
                                {dept.name}
                            </Typography>
                        </Box>
                        <Chip
                            label={`${Math.round(percentUsed)}%`}
                            size="small"
                            color={percentUsed > 100 ? 'error' : percentUsed > 80 ? 'warning' : 'success'}
                        />
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" color="text.secondary">Budget</Typography>
                            <Typography variant="h6">{formatCurrency(subtotals.budget)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" color="text.secondary">Spent</Typography>
                            <Typography variant="h6" color="error.main">{formatCurrency(subtotals.spent)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" color="text.secondary">Remaining</Typography>
                            <Typography variant="h6" color={remaining < 0 ? 'error.main' : 'success.main'}>
                                {formatCurrency(remaining)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <LinearProgress
                        variant="determinate"
                        value={Math.min(percentUsed, 100)}
                        color={percentUsed > 100 ? 'error' : percentUsed > 80 ? 'warning' : 'success'}
                        sx={{ height: 8, borderRadius: 4, mt: 2 }}
                    />
                </Paper>

                {hasChildren && (
                    <Collapse in={isExpanded}>
                        <Box sx={{ pl: 4, mt: 1, borderLeft: '2px dashed', borderColor: 'divider', ml: 2 }}>
                            {dept.children.map(child => {
                                const childSubtotals = calcSubtotals(child);
                                const childPercent = childSubtotals.budget > 0 ? (childSubtotals.spent / childSubtotals.budget) * 100 : 0;
                                const childRemaining = childSubtotals.budget - childSubtotals.spent;
                                const childHasChildren = child.children.length > 0;
                                const childIsExpanded = expandedDepts.has(child.id);

                                return (
                                    <Box key={child.id} sx={{ mb: 1 }}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 1.5,
                                                borderLeft: 3,
                                                borderColor: childPercent > 100 ? 'error.main' : childPercent > 80 ? 'warning.main' : 'success.main',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {childHasChildren && (
                                                        <IconButton size="small" onClick={() => toggleExpand(child.id)}>
                                                            {childIsExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                                        </IconButton>
                                                    )}
                                                    <Typography fontWeight="medium">{child.name}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        <Typography variant="caption" color="text.secondary">Budget</Typography>
                                                        <Typography variant="body2">{formatCurrency(childSubtotals.budget)}</Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        <Typography variant="caption" color="text.secondary">Spent</Typography>
                                                        <Typography variant="body2" color="error.main">{formatCurrency(childSubtotals.spent)}</Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        <Typography variant="caption" color="text.secondary">Remaining</Typography>
                                                        <Typography variant="body2" color={childRemaining < 0 ? 'error.main' : 'success.main'}>
                                                            {formatCurrency(childRemaining)}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`${Math.round(childPercent)}%`}
                                                        size="small"
                                                        color={childPercent > 100 ? 'error' : childPercent > 80 ? 'warning' : 'success'}
                                                    />
                                                </Box>
                                            </Box>
                                        </Paper>

                                        {childHasChildren && (
                                            <Collapse in={childIsExpanded}>
                                                <Box sx={{ pl: 3, mt: 0.5, borderLeft: '1px dashed', borderColor: 'divider', ml: 1 }}>
                                                    {child.children.map(grandChild => {
                                                        const gcSpent = grandChild.spent;
                                                        const gcBudget = grandChild.budget;
                                                        const gcPercent = gcBudget > 0 ? (gcSpent / gcBudget) * 100 : 0;

                                                        return (
                                                            <Paper
                                                                key={grandChild.id}
                                                                variant="outlined"
                                                                sx={{ p: 1, mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                            >
                                                                <Typography variant="body2">{grandChild.name}</Typography>
                                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                                    <Typography variant="body2">{formatCurrency(gcBudget)}</Typography>
                                                                    <Typography variant="body2" color="error.main">{formatCurrency(gcSpent)}</Typography>
                                                                    <Chip
                                                                        label={`${Math.round(gcPercent)}%`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color={gcPercent > 100 ? 'error' : gcPercent > 80 ? 'warning' : 'success'}
                                                                    />
                                                                </Box>
                                                            </Paper>
                                                        );
                                                    })}
                                                </Box>
                                            </Collapse>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Collapse>
                )}
            </Box>
        );
    };

    if (fetching) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Error loading budget data: {error.message}
            </Alert>
        );
    }

    if (!fiscalYearId) {
        return (
            <Alert severity="info" sx={{ m: 2 }}>
                Please select a fiscal year from the department selector above.
            </Alert>
        );
    }

    const totalRemaining = totalBudget - totalSpent;
    const totalPercentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Budget Overview</Typography>

            {totalBudget > 0 ? (
                <>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Overall Budget Summary</Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="overline" color="text.secondary">Total Budget</Typography>
                                    <Typography variant="h4">{formatCurrency(totalBudget)}</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="overline" color="text.secondary">Spent</Typography>
                                    <Typography variant="h4" color="error.main">
                                        {formatCurrency(totalSpent)}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="overline" color="text.secondary">Remaining</Typography>
                                    <Typography
                                        variant="h4"
                                        color={totalRemaining < 0 ? 'error.main' : 'success.main'}
                                    >
                                        {formatCurrency(totalRemaining)}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={12}>
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Budget Used</Typography>
                                        <Typography variant="body2">{Math.round(totalPercentUsed)}%</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(totalPercentUsed, 100)}
                                        color={totalPercentUsed > 100 ? 'error' : totalPercentUsed > 80 ? 'warning' : 'primary'}
                                        sx={{ height: 12, borderRadius: 6 }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Typography variant="h6" gutterBottom>Department Budgets</Typography>
                    {topLevelDepts.map(dept => renderDeptCard(dept))}

                    {topLevelDepts.length === 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No budget allocations found for your accessible departments.
                        </Alert>
                    )}
                </>
            ) : (
                <Alert severity="info">
                    No budgets have been allocated for the selected fiscal year.
                    {(user?.role === 'SUPER_ADMIN') && (
                        <> Go to Admin &gt; Budget Allocation to set up budgets.</>
                    )}
                </Alert>
            )}
        </Box>
    );
}
