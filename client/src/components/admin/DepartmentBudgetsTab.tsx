import { useState, useEffect, useMemo } from 'react';
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
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    InputAdornment,
    Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { gql, useQuery, useMutation } from 'urql';

const GET_BUDGET_DATA = gql`
    query GetBudgetData($fiscalYearId: ID!) {
        departments {
            id
            name
            ancestors {
                id
            }
        }
        budgets(fiscalYearId: $fiscalYearId) {
            id
            amount
            owner {
                __typename
                ... on Department {
                    id
                    name
                }
            }
        }
        fiscalYears {
            id
            name
            begin
            end
            archived
        }
    }
`;

const UPSERT_BUDGET = gql`
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
            }
        }
    }
`;

interface Department {
    id: string;
    name: string;
    ancestors: { id: string }[];
}

interface Budget {
    id: string;
    amount: { s: number; n: number; d: number };
    owner: {
        __typename: string;
        id?: string;
        name?: string;
    };
}

interface FiscalYear {
    id: string;
    name: string;
    begin: string;
    end: string;
    archived: boolean;
}

function rationalToNumber(rational: { s: number; n: number; d: number } | null): number {
    if (!rational) return 0;
    return (rational.s * rational.n) / rational.d;
}

function toRationalString(amount: number): string {
    const cents = Math.round(amount * 100);
    return `${cents >= 0 ? 1 : -1} ${Math.abs(cents)} 100`;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
}

export default function DepartmentBudgetsTab() {
    const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');
    const [budgetAmounts, setBudgetAmounts] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    const [{ data, fetching, error: queryError }, reexecuteQuery] = useQuery({
        query: GET_BUDGET_DATA,
        variables: { fiscalYearId: selectedFiscalYear || 'none' },
        pause: !selectedFiscalYear,
    });

    const [, upsertBudget] = useMutation(UPSERT_BUDGET);

    const fiscalYears: FiscalYear[] = useMemo(() => {
        if (!data?.fiscalYears) return [];
        return [...data.fiscalYears]
            .filter((fy: FiscalYear) => !fy.archived)
            .sort((a: FiscalYear, b: FiscalYear) => 
                new Date(b.begin).getTime() - new Date(a.begin).getTime()
            );
    }, [data?.fiscalYears]);

    const topLevelDepartments: Department[] = useMemo(() => {
        if (!data?.departments) return [];
        return data.departments
            .filter((d: Department) => d.ancestors.length === 0)
            .sort((a: Department, b: Department) => a.name.localeCompare(b.name));
    }, [data?.departments]);

    const budgetsByDeptId: Record<string, Budget> = useMemo(() => {
        if (!data?.budgets) return {};
        const map: Record<string, Budget> = {};
        data.budgets.forEach((b: Budget) => {
            if (b.owner.__typename === 'Department' && b.owner.id) {
                map[b.owner.id] = b;
            }
        });
        return map;
    }, [data?.budgets]);

    useEffect(() => {
        if (fiscalYears.length > 0 && !selectedFiscalYear) {
            setSelectedFiscalYear(fiscalYears[0].id);
        }
    }, [fiscalYears, selectedFiscalYear]);

    useEffect(() => {
        if (data && topLevelDepartments.length > 0) {
            const amounts: Record<string, string> = {};
            topLevelDepartments.forEach((dept) => {
                const budget = budgetsByDeptId[dept.id];
                const amount = budget ? rationalToNumber(budget.amount) : 0;
                amounts[dept.id] = amount > 0 ? amount.toFixed(2) : '';
            });
            setBudgetAmounts(amounts);
            setHasChanges(false);
        }
    }, [data, topLevelDepartments, budgetsByDeptId]);

    const handleAmountChange = (deptId: string, value: string) => {
        const cleaned = value.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        const formatted = parts.length > 2 
            ? parts[0] + '.' + parts.slice(1).join('')
            : cleaned;
        
        setBudgetAmounts(prev => ({ ...prev, [deptId]: formatted }));
        setHasChanges(true);
        setSuccess(null);
    };

    const totalBudget = useMemo(() => {
        return Object.values(budgetAmounts).reduce((sum, amt) => {
            const num = parseFloat(amt) || 0;
            return sum + num;
        }, 0);
    }, [budgetAmounts]);

    const handleSaveAll = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            for (const dept of topLevelDepartments) {
                const amount = parseFloat(budgetAmounts[dept.id]) || 0;
                const existingBudget = budgetsByDeptId[dept.id];

                await upsertBudget({
                    input: {
                        id: existingBudget?.id || undefined,
                        amount: toRationalString(amount),
                        owner: { type: 'Department', id: dept.id },
                        fiscalYear: selectedFiscalYear,
                    },
                });
            }

            setSuccess('All department budgets saved successfully!');
            setHasChanges(false);
            reexecuteQuery({ requestPolicy: 'network-only' });
        } catch (err) {
            setError('Failed to save budgets. Please try again.');
            console.error('Error saving budgets:', err);
        } finally {
            setSaving(false);
        }
    };

    if (queryError) {
        return <Alert severity="error">Error loading data: {queryError.message}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Department Budget Setup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Set the total budget for each top-level department. Users can then allocate 
                funds to subdepartments on the Budget page, but cannot exceed these amounts.
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel>Fiscal Year</InputLabel>
                    <Select
                        value={selectedFiscalYear}
                        label="Fiscal Year"
                        onChange={(e) => {
                            setSelectedFiscalYear(e.target.value);
                            setHasChanges(false);
                        }}
                    >
                        {fiscalYears.map((fy) => (
                            <MenuItem key={fy.id} value={fy.id}>
                                {fy.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSaveAll}
                    disabled={!hasChanges || saving || !selectedFiscalYear}
                >
                    Save All Budgets
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {fetching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                        Department
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 200 }} align="right">
                                        Budget Amount
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topLevelDepartments.map((dept) => (
                                    <TableRow key={dept.id} hover>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="medium">
                                                {dept.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextField
                                                size="small"
                                                value={budgetAmounts[dept.id] || ''}
                                                onChange={(e) => handleAmountChange(dept.id, e.target.value)}
                                                placeholder="0.00"
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">$</InputAdornment>
                                                    ),
                                                }}
                                                sx={{ width: 150 }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {topLevelDepartments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            <Typography color="text.secondary">
                                                No departments found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6">
                            Total Church Budget:
                        </Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                            {formatCurrency(totalBudget)}
                        </Typography>
                    </Box>
                </>
            )}
        </Box>
    );
}
