import { useState, useMemo, useEffect } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import { useQuery, useMutation } from 'urql';
import { formatFiscalYearFromDates, getSuggestedFiscalYearDates, getCurrentFiscalYear } from '../../utils/fiscalYear';
import { formatCurrency } from '../../utils/currency';

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

export default function BudgetAllocationTab() {
    const [result, reexecuteQuery] = useQuery({ query: GET_BUDGET_DATA });
    const [, upsertBudget] = useMutation(UPSERT_BUDGET);
    const [, createFiscalYear] = useMutation(CREATE_FISCAL_YEAR);
    
    const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    
    const [editingDept, setEditingDept] = useState<DepartmentNode | null>(null);
    const [editAmounts, setEditAmounts] = useState<Record<string, string>>({});
    
    const [fyDialogOpen, setFyDialogOpen] = useState(false);
    const [newFyYear, setNewFyYear] = useState<number>(() => {
        const currentFY = getCurrentFiscalYear();
        return parseInt(currentFY.id) + 1;
    });
    const [newFyBegin, setNewFyBegin] = useState('');
    const [newFyEnd, setNewFyEnd] = useState('');

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

    const { topLevelDepts, deptMap } = useMemo(() => {
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
                budgetByDeptId.set(b.owner.id, {
                    amount: parseRational(b.amount),
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

        return { topLevelDepts: rootDepts, deptMap: map };
    }, [data, selectedFiscalYear]);

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
        const amounts: Record<string, string> = {};
        amounts[dept.id] = dept.budget.toString();
        dept.children.forEach(child => {
            amounts[child.id] = child.budget.toString();
        });
        setEditAmounts(amounts);
    };

    const cancelEditing = () => {
        setEditingDept(null);
        setEditAmounts({});
    };

    const getEditSubtotal = (): number => {
        if (!editingDept) return 0;
        return Object.values(editAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    };

    const getChildrenTotal = (): number => {
        if (!editingDept) return 0;
        return editingDept.children.reduce((sum, child) => sum + (parseFloat(editAmounts[child.id]) || 0), 0);
    };

    const getParentBudget = (): number => {
        if (!editingDept) return 0;
        return parseFloat(editAmounts[editingDept.id]) || 0;
    };

    const isOverBudget = (): boolean => {
        if (!editingDept || editingDept.children.length === 0) return false;
        const parentBudget = getParentBudget();
        const childrenTotal = getChildrenTotal();
        return childrenTotal > parentBudget && parentBudget > 0;
    };

    const handleSaveEdits = async () => {
        if (!selectedFiscalYear || !editingDept) return;

        setSaving(true);
        setError(null);

        try {
            const parentAmount = parseFloat(editAmounts[editingDept.id]) || 0;
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
        const subtotal = calcSubtotal(dept);
        const childrenTotal = dept.children.reduce((sum, child) => sum + calcSubtotal(child), 0);
        const isEditing = editingDept?.id === dept.id;

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
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary">Direct</Typography>
                                <Typography variant="body1" fontWeight="bold">{formatCurrency(dept.budget)}</Typography>
                            </Box>
                            {hasChildren && (
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.secondary">Subdepts</Typography>
                                    <Typography variant="body1" color="info.main">{formatCurrency(childrenTotal)}</Typography>
                                </Box>
                            )}
                            <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                                <Typography variant="caption" color="text.secondary">Total</Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    {formatCurrency(subtotal)}
                                </Typography>
                            </Box>
                            <Tooltip title="Edit budget allocation">
                                <IconButton color="primary" onClick={() => startEditing(dept)}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Paper>

                {hasChildren && (
                    <Collapse in={isExpanded}>
                        <Box sx={{ pl: 4, mt: 1, borderLeft: '2px dashed', borderColor: 'divider', ml: 2 }}>
                            {dept.children.map(child => {
                                const childSubtotal = calcSubtotal(child);
                                const childHasChildren = child.children.length > 0;
                                const childIsExpanded = expandedDepts.has(child.id);
                                const childChildrenTotal = child.children.reduce((sum, gc) => sum + calcSubtotal(gc), 0);

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
                                                    <Typography variant="body2">Direct: {formatCurrency(child.budget)}</Typography>
                                                    {childHasChildren && (
                                                        <Typography variant="body2" color="info.main">Subs: {formatCurrency(childChildrenTotal)}</Typography>
                                                    )}
                                                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                                                        Total: {formatCurrency(childSubtotal)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>

                                        {childHasChildren && (
                                            <Collapse in={childIsExpanded}>
                                                <Box sx={{ pl: 3, mt: 0.5, borderLeft: '1px dashed', borderColor: 'divider', ml: 1 }}>
                                                    {child.children.map(grandChild => (
                                                        <Paper 
                                                            key={grandChild.id}
                                                            variant="outlined"
                                                            sx={{ p: 1, mb: 0.5, display: 'flex', justifyContent: 'space-between' }}
                                                        >
                                                            <Typography variant="body2">{grandChild.name}</Typography>
                                                            <Typography variant="body2" fontWeight="bold">{formatCurrency(grandChild.budget)}</Typography>
                                                        </Paper>
                                                    ))}
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
                            Total Church Budget: {formatCurrency(totalBudget)}
                        </Typography>
                        <Typography variant="body2" color="primary.contrastText" align="center" sx={{ opacity: 0.8 }}>
                            Sum of all department allocations
                        </Typography>
                    </Paper>

                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Department Allocations
                    </Typography>

                    {topLevelDepts.map(dept => renderDepartmentCard(dept))}

                    {topLevelDepts.length === 0 && (
                        <Alert severity="info">
                            No departments found. Create departments first to allocate budgets.
                        </Alert>
                    )}
                </>
            )}

            <Dialog open={!!editingDept} onClose={cancelEditing} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Edit Budget: {editingDept?.name}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label={`${editingDept?.name} Direct Budget`}
                            type="number"
                            value={editAmounts[editingDept?.id || ''] || '0'}
                            onChange={(e) => setEditAmounts({ ...editAmounts, [editingDept?.id || '']: e.target.value })}
                            fullWidth
                            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
                        />

                        {editingDept && editingDept.children.length > 0 && (
                            <>
                                <Divider />
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Subdepartment Allocations
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Subdepartment total should not exceed the parent's direct budget
                                </Typography>

                                {editingDept.children.map(child => (
                                    <TextField
                                        key={child.id}
                                        label={child.name}
                                        type="number"
                                        value={editAmounts[child.id] || '0'}
                                        onChange={(e) => setEditAmounts({ ...editAmounts, [child.id]: e.target.value })}
                                        fullWidth
                                        size="small"
                                        InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
                                    />
                                ))}

                                <Divider />
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography>Subdepartments Total:</Typography>
                                    <Typography fontWeight="bold" color={isOverBudget() ? 'error.main' : 'primary.main'}>
                                        {formatCurrency(getChildrenTotal())}
                                    </Typography>
                                </Box>

                                {isOverBudget() && (
                                    <Alert severity="warning" icon={<WarningIcon />}>
                                        Subdepartments total ({formatCurrency(getChildrenTotal())}) exceeds parent budget ({formatCurrency(getParentBudget())})
                                    </Alert>
                                )}

                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Budget allocation progress
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={Math.min((getChildrenTotal() / (getParentBudget() || 1)) * 100, 100)}
                                        color={isOverBudget() ? 'error' : 'primary'}
                                        sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {formatCurrency(getParentBudget() - getChildrenTotal())} remaining to allocate
                                    </Typography>
                                </Box>
                            </>
                        )}

                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography fontWeight="bold">Grand Total:</Typography>
                            <Typography fontWeight="bold" color="primary.main">
                                {formatCurrency(getEditSubtotal())}
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelEditing}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSaveEdits} 
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

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
