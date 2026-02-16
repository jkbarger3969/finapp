import { useState, useRef, useMemo, useEffect } from 'react';
import { useQuery } from 'urql';
import SearchDialog from "../components/SearchDialog";
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, isValid } from 'date-fns';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { useDepartment } from '../context/DepartmentContext';
import { useAuth } from '../context/AuthContext';
import '../components/reporting/PrintLayout.css';
import PageHeader from '../components/PageHeader';
import CategoryAutocomplete from '../components/CategoryAutocomplete';
import PersonAutocomplete from '../components/PersonAutocomplete';
import BusinessAutocomplete from '../components/BusinessAutocomplete';

const GET_REPORT_DATA = `
  query GetReportData($where: EntriesWhere!) {
    entries(where: $where) {
      id
      description
      date
      total
      category {
        id
        name
        type
      }
      department {
        id
        name
      }
      source {
        __typename
        ... on Person {
          personName: name {
            first
            last
          }
        }
        ... on Business {
          businessName: name
        }
      }
      paymentMethod {
        __typename
        ... on PaymentMethodCard {
          card {
            type
            trailingDigits
          }
        }
        ... on PaymentMethodCheck {
          check {
            checkNumber
          }
        }
      }
    }
  }
`;

const GET_FILTER_OPTIONS = `
  query GetFilterOptions {
    people {
      id
      name {
        first
        last
      }
      hidden
    }
    businesses {
      id
      name
      hidden
    }
    categories {
      id
      name
      type
      hidden
    }
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

// Helper to parse Rational JSON
const parseRational = (rationalStr: any) => {
    try {
        const r = typeof rationalStr === 'string' ? JSON.parse(rationalStr) : rationalStr;
        return (r.n / r.d) * r.s;
    } catch {
        return 0;
    }
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export default function Reporting() {
    const { departmentId: contextDeptId, fiscalYearId, fiscalYears, setFiscalYearId } = useDepartment();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [entryType, setEntryType] = useState<string>('ALL');
    const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
    const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
    const [filterDepartmentId, setFilterDepartmentId] = useState<string | null>(null);
    const [paymentMethodType, setPaymentMethodType] = useState<string>('ALL');
    const [reconcileFilter, setReconcileFilter] = useState<string>('ALL');
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    // Fetch filter options
    const [optionsResult] = useQuery({ query: GET_FILTER_OPTIONS });
    const peopleRaw = optionsResult.data?.people || [];
    const businessesRaw = optionsResult.data?.businesses || [];
    const categories = optionsResult.data?.categories || [];
    const departmentsRaw = optionsResult.data?.departments || [];
    const { user } = useAuth();

    // Sort and dedupe people (by full name, alphabetically)
    const people = useMemo(() => {
        const seen = new Set<string>();
        return peopleRaw
            .filter((p: any) => {
                const key = `${p.name?.first || ''} ${p.name?.last || ''}`.toLowerCase().trim();
                if (seen.has(key) || !key) return false;
                seen.add(key);
                return true;
            })
            .sort((a: any, b: any) => {
                const nameA = `${a.name?.first || ''} ${a.name?.last || ''}`.toLowerCase();
                const nameB = `${b.name?.first || ''} ${b.name?.last || ''}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });
    }, [peopleRaw]);

    // Sort and dedupe businesses (alphabetically by name)
    const businesses = useMemo(() => {
        const seen = new Set<string>();
        return businessesRaw
            .filter((b: any) => {
                const key = (b.name || '').toLowerCase().trim();
                if (seen.has(key) || !key) return false;
                seen.add(key);
                return true;
            })
            .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
    }, [businessesRaw]);

    // Filter departments based on access (using proper departmentId from permissions)
    const departments = useMemo(() => {
        let depts = departmentsRaw;
        if (user?.role !== 'SUPER_ADMIN') {
            const userDeptIds = (user as any)?.departments?.map((d: any) => d.departmentId) || [];
            if (userDeptIds.length > 0) {
                depts = departmentsRaw.filter((d: any) => userDeptIds.includes(d.id));
            }
        }
        return depts;
    }, [departmentsRaw, user]);

    const categoryOptions = useMemo(() => {
        return categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            displayName: cat.displayName,
            type: cat.type,
            groupName: cat.groupName,
            sortOrder: cat.sortOrder,
            hidden: cat.hidden,
        }));
    }, [categories]);

    const personOptions = useMemo(() => {
        return people.map((p: any) => ({
            id: p.id,
            label: `${p.name?.first || ''} ${p.name?.last || ''}`.trim(),
            firstName: p.name?.first || '',
            lastName: p.name?.last || '',
        }));
    }, [people]);

    const businessOptions = useMemo(() => {
        return businesses.map((b: any) => ({
            id: b.id,
            label: b.name || '',
        }));
    }, [businesses]);

    // Split into Top/Sub
    const topLevelDepartments = useMemo(() => departments.filter((d: any) => d.parent?.__typename === 'Business' || !d.parent), [departments]);
    const allChildDepartments = useMemo(() => departments.filter((d: any) => d.parent?.__typename === 'Department'), [departments]);

    const [topLevelDeptId, setTopLevelDeptId] = useState<string>('');
    const [subDeptId, setSubDeptId] = useState<string>('');

    const subDepartments = useMemo(() => {
        return topLevelDeptId ? allChildDepartments.filter((d: any) => d.parent?.id === topLevelDeptId) : [];
    }, [topLevelDeptId, allChildDepartments]);

    // Derived filterDepartmentId
    useEffect(() => {
        setFilterDepartmentId(subDeptId || topLevelDeptId || null);
    }, [topLevelDeptId, subDeptId]);

    // Initialize filter from context on mount
    useEffect(() => {
        if (!contextDeptId || topLevelDeptId || subDeptId) return; // Don't override if user already set something

        // Find which department contextDeptId refers to
        const dept = departments.find((d: any) => d.id === contextDeptId);
        if (!dept) return;

        if (dept.parent?.__typename === 'Department') {
            // It's a subdepartment
            setTopLevelDeptId(dept.parent.id);
            setSubDeptId(dept.id);
        } else {
            // It's a top-level department
            setTopLevelDeptId(dept.id);
        }
    }, [contextDeptId, departments, topLevelDeptId, subDeptId]);

    // Global keyboard shortcut for search (Cmd/Ctrl + K)
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

    // Build query filters
    const where = useMemo(() => {
        const baseWhere: any = { deleted: false };

        // Department filtering (from page filter dropdown, defaults to context)
        const filterDept = filterDepartmentId || contextDeptId;
        if (filterDept) {
            baseWhere.department = { id: { lte: filterDept } };
        }

        if (fiscalYearId && !startDate && !endDate) baseWhere.fiscalYear = { id: { eq: fiscalYearId } };

        if (startDate || endDate) {
            baseWhere.date = {};
            if (startDate && isValid(startDate)) baseWhere.date.gte = startDate.toISOString();
            if (endDate && isValid(endDate)) baseWhere.date.lte = endDate.toISOString();
        }

        if (entryType !== 'ALL') {
            baseWhere.category = { type: entryType };
        }

        if (selectedCategory) {
            baseWhere.category = {
                ...baseWhere.category, // preserve type filter if present (though usually category implies type)
                id: { eq: selectedCategory.id }
            };
        }

        if (selectedPerson) {
            baseWhere.source = { people: { id: { eq: selectedPerson.id } } };
        } else if (selectedBusiness) {
            baseWhere.source = { businesses: { id: { eq: selectedBusiness.id } } };
        }

        if (reconcileFilter === 'RECONCILED') {
            baseWhere.reconciled = true;
        } else if (reconcileFilter === 'UNRECONCILED') {
            baseWhere.reconciled = false;
        }

        return baseWhere;
    }, [fiscalYearId, startDate, endDate, entryType, selectedPerson, selectedBusiness, selectedCategory, filterDepartmentId, reconcileFilter]);

    const [result] = useQuery({
        query: GET_REPORT_DATA,
        variables: { where },
        pause: !fiscalYearId,
    });

    const { data, fetching, error } = result;
    const entries = data?.entries || [];

    // Filter entries by payment method (client-side)
    const filteredEntries = useMemo(() => {
        if (!entries) return [];
        if (paymentMethodType === 'ALL') return entries;

        return entries.filter((entry: any) => {
            const type = entry.paymentMethod?.__typename;
            if (paymentMethodType === 'check') return type === 'PaymentMethodCheck';
            if (paymentMethodType === 'card') return type === 'PaymentMethodCard';
            if (paymentMethodType === 'cash') return type === 'PaymentMethodCash';
            if (paymentMethodType === 'online') return type === 'PaymentMethodOnline';
            return true;
        });
    }, [entries, paymentMethodType]);

    // Aggregations
    const aggregatedData = useMemo(() => {
        const byCategory: Record<string, number> = {};
        const byMonth: Record<string, { income: number; expenses: number }> = {};
        let totalIncome = 0;
        let totalExpenses = 0;

        filteredEntries.forEach((entry: any) => {
            const amount = Math.abs(parseRational(entry.total));
            const isCredit = entry.category?.type === 'CREDIT';
            const catName = entry.category?.name || 'Uncategorized';
            const monthKey = format(parseISO(entry.date), 'MMM yyyy');

            // Category Totals
            byCategory[catName] = (byCategory[catName] || 0) + amount;

            // Monthly Trends
            if (!byMonth[monthKey]) byMonth[monthKey] = { income: 0, expenses: 0 };
            if (isCredit) {
                byMonth[monthKey].income += amount;
                totalIncome += amount;
            } else {
                byMonth[monthKey].expenses += amount;
                totalExpenses += amount;
            }
        });

        const categoryChartData = Object.entries(byCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 categories

        const trendChartData = Object.entries(byMonth)
            .map(([month, values]) => ({
                month,
                ...values
            }))
            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        return {
            totalIncome,
            totalExpenses,
            net: totalIncome - totalExpenses,
            categoryChartData,
            trendChartData
        };
    }, [filteredEntries]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        if (filteredEntries.length === 0) return;

        const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Payment Method', 'Department', 'Source'];
        const rows = filteredEntries.map((entry: any) => {
            const date = new Date(entry.date).toISOString().split('T')[0];
            const amount = parseRational(entry.total);
            const type = entry.category?.type || '';
            const category = entry.category?.name || '';
            const dept = entry.department?.name || '';

            let payment = 'Unknown';
            if (entry.paymentMethod) {
                if (entry.paymentMethod.__typename === 'PaymentMethodCard') payment = `Card ${entry.paymentMethod.card?.type} *${entry.paymentMethod.card?.trailingDigits}`;
                else if (entry.paymentMethod.__typename === 'PaymentMethodCheck') payment = `Check #${entry.paymentMethod.check?.checkNumber}`;
                else if (entry.paymentMethod.__typename === 'PaymentMethodCash') payment = 'Cash';
                else if (entry.paymentMethod.__typename === 'PaymentMethodOnline') payment = 'Online';
                else payment = 'Calculated/Other';
            }

            let source = '';
            if (entry.source) {
                if (entry.source.__typename === 'Person') source = `${entry.source.personName?.first} ${entry.source.personName?.last}`;
                else if (entry.source.__typename === 'Business') source = entry.source.businessName;
            }

            // CSV Escape
            const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

            return [
                escape(date),
                escape(entry.description),
                escape(category),
                amount.toFixed(2),
                type,
                escape(payment),
                escape(dept),
                escape(source)
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `report_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!fiscalYearId) {
        return <Alert severity="info" sx={{ mt: 2 }}>Please select a department to view reports.</Alert>;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Header & Actions */}
                <PageHeader
                    title="Financial Reports"
                    subtitle="Analyze spending, income, and trends"
                    actions={
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={handleExportCSV}
                                disabled={fetching || filteredEntries.length === 0}
                                data-tooltip="Download report as CSV file"
                                data-tooltip-pos="bottom"
                            >
                                Export CSV
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<PrintIcon />}
                                onClick={handlePrint}
                                disabled={fetching || filteredEntries.length === 0}
                                data-tooltip="Print this report"
                                data-tooltip-pos="bottom"
                            >
                                Print Report
                            </Button>
                        </Stack>
                    }
                />

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 0.5 }}>
                    <Stack spacing={2}>
                        {/* Row 1: Fiscal Year, Date Range */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="subtitle2" sx={{ minWidth: 60 }}>Period:</Typography>

                            {/* Fiscal Year Selector */}
                            <TextField
                                select
                                label="Fiscal Year"
                                size="small"
                                value={fiscalYearId || ''}
                                onChange={(e) => setFiscalYearId(e.target.value)}
                                sx={{ minWidth: 150 }}
                                data-tooltip="Select fiscal year for report"
                                data-tooltip-pos="top"
                            >
                                {fiscalYears.map((fy: any) => (
                                    <MenuItem key={fy.id} value={fy.id}>
                                        {fy.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                slotProps={{ textField: { size: 'small', sx: { width: 150 }, inputProps: { 'data-tooltip': "Filter by start date", 'data-tooltip-pos': "top" } } }}
                            />
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                slotProps={{ textField: { size: 'small', sx: { width: 150 }, inputProps: { 'data-tooltip': "Filter by end date", 'data-tooltip-pos': "top" } } }}
                            />

                            {/* Search Input  */}
                            <TextField
                                placeholder="Search transactions..."
                                size="small"
                                onClick={() => setSearchDialogOpen(true)}
                                sx={{ minWidth: 350, cursor: 'pointer' }}
                                data-tooltip="Search by description, amount, or connected entity (Cmd+K)"
                                data-tooltip-pos="top"
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
                        </Box>

                        {/* Row 2: Advanced Filters */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="subtitle2" sx={{ minWidth: 60 }}>Filters:</Typography>
                            <TextField
                                select
                                label="Type"
                                size="small"
                                value={entryType}
                                onChange={(e) => setEntryType(e.target.value)}
                                sx={{ minWidth: 120 }}
                                data-tooltip="Filter by Income (Credit) or Expense (Debit)"
                                data-tooltip-pos="top"
                            >
                                <MenuItem value="ALL">All Types</MenuItem>
                                <MenuItem value="DEBIT">Expense</MenuItem>
                                <MenuItem value="CREDIT">Income</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Status"
                                size="small"
                                value={reconcileFilter}
                                onChange={(e) => setReconcileFilter(e.target.value)}
                                sx={{ minWidth: 150 }}
                                data-tooltip="Filter by reconciliation status"
                                data-tooltip-pos="top"
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
                                <MenuItem value="RECONCILED">Reconciled</MenuItem>
                                <MenuItem value="UNRECONCILED">Unreconciled</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Top Dept"
                                size="small"
                                value={topLevelDeptId}
                                onChange={(e) => {
                                    setTopLevelDeptId(e.target.value);
                                    setSubDeptId('');
                                    setSubDeptId('');
                                }}
                                sx={{ minWidth: 120 }}
                                data-tooltip="Filter by top-level department"
                                data-tooltip-pos="top"
                            >
                                <MenuItem value="">All</MenuItem>
                                {topLevelDepartments.map((dept: any) => (
                                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                ))}
                            </TextField>

                            {subDepartments.length > 0 && (
                                <TextField
                                    select
                                    label="Sub Dept"
                                    size="small"
                                    value={subDeptId}
                                    onChange={(e) => setSubDeptId(e.target.value)}
                                    sx={{ minWidth: 120 }}
                                    data-tooltip="Filter by sub-department"
                                    data-tooltip-pos="top"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {subDepartments.map((dept: any) => (
                                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                    ))}
                                </TextField>
                            )}

                            <TextField
                                select
                                label="Payment Type"
                                size="small"
                                value={paymentMethodType}
                                onChange={(e) => setPaymentMethodType(e.target.value)}
                                sx={{ minWidth: 120 }}
                                data-tooltip="Filter by payment method"
                                data-tooltip-pos="top"
                            >
                                <MenuItem value="ALL">All Payments</MenuItem>
                                <MenuItem value="check">Check</MenuItem>
                                <MenuItem value="card">Card</MenuItem>
                                <MenuItem value="cash">Cash</MenuItem>
                                <MenuItem value="online">Online</MenuItem>
                            </TextField>
                        </Box>
                        
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "flex-start", pt: 1 }}>
                            <Box sx={{ minWidth: 220 }}>
                                <CategoryAutocomplete
                                    categories={categoryOptions}
                                    value={selectedCategory?.id || ''}
                                    onChange={(categoryId) => {
                                        const cat = categories.find((c: any) => c.id === categoryId);
                                        setSelectedCategory(cat || null);
                                    }}
                                />
                            </Box>

                            <Box sx={{ minWidth: 220 }}>
                                <PersonAutocomplete
                                    people={personOptions}
                                    value={selectedPerson?.id || ''}
                                    onChange={(personId) => {
                                        const person = people.find((p: any) => p.id === personId);
                                        setSelectedPerson(person || null);
                                        if (person) setSelectedBusiness(null);
                                    }}
                                    label="Person"
                                />
                            </Box>

                            <Box sx={{ minWidth: 220 }}>
                                <BusinessAutocomplete
                                    businesses={businessOptions}
                                    value={selectedBusiness?.id || ''}
                                    onChange={(businessId) => {
                                        const biz = businesses.find((b: any) => b.id === businessId);
                                        setSelectedBusiness(biz || null);
                                        if (biz) setSelectedPerson(null);
                                    }}
                                    label="Business"
                                />
                            </Box>
                        </Box>
                        {(startDate || endDate || entryType !== 'ALL' || selectedPerson || selectedBusiness || selectedCategory || filterDepartmentId) && (
                            <Button
                                size="small"
                                color="inherit"
                                onClick={() => {
                                    setStartDate(null);
                                    setEndDate(null);
                                    setEntryType('ALL');
                                    setSelectedPerson(null);
                                    setSelectedBusiness(null);
                                    setSelectedCategory(null);
                                    setFilterDepartmentId(null);
                                }}
                                data-tooltip="Reset all active filters"
                                data-tooltip-pos="top"
                            >
                                Clear All
                            </Button>
                        )}
                    </Stack>
                </Paper >

                {/* Printable Content Area */}
                < div id="printable-area" ref={printRef} >
                    {fetching && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}

                    {error && <Alert severity="error">Error loading report data: {error.message}</Alert>}

                    {
                        !fetching && !error && filteredEntries.length === 0 && (
                            <Alert severity="info">No transactions found for the selected criteria.</Alert>
                        )
                    }

                    {
                        !fetching && !error && filteredEntries.length > 0 && (
                            <Grid container spacing={3}>
                                {/* Summary Cards */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: '4px solid #00E5FF' }}>
                                        <Typography color="text.secondary" gutterBottom>Total Income</Typography>
                                        <Typography variant="h4" color="success.main" fontWeight="bold">
                                            {currencyFormatter.format(aggregatedData.totalIncome)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: '4px solid #F65161' }}>
                                        <Typography color="text.secondary" gutterBottom>Total Expenses</Typography>
                                        <Typography variant="h4" color="error.main" fontWeight="bold">
                                            {currencyFormatter.format(aggregatedData.totalExpenses)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: `4px solid ${aggregatedData.net >= 0 ? '#00E5FF' : '#F65161'}` }}>
                                        <Typography color="text.secondary" gutterBottom>Net Position</Typography>
                                        <Typography variant="h4" color={aggregatedData.net >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                                            {currencyFormatter.format(aggregatedData.net)}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                {/* Trends Chart */}
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>Income vs Expenses (Trend)</Typography>
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={aggregatedData.trendChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#000', borderRadius: 8 }}
                                                        formatter={(value) => currencyFormatter.format(Number(value))}
                                                    />
                                                    <Legend />
                                                    <Area type="monotone" dataKey="income" name="Income" stroke="#00C853" fill="rgba(0, 200, 83, 0.2)" />
                                                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#D50000" fill="rgba(213, 0, 0, 0.2)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Top Categories Chart */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>Top Spending Categories</Typography>
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={aggregatedData.categoryChartData} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                                                    <Tooltip
                                                        cursor={{ fill: 'transparent' }}
                                                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#000', borderRadius: 8 }}
                                                        formatter={(value) => currencyFormatter.format(Number(value))}
                                                    />
                                                    <Bar dataKey="value" fill="#6C5DD3" radius={[0, 4, 4, 0]} barSize={20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Detailed Transaction List (Print Only or Table) */}
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>Transaction Details</Typography>
                                        <Box sx={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.2)', textAlign: 'left' }}>
                                                        <th style={{ padding: 8 }}>Date</th>
                                                        <th style={{ padding: 8 }}>Description</th>
                                                        <th style={{ padding: 8 }}>Category</th>
                                                        <th style={{ padding: 8, textAlign: 'right' }}>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredEntries.slice(0, 50).map((entry: any) => (
                                                        <tr key={entry.id} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                                                            <td style={{ padding: 8 }}>{format(parseISO(entry.date), 'MMM dd, yyyy')}</td>
                                                            <td style={{ padding: 8 }}>{entry.description}</td>
                                                            <td style={{ padding: 8 }}>{entry.category?.name}</td>
                                                            <td style={{ padding: 8, textAlign: 'right', color: entry.category?.type === 'CREDIT' ? 'green' : 'red', fontWeight: 'bold' }}>
                                                                {currencyFormatter.format(Math.abs(parseRational(entry.total)))}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {filteredEntries.length > 50 && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                                                    Showing first 50 transactions. Download full export for more.
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )
                    }
                </div >
            </Box >

            <SearchDialog
                open={searchDialogOpen}
                onClose={() => setSearchDialogOpen(false)}
            />
        </LocalizationProvider >
    );
}
