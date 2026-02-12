import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Stack,
    Collapse,
    LinearProgress,
    ToggleButton,
    ToggleButtonGroup,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';
import { useQuery, useMutation } from 'urql';
import { formatFiscalYearFromDates, getSuggestedFiscalYearDates, getCurrentFiscalYear } from '../../utils/fiscalYear';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../context/AuthContext';

const GET_BUDGET_DATA = `
    query GetBudgetData {
        fiscalYears {
            id
            name
            begin
            end
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
                    name
                }
            }
        }
        budgets {
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
    }
`;

const UPSERT_BUDGET = `
    mutation UpsertBudget($input: UpsertBudget!) {
        upsertBudget(input: $input) {
            budget {
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
                }
            }
        }
    }
`;

const CREATE_FISCAL_YEAR = `
    mutation CreateFiscalYear($input: CreateFiscalYearInput!) {
        createFiscalYear(input: $input) {
            fiscalYear {
                id
                name
                begin
                end
            }
        }
    }
`;

function parseRational(rational: any): number {
    if (!rational) return 0;
    try {
        const r = typeof rational === 'string' ? JSON.parse(rational) : rational;
        return (r.s * r.n) / r.d;
    } catch {
        return 0;
    }
}

function toRationalString(amount: number): string {
    return JSON.stringify({
        s: amount >= 0 ? 1 : -1,
        n: Math.abs(Math.round(amount * 100)),
        d: 100,
    });
}

interface DepartmentNode {
    id: string;
    name: string;
    children: DepartmentNode[];
    budget: number;
    budgetId?: string;
    level: number;
}

type InputMode = 'dollar' | 'percent';

export default function BudgetAllocationTab() {
    const { user, isSuperAdmin } = useAuth();
    const [result, reexecuteQuery] = useQuery({ query: GET_BUDGET_DATA });
    const [, upsertBudget] = useMutation(UPSERT_BUDGET);
    const [, createFiscalYear] = useMutation(CREATE_FISCAL_YEAR);

    const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [editingDept, setEditingDept] = useState<DepartmentNode | null>(null);
    const [editParentBudget, setEditParentBudget] = useState<string>('0');
    const [editAmounts, setEditAmounts] = useState<Record<string, string>>({});
    const [inputMode, setInputMode] = useState<InputMode>('dollar');

    const [fyDialogOpen, setFyDialogOpen] = useState(false);
    const [newFyYear, setNewFyYear] = useState<number>(() => {
        const currentFY = getCurrentFiscalYear();
        return parseInt(currentFY.id) + 1;
    });
    const [newFyBegin, setNewFyBegin] = useState('');
    const [newFyEnd, setNewFyEnd] = useState('');

    const hasAdminAccess = useCallback((deptId: string): boolean => {
        if (isSuperAdmin) return true;
        const perm = user?.departments.find(d => d.departmentId === deptId);
        return perm?.accessLevel === 'ADMIN';
    }, [user, isSuperAdmin]);

    const canAccessDept = useCallback((deptId: string): boolean => {
        if (isSuperAdmin) return true;
        if (!user?.departments || user.departments.length === 0) return false;
        return user.departments.some(d => d.departmentId === deptId);
    }, [user, isSuperAdmin]);

    useEffect(() => {
        if (fyDialogOpen && newFyYear) {
            const suggested = getSuggestedFiscalYearDates(newFyYear);
            setNewFyBegin(suggested.begin);
            setNewFyEnd(suggested.end);
        }
    }, [fyDialogOpen, newFyYear]);

    const { data, fetching } = result;

    useEffect(() => {
        if (data?.fiscalYears?.length > 0 && !selectedFiscalYear) {
            const now = new Date();
            const currentFY = data.fiscalYears.find((fy: any) => {
                const begin = new Date(fy.begin);
                const end = new Date(fy.end);
                return now >= begin && now < end;
            });
            setSelectedFiscalYear(currentFY?.id || data.fiscalYears[0]?.id || '');
        }
    }, [data?.fiscalYears, selectedFiscalYear]);

    const { topLevelDepts } = useMemo(() => {
        if (!data?.departments || !data?.budgets || !selectedFiscalYear) {
            return { topLevelDepts: [], deptMap: new Map() };
        }

        const map = new Map<string, DepartmentNode>();
        const rootDepts: DepartmentNode[] = [];

        const budgetsForFY = data.budgets.filter(
            (b: any) => b.fiscalYear?.id === selectedFiscalYear && b.owner?.__typename === 'Department'
        );

        const budgetByDeptId = new Map<string, { amount: number; id: string }>();
        budgetsForFY.forEach((b: any) => {
            if (b.owner?.id) {
                const parsedAmount = parseRational(b.amount);
                budgetByDeptId.set(b.owner.id, {
                    amount: parsedAmount,
                    id: b.id,
                });
            }
        });

        data.departments.forEach((dept: any) => {
            const budgetData = budgetByDeptId.get(dept.id);
            const ancestors = dept.ancestors?.filter((a: any) => a.__typename === 'Department') || [];
            map.set(dept.id, {
                id: dept.id,
                name: dept.name,
                children: [],
                budget: budgetData?.amount || 0,
                budgetId: budgetData?.id,
                level: ancestors.length,
            });
        });

        data.departments.forEach((dept: any) => {
            const node = map.get(dept.id)!;
            const deptAncestors = dept.ancestors?.filter((a: any) => a.__typename === 'Department') || [];

            if (deptAncestors.length === 0) {
                rootDepts.push(node);
            } else {
                const parentId = deptAncestors[deptAncestors.length - 1]?.id;
                const parent = parentId ? map.get(parentId) : null;
                if (parent) {
                    parent.children.push(node);
                } else {
                    rootDepts.push(node);
                }
            }
        });

        // Check if user has access to a department OR any of its descendants
        const hasAccessToTreeBranch = (node: DepartmentNode): boolean => {
            if (canAccessDept(node.id)) return true;
            return node.children.some(child => hasAccessToTreeBranch(child));
        };

        const accessibleRootDepts = isSuperAdmin
            ? rootDepts
            : rootDepts.filter(dept => hasAccessToTreeBranch(dept));

        // Debug log
        console.log('[BudgetAllocation] User departments:', user?.departments);
        console.log('[BudgetAllocation] Root depts:', rootDepts.map(d => d.name));
        console.log('[BudgetAllocation] Accessible root depts:', accessibleRootDepts.map(d => d.name));

        return { topLevelDepts: accessibleRootDepts, deptMap: map };
    }, [data, selectedFiscalYear, isSuperAdmin, canAccessDept, user]);

    const calcSubtotal = (dept: DepartmentNode): number => {
        return dept.budget + dept.children.reduce((sum, child) => sum + calcSubtotal(child), 0);
    };

    const totalBudget = useMemo(() => {
        return topLevelDepts.reduce((sum, dept) => sum + calcSubtotal(dept), 0);
    }, [topLevelDepts]);

    const toggleExpand = (deptId: string) => {
        const newExpanded = new Set(expandedDepts);
        if (newExpanded.has(deptId)) {
            newExpanded.delete(deptId);
        } else {
            newExpanded.add(deptId);
        }
        setExpandedDepts(newExpanded);
    };

    const startEditing = (dept: DepartmentNode) => {
        setEditingDept(dept);
        const childrenTotal = dept.children.reduce((sum, child) => sum + calcSubtotal(child), 0);
        const deptTotal = dept.budget + childrenTotal;
        setEditParentBudget(deptTotal.toString());
        const amounts: Record<string, string> = {};
        dept.children.forEach(child => {
            amounts[child.id] = calcSubtotal(child).toString();
        });
        setEditAmounts(amounts);
        setInputMode('dollar');
    };

    const cancelEditing = () => {
        setEditingDept(null);
        setEditParentBudget('0');
        setEditAmounts({});
        setInputMode('dollar');
    };

    const getParentBudgetNum = (): number => {
        return parseFloat(editParentBudget) || 0;
    };

    const getChildrenTotal = (): number => {
        if (!editingDept) return 0;
        return editingDept.children.reduce((sum, child) => sum + (parseFloat(editAmounts[child.id]) || 0), 0);
    };

    const isOverBudget = (): boolean => {
        if (!editingDept || editingDept.children.length === 0) return false;
        const parentBudget = getParentBudgetNum();
        const childrenTotal = getChildrenTotal();
        return childrenTotal > parentBudget && parentBudget > 0;
    };

    const getRemainingBudget = (): number => {
        return getParentBudgetNum() - getChildrenTotal();
    };

    const handleChildAmountChange = (childId: string, value: string) => {
        if (inputMode === 'dollar') {
            setEditAmounts({ ...editAmounts, [childId]: value });
        } else {
            const percent = parseFloat(value) || 0;
            const dollarAmount = (percent / 100) * getParentBudgetNum();
            setEditAmounts({ ...editAmounts, [childId]: dollarAmount.toFixed(2) });
        }
    };

    const getPercentValue = (childId: string): string => {
        const parentBudget = getParentBudgetNum();
        if (parentBudget === 0) return '0';
        const childAmount = parseFloat(editAmounts[childId]) || 0;
        return ((childAmount / parentBudget) * 100).toFixed(1);
    };

    const handleSaveEdits = async () => {
        if (!selectedFiscalYear || !editingDept) return;

        if (isOverBudget()) {
            setError('Cannot save: Subdepartments total exceeds parent budget');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const parentAmount = getParentBudgetNum();
            await upsertBudget({
                input: {
                    id: editingDept.budgetId || undefined,
                    amount: toRationalString(parentAmount),
                    owner: { type: 'Department', id: editingDept.id },
                    fiscalYear: selectedFiscalYear,
                },
            });

            for (const child of editingDept.children) {
                const childAmount = parseFloat(editAmounts[child.id]) || 0;
                await upsertBudget({
                    input: {
                        id: child.budgetId || undefined,
                        amount: toRationalString(childAmount),
                        owner: { type: 'Department', id: child.id },
                        fiscalYear: selectedFiscalYear,
                    },
                });
            }

            cancelEditing();
            reexecuteQuery({ requestPolicy: 'network-only' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateFiscalYear = async () => {
        if (!newFyYear || !newFyBegin || !newFyEnd) {
            setError('Please fill all fiscal year fields');
            return;
        }

        setSaving(true);
        setError(null);

        const displayName = `${newFyYear - 1}-${newFyYear}`;

        try {
            const result = await createFiscalYear({
                input: {
                    name: displayName,
                    begin: newFyBegin,
                    end: newFyEnd,
                },
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                setFyDialogOpen(false);
                setNewFyYear(newFyYear + 1);
                setNewFyBegin('');
                setNewFyEnd('');
                reexecuteQuery({ requestPolicy: 'network-only' });
                if (result.data?.createFiscalYear?.fiscalYear?.id) {
                    setSelectedFiscalYear(result.data.createFiscalYear.fiscalYear.id);
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const renderDepartmentCard = (dept: DepartmentNode) => {
        const hasChildren = dept.children.length > 0;
        const isExpanded = expandedDepts.has(dept.id);
        const childrenTotal = dept.children.reduce((sum, child) => sum + calcSubtotal(child), 0);
        const deptTotal = dept.budget + childrenTotal;
        const allocationPercent = deptTotal > 0 ? (childrenTotal / deptTotal) * 100 : 0;
        const canEdit = hasAdminAccess(dept.id);

        return (
            <Box key={dept.id} sx={{ mb: 2 }}>
                <Paper sx={{ p: 2, borderLeft: 4, borderColor: 'primary.main' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {hasChildren && (
                                <IconButton size="small" onClick={() => toggleExpand(dept.id)}>
                                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            )}
                            <Typography variant="h6" fontWeight="bold">{dept.name}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ textAlign: 'right', minWidth: 140 }}>
                                <Typography variant="caption" color="text.secondary">Total Budget</Typography>
                                <Typography variant="h5" color="primary.main" fontWeight="bold">
                                    {formatCurrency(deptTotal)}
                                </Typography>
                            </Box>
                            {hasChildren && dept.budget > 0 && (
                                <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                                    <Typography variant="caption" color="text.secondary">Direct</Typography>
                                    <Typography variant="body1">
                                        {formatCurrency(dept.budget)}
                                    </Typography>
                                </Box>
                            )}
                            {hasChildren && (
                                <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                                    <Typography variant="caption" color="text.secondary">In Subdepts</Typography>
                                    <Typography variant="body1" color="success.main">
                                        {formatCurrency(childrenTotal)} ({allocationPercent.toFixed(0)}%)
                                    </Typography>
                                </Box>
                            )}
                            <Tooltip title={canEdit ? "Edit budget allocation" : "No admin access to this department"}>
                                <span>
                                    <IconButton
                                        color="primary"
                                        onClick={() => startEditing(dept)}
                                        disabled={!canEdit}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    </Box>

                    {hasChildren && deptTotal > 0 && (
                        <Box sx={{ mt: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={100}
                                color="primary"
                                sx={{ height: 6, borderRadius: 3 }}
                            />
                        </Box>
                    )}
                </Paper>

                {hasChildren && (
                    <Collapse in={isExpanded}>
                        <Box sx={{ pl: 4, mt: 1, borderLeft: '2px dashed', borderColor: 'divider', ml: 2 }}>
                            {dept.children.map(child => {
                                const childSubtotal = calcSubtotal(child);
                                const childPercent = deptTotal > 0 ? (childSubtotal / deptTotal) * 100 : 0;
                                const childHasChildren = child.children.length > 0;
                                const childIsExpanded = expandedDepts.has(child.id);

                                return (
                                    <Box key={child.id} sx={{ mb: 1 }}>
                                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {childHasChildren && (
                                                        <IconButton size="small" onClick={() => toggleExpand(child.id)}>
                                                            {childIsExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                                        </IconButton>
                                                    )}
                                                    <Typography fontWeight="medium">{child.name}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                                                        {formatCurrency(childSubtotal)}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        ({childPercent.toFixed(1)}% of {dept.name})
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>

                                        {childHasChildren && (
                                            <Collapse in={childIsExpanded}>
                                                <Box sx={{ pl: 3, mt: 0.5, borderLeft: '1px dashed', borderColor: 'divider', ml: 1 }}>
                                                    {child.children.map(grandChild => {
                                                        const gcSubtotal = calcSubtotal(grandChild);
                                                        const gcPercent = childSubtotal > 0 ? (gcSubtotal / childSubtotal) * 100 : 0;
                                                        return (
                                                            <Paper
                                                                key={grandChild.id}
                                                                variant="outlined"
                                                                sx={{ p: 1, mb: 0.5, display: 'flex', justifyContent: 'space-between' }}
                                                            >
                                                                <Typography variant="body2">{grandChild.name}</Typography>
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    <Typography variant="body2" fontWeight="bold">{formatCurrency(gcSubtotal)}</Typography>
                                                                    <Typography variant="body2" color="text.secondary">({gcPercent.toFixed(1)}%)</Typography>
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

    if (fetching && !data) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const fiscalYears = data?.fiscalYears || [];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Budget Allocation</Typography>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setFyDialogOpen(true)}>
                    New Fiscal Year
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 250 }} size="small">
                    <InputLabel>Fiscal Year</InputLabel>
                    <Select
                        value={selectedFiscalYear}
                        label="Fiscal Year"
                        onChange={(e) => setSelectedFiscalYear(e.target.value)}
                    >
                        {fiscalYears.map((fy: any) => (
                            <MenuItem key={fy.id} value={fy.id}>
                                {formatFiscalYearFromDates(fy.begin, fy.end, fy.name)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {fiscalYears.length === 0 && (
                    <Alert severity="warning" sx={{ flex: 1 }}>
                        No fiscal years found. Create one to start allocating budgets.
                    </Alert>
                )}
            </Box>

            {selectedFiscalYear && (
                <>
                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.dark' }}>
                        <Typography variant="h5" color="primary.contrastText" align="center">
                            {isSuperAdmin ? 'Total Church Budget' : 'Your Accessible Budget'}: {formatCurrency(totalBudget)}
                        </Typography>
                        <Typography variant="body2" color="primary.contrastText" align="center" sx={{ opacity: 0.8 }}>
                            {isSuperAdmin 
                                ? 'Sum of all top-level department allocations'
                                : 'Sum of departments you have access to'}
                        </Typography>
                    </Paper>

                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Department Allocations
                    </Typography>

                    {topLevelDepts.map(dept => renderDepartmentCard(dept))}

                    {topLevelDepts.length === 0 && (
                        <Alert severity="info">
                            {isSuperAdmin 
                                ? 'No departments found. Create departments first to allocate budgets.'
                                : 'You do not have access to any departments. Contact an administrator to request access.'}
                        </Alert>
                    )}
                </>
            )}

            {/* Edit Budget Dialog */}
            <Dialog open={!!editingDept} onClose={cancelEditing} maxWidth="md" fullWidth>
                <DialogTitle>
                    Edit Budget: {editingDept?.name}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {/* Top Level Department Budget */}
                        <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Total Budget for {editingDept?.name}
                            </Typography>
                            <TextField
                                type="number"
                                value={editParentBudget}
                                onChange={(e) => setEditParentBudget(e.target.value)}
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    sx: { bgcolor: 'white', borderRadius: 1 }
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Paper>

                        {editingDept && editingDept.children.length > 0 && (
                            <>
                                <Divider />

                                {/* Input Mode Toggle */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Subdepartment Allocations
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={inputMode}
                                        exclusive
                                        onChange={(_, newMode) => newMode && setInputMode(newMode)}
                                        size="small"
                                    >
                                        <ToggleButton value="dollar">
                                            <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} /> Dollar
                                        </ToggleButton>
                                        <ToggleButton value="percent">
                                            <PercentIcon fontSize="small" sx={{ mr: 0.5 }} /> Percent
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                <Alert severity="info" sx={{ py: 0.5 }}>
                                    Subdepartment allocations cannot exceed the total budget of {formatCurrency(getParentBudgetNum())}
                                </Alert>

                                {/* Subdepartment Table */}
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Subdepartment</TableCell>
                                            <TableCell align="right" width={180}>
                                                {inputMode === 'dollar' ? 'Amount ($)' : 'Percent (%)'}
                                            </TableCell>
                                            <TableCell align="right" width={120}>
                                                {inputMode === 'dollar' ? 'Percent' : 'Amount'}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {editingDept.children.map(child => (
                                            <TableRow key={child.id}>
                                                <TableCell>{child.name}</TableCell>
                                                <TableCell align="right">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={inputMode === 'dollar' ? (editAmounts[child.id] || '0') : getPercentValue(child.id)}
                                                        onChange={(e) => handleChildAmountChange(child.id, e.target.value)}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    {inputMode === 'dollar' ? '$' : '%'}
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        inputProps={{
                                                            min: 0,
                                                            max: inputMode === 'percent' ? 100 : undefined,
                                                            step: inputMode === 'dollar' ? 0.01 : 0.1
                                                        }}
                                                        sx={{ width: 140 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" color="text.secondary">
                                                        {inputMode === 'dollar'
                                                            ? `${getPercentValue(child.id)}%`
                                                            : formatCurrency(parseFloat(editAmounts[child.id]) || 0)
                                                        }
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Divider />

                                {/* Summary */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography fontWeight="bold">Total Allocated:</Typography>
                                    <Typography fontWeight="bold" color={isOverBudget() ? 'error.main' : 'success.main'}>
                                        {formatCurrency(getChildrenTotal())}
                                        {' '}
                                        ({getParentBudgetNum() > 0 ? ((getChildrenTotal() / getParentBudgetNum()) * 100).toFixed(1) : 0}%)
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography>Remaining Unallocated:</Typography>
                                    <Typography color={getRemainingBudget() < 0 ? 'error.main' : 'text.secondary'}>
                                        {formatCurrency(getRemainingBudget())}
                                    </Typography>
                                </Box>

                                {/* Progress Bar */}
                                <Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min((getChildrenTotal() / (getParentBudgetNum() || 1)) * 100, 100)}
                                        color={isOverBudget() ? 'error' : 'primary'}
                                        sx={{ height: 10, borderRadius: 5 }}
                                    />
                                </Box>

                                {isOverBudget() && (
                                    <Alert severity="error" icon={<WarningIcon />}>
                                        Subdepartments total ({formatCurrency(getChildrenTotal())}) exceeds
                                        the total budget ({formatCurrency(getParentBudgetNum())}) by {formatCurrency(Math.abs(getRemainingBudget()))}.
                                        Please reduce allocations before saving.
                                    </Alert>
                                )}
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelEditing}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveEdits}
                        disabled={saving || isOverBudget()}
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Fiscal Year Dialog */}
            <Dialog open={fyDialogOpen} onClose={() => setFyDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Create New Fiscal Year</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Alert severity="info" sx={{ mb: 1 }}>
                            Fiscal year runs from September 1 to August 31.
                            Select the ending year to auto-populate dates.
                        </Alert>

                        <TextField
                            label="Fiscal Year Ending"
                            type="number"
                            value={newFyYear}
                            onChange={(e) => setNewFyYear(parseInt(e.target.value) || 0)}
                            fullWidth
                            helperText={`Will be displayed as: ${newFyYear - 1}-${newFyYear}`}
                            inputProps={{ min: 2020, max: 2100 }}
                        />

                        <TextField
                            label="Start Date (Sept 1)"
                            type="date"
                            value={newFyBegin}
                            onChange={(e) => setNewFyBegin(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            helperText="First day of fiscal year (inclusive)"
                        />
                        <TextField
                            label="End Date (Sept 1 of next year)"
                            type="date"
                            value={newFyEnd}
                            onChange={(e) => setNewFyEnd(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            helperText="Day after last day of fiscal year (exclusive boundary)"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFyDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateFiscalYear} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
