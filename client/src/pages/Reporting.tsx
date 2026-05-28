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
    Stack,
    Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, isValid } from 'date-fns';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { useDepartment } from '../context/DepartmentContext';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import '../components/reporting/PrintLayout.css';
import PageHeader from '../components/PageHeader';
import CategoryAutocomplete from '../components/CategoryAutocomplete';
import PersonAutocomplete from '../components/PersonAutocomplete';
import BusinessAutocomplete from '../components/BusinessAutocomplete';
import { parseRational } from '../utils/rational';
import type {
    BusinessRecord,
    CategoryRecord,
    DepartmentRecord,
    GetFilterOptionsData,
    PersonRecord,
} from '../types/filterOptions';
import type { EntryRecord, EntriesWhereInput, GetEntriesByDepartmentData } from '../types/transactions';

const GET_ENTRIES_FOR_EXPORT = `
  query GetEntriesForExport($where: EntriesWhere!) {
    entries(where: $where, limit: 0) {
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
      reconciled
      refunds {
        id
        date
        description
        total
        reconciled
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
      displayName
      type
      hidden
      groupName
      sortOrder
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

interface ReportAuditRow {
    id: string;
    parentEntryId?: string;
    isRefund: boolean;
    date: string;
    description: string;
    categoryName: string;
    categoryType: 'CREDIT' | 'DEBIT' | 'UNKNOWN';
    status: 'Reconciled' | 'Pending';
    paymentMethodLabel: string;
    paymentMethodType: 'card' | 'check' | 'cash' | 'online' | 'other';
    departmentName: string;
    sourceLabel: string;
    amount: number;
    signedAmount: number;
    rowTypeLabel: 'Transaction' | 'Refund';
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const getPaymentMethodLabel = (paymentMethod: EntryRecord['paymentMethod'] | null | undefined): string => {
    if (!paymentMethod) return 'Unknown';
    if (paymentMethod.__typename === 'PaymentMethodCard') {
        return `Card ${paymentMethod.card?.type || ''} *${paymentMethod.card?.trailingDigits || ''}`.trim();
    }
    if (paymentMethod.__typename === 'PaymentMethodCheck') {
        return `Check #${paymentMethod.check?.checkNumber || ''}`.trim();
    }
    if (paymentMethod.__typename === 'PaymentMethodCash') return 'Cash';
    if (paymentMethod.__typename === 'PaymentMethodOnline') return 'Online';
    return 'Calculated/Other';
};

const getPaymentMethodType = (paymentMethod: EntryRecord['paymentMethod'] | null | undefined): ReportAuditRow['paymentMethodType'] => {
    if (!paymentMethod) return 'other';
    if (paymentMethod.__typename === 'PaymentMethodCard') return 'card';
    if (paymentMethod.__typename === 'PaymentMethodCheck') return 'check';
    if (paymentMethod.__typename === 'PaymentMethodCash') return 'cash';
    if (paymentMethod.__typename === 'PaymentMethodOnline') return 'online';
    return 'other';
};

const getSourceLabel = (source: EntryRecord['source']): string => {
    if (!source) return '';
    if (source.__typename === 'Person') return `${source.personName?.first || ''} ${source.personName?.last || ''}`.trim();
    if (source.__typename === 'Business') return source.businessName || '';
    return '';
};

export default function Reporting() {
    const { departmentId: contextDeptId, fiscalYearId, fiscalYears, setFiscalYearId } = useDepartment();
    const { selectedDepartmentId, setSelectedDepartmentId } = useLayout();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [entryType, setEntryType] = useState<string>('ALL');
    const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(null);
    const [selectedBusiness, setSelectedBusiness] = useState<BusinessRecord | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategoryRecord | null>(null);
    const [manualFilterDepartmentId, setManualFilterDepartmentId] = useState<string | null>(null);
    const [paymentMethodType] = useState<string>('ALL');
    const [reconcileFilter, setReconcileFilter] = useState<string>('ALL');
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    // Fetch filter options
    const [optionsResult] = useQuery<GetFilterOptionsData>({ query: GET_FILTER_OPTIONS });
    const peopleRaw = useMemo(() => optionsResult.data?.people || [], [optionsResult.data?.people]);
    const businessesRaw = useMemo(() => optionsResult.data?.businesses || [], [optionsResult.data?.businesses]);
    const categories = useMemo(() => optionsResult.data?.categories || [], [optionsResult.data?.categories]);
    const departmentsRaw = useMemo(() => optionsResult.data?.departments || [], [optionsResult.data?.departments]);
    const { user } = useAuth();

    // Sort and dedupe people (by full name, alphabetically)
    const people = useMemo(() => {
        const seen = new Set<string>();
        return peopleRaw
            .filter((p: PersonRecord) => {
                const key = `${p.name?.first || ''} ${p.name?.last || ''}`.toLowerCase().trim();
                if (seen.has(key) || !key) return false;
                seen.add(key);
                return true;
            })
            .sort((a: PersonRecord, b: PersonRecord) => {
                const nameA = `${a.name?.first || ''} ${a.name?.last || ''}`.toLowerCase();
                const nameB = `${b.name?.first || ''} ${b.name?.last || ''}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });
    }, [peopleRaw]);

    // Sort and dedupe businesses (alphabetically by name)
    const businesses = useMemo(() => {
        const seen = new Set<string>();
        return businessesRaw
            .filter((b: BusinessRecord) => {
                const key = (b.name || '').toLowerCase().trim();
                if (seen.has(key) || !key) return false;
                seen.add(key);
                return true;
            })
            .sort((a: BusinessRecord, b: BusinessRecord) => (a.name || '').localeCompare(b.name || ''));
    }, [businessesRaw]);

    // Filter departments based on access (using proper departmentId from permissions)
    // Include parent departments for navigation if user has subdepartment access
    const departments = useMemo(() => {
        let depts = departmentsRaw;
        if (user?.role !== 'SUPER_ADMIN') {
            const userDeptIds = user?.departments?.map((d) => d.departmentId) || [];
            if (userDeptIds.length > 0) {
                // First pass: find all departments user has direct or inherited access to
                const accessibleDeptIds = new Set<string>();
                
                departmentsRaw.forEach((d: DepartmentRecord) => {
                    // Direct access
                    if (userDeptIds.includes(d.id)) {
                        accessibleDeptIds.add(d.id);
                    }
                    // Inherited access (subdepartments of accessible parent)
                    if (d.parent?.__typename === 'Department' && userDeptIds.includes(d.parent.id)) {
                        accessibleDeptIds.add(d.id);
                    }
                });
                
                // Second pass: include parent departments for navigation if user has any subdepartment access
                departmentsRaw.forEach((d: DepartmentRecord) => {
                    if (accessibleDeptIds.has(d.id) && d.parent?.__typename === 'Department') {
                        // Include the parent for navigation purposes
                        accessibleDeptIds.add(d.parent.id);
                    }
                });
                
                depts = departmentsRaw.filter((d: DepartmentRecord) => accessibleDeptIds.has(d.id));
            }
        }
        return depts;
    }, [departmentsRaw, user]);

    const categoryOptions = useMemo(() => {
        return categories.map((cat: CategoryRecord) => ({
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
        return people.map((p: PersonRecord) => ({
            id: p.id,
            label: `${p.name?.first || ''} ${p.name?.last || ''}`.trim(),
            firstName: p.name?.first || '',
            lastName: p.name?.last || '',
        }));
    }, [people]);

    const businessOptions = useMemo(() => {
        return businesses.map((b: BusinessRecord) => ({
            id: b.id,
            label: b.name || '',
        }));
    }, [businesses]);

    // Split into Top/Sub
    const topLevelDepartments = useMemo(() => departments.filter((d: DepartmentRecord) => d.parent?.__typename === 'Business' || !d.parent), [departments]);
    const allChildDepartments = useMemo(() => departments.filter((d: DepartmentRecord) => d.parent?.__typename === 'Department'), [departments]);

    const [topLevelDeptId, setTopLevelDeptId] = useState<string>('');
    const [subDeptId, setSubDeptId] = useState<string>('');

    const subDepartments = useMemo(() => {
        // Get subdepartments based on selected top-level or all accessible subdepts
        let subs: DepartmentRecord[] = [];
        
        if (topLevelDeptId) {
            // Filter to children of selected top-level
            subs = allChildDepartments.filter((d: DepartmentRecord) => d.parent?.id === topLevelDeptId);
        } else {
            // No top-level selected - show ALL accessible subdepartments
            subs = allChildDepartments;
        }
        
        // For non-admins, further filter to only show subdepartments they have access to
        if (user?.role !== 'SUPER_ADMIN') {
            const userDeptIds = user?.departments?.map((d) => d.departmentId) || [];
            if (userDeptIds.length > 0) {
                subs = subs.filter((d: DepartmentRecord) =>
                    userDeptIds.includes(d.id) || 
                    (topLevelDeptId && userDeptIds.includes(topLevelDeptId)) ||
                    (d.parent?.id ? userDeptIds.includes(d.parent.id) : false)
                );
            }
        }
        return subs;
    }, [topLevelDeptId, allChildDepartments, user]);

    const filterDepartmentId = subDeptId || topLevelDeptId || manualFilterDepartmentId || null;

    // Sync selected department to LayoutContext for New Entry default
    useEffect(() => {
        const timer = setTimeout(() => {
            setSelectedDepartmentId(subDeptId || topLevelDeptId || null);
        }, 0);
        return () => clearTimeout(timer);
    }, [topLevelDeptId, subDeptId, setSelectedDepartmentId]);

    // Initialize filter from LayoutContext selectedDepartmentId (set by Dashboard/Transactions)
    useEffect(() => {
        if (!selectedDepartmentId || topLevelDeptId || subDeptId) return;
        if (departments.length === 0) return;

        const dept = departments.find((d: DepartmentRecord) => d.id === selectedDepartmentId);
        if (!dept) return;

        if (dept.parent?.__typename === 'Department') {
            const parentId = dept.parent.id;
            const timer = setTimeout(() => {
                setTopLevelDeptId(parentId);
                setSubDeptId(dept.id);
            }, 0);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                setTopLevelDeptId(dept.id);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [selectedDepartmentId, departments, topLevelDeptId, subDeptId]);

    // Initialize filter from DepartmentContext on mount
    useEffect(() => {
        if (!contextDeptId || topLevelDeptId || subDeptId) return;

        const dept = departments.find((d: DepartmentRecord) => d.id === contextDeptId);
        if (!dept) return;

        if (dept.parent?.__typename === 'Department') {
            const parentId = dept.parent.id;
            const timer = setTimeout(() => {
                setTopLevelDeptId(parentId);
                setSubDeptId(dept.id);
            }, 0);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                setTopLevelDeptId(dept.id);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [contextDeptId, departments, topLevelDeptId, subDeptId]);

    // Auto-select department for users with limited access
    useEffect(() => {
        // Skip if user already selected something or if coming from context
        if (topLevelDeptId || subDeptId || contextDeptId) return;
        if (user?.role === 'SUPER_ADMIN') return; // SuperAdmin sees all
        if (topLevelDepartments.length === 0) return;

        // If user only has access to ONE top-level department, auto-select it
        if (topLevelDepartments.length === 1) {
            const timer = setTimeout(() => {
                setTopLevelDeptId(topLevelDepartments[0].id);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [topLevelDepartments, user, topLevelDeptId, subDeptId, contextDeptId]);

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
        const baseWhere: EntriesWhereInput = { deleted: false };

        // Department filtering (from page filter dropdown, defaults to context)
        const filterDept = filterDepartmentId || contextDeptId;
        if (filterDept) {
            baseWhere.department = { id: { lte: filterDept } };
        } else if (user?.role !== 'SUPER_ADMIN' && departments.length > 0) {
            // For non-admins with no specific department selected, restrict to accessible departments
            const accessibleDeptIds = departments.map((d: DepartmentRecord) => d.id);
            if (accessibleDeptIds.length > 0) {
                baseWhere.department = { id: { in: accessibleDeptIds } };
            }
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
    }, [fiscalYearId, startDate, endDate, entryType, selectedPerson, selectedBusiness, selectedCategory, filterDepartmentId, reconcileFilter, user, departments, contextDeptId]);

    // Load full entries for report view + export + print
    const [entriesResult] = useQuery<GetEntriesByDepartmentData>({
        query: GET_ENTRIES_FOR_EXPORT,
        variables: { where },
        pause: !fiscalYearId,
    });

    const { data: entriesData, fetching, error } = entriesResult;
    const entries = useMemo(() => entriesData?.entries || [], [entriesData?.entries]);
    const auditRows = useMemo<ReportAuditRow[]>(() => {
        const rows: ReportAuditRow[] = [];

        entries.forEach((entry: EntryRecord) => {
            const amount = Math.abs(parseRational(entry.total));
            const categoryType = ((entry.category?.type || 'UNKNOWN').toUpperCase() as ReportAuditRow['categoryType']);
            const signedAmount = categoryType === 'CREDIT' ? amount : -amount;
            const sourceLabel = getSourceLabel(entry.source);

            rows.push({
                id: entry.id,
                isRefund: false,
                date: entry.date,
                description: entry.description || '',
                categoryName: entry.category?.name || 'Uncategorized',
                categoryType,
                status: entry.reconciled ? 'Reconciled' : 'Pending',
                paymentMethodLabel: getPaymentMethodLabel(entry.paymentMethod),
                paymentMethodType: getPaymentMethodType(entry.paymentMethod),
                departmentName: entry.department?.name || '',
                sourceLabel,
                amount,
                signedAmount,
                rowTypeLabel: 'Transaction',
            });

            (entry.refunds || []).forEach((refund) => {
                const refundAmount = Math.abs(parseRational(refund.total));
                const refundSignedAmount = categoryType === 'CREDIT' ? -refundAmount : refundAmount;
                rows.push({
                    id: `refund-${refund.id}`,
                    parentEntryId: entry.id,
                    isRefund: true,
                    date: refund.date,
                    description: refund.description || `Refund for: ${entry.description || 'Transaction'}`,
                    categoryName: `${entry.category?.name || 'Uncategorized'} (Refund)`,
                    categoryType,
                    status: refund.reconciled ? 'Reconciled' : 'Pending',
                    paymentMethodLabel: getPaymentMethodLabel(refund.paymentMethod as EntryRecord['paymentMethod']),
                    paymentMethodType: getPaymentMethodType(refund.paymentMethod as EntryRecord['paymentMethod']),
                    departmentName: entry.department?.name || '',
                    sourceLabel,
                    amount: refundAmount,
                    signedAmount: refundSignedAmount,
                    rowTypeLabel: 'Refund',
                });
            });
        });

        rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return rows;
    }, [entries]);

    const filteredRows = useMemo(() => {
        if (paymentMethodType === 'ALL') return auditRows;
        return auditRows.filter((row) => row.paymentMethodType === paymentMethodType);
    }, [auditRows, paymentMethodType]);

    const aggregatedData = useMemo(() => {
        const totalIncome = filteredRows
            .filter((r) => r.signedAmount > 0)
            .reduce((sum, r) => sum + r.signedAmount, 0);
        const totalExpenses = Math.abs(
            filteredRows
                .filter((r) => r.signedAmount < 0)
                .reduce((sum, r) => sum + r.signedAmount, 0)
        );
        const net = totalIncome - totalExpenses;
        const totalRefunds = filteredRows.filter((r) => r.isRefund).length;
        const reconciledRows = filteredRows.filter((r) => r.status === 'Reconciled').length;
        const unreconciledRows = filteredRows.length - reconciledRows;

        const categoryMap = new Map<string, number>();
        filteredRows.forEach((r) => {
            if (r.signedAmount >= 0) return;
            categoryMap.set(r.categoryName, (categoryMap.get(r.categoryName) || 0) + Math.abs(r.signedAmount));
        });
        const categoryChartData = Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        const trendMap = new Map<string, { income: number; expenses: number }>();
        filteredRows.forEach((r) => {
            const key = format(new Date(r.date), 'MMM yyyy');
            if (!trendMap.has(key)) trendMap.set(key, { income: 0, expenses: 0 });
            const v = trendMap.get(key)!;
            if (r.signedAmount >= 0) v.income += r.signedAmount;
            else v.expenses += Math.abs(r.signedAmount);
        });
        const trendChartData = Array.from(trendMap.entries()).map(([month, v]) => ({ month, income: v.income, expenses: v.expenses }));

        return {
            totalIncome,
            totalExpenses,
            net,
            totalRefunds,
            reconciledRows,
            unreconciledRows,
            totalRows: filteredRows.length,
            categoryChartData,
            trendChartData,
        };
    }, [filteredRows]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        if (filteredRows.length === 0) return;

        const headers = [
            'Date',
            'Record Type',
            'Status',
            'Description',
            'Category',
            'Category Type',
            'Signed Amount',
            'Absolute Amount',
            'Payment Method',
            'Department',
            'Source',
        ];

        const rows = filteredRows.map((row) => {
            const escape = (str?: string | null) => `"${(str || '').replace(/"/g, '""')}"`;
            return [
                escape(format(new Date(row.date), 'yyyy-MM-dd')),
                escape(row.rowTypeLabel),
                escape(row.status),
                escape(row.description),
                escape(row.categoryName),
                escape(row.categoryType),
                row.signedAmount.toFixed(2),
                row.amount.toFixed(2),
                escape(row.paymentMethodLabel),
                escape(row.departmentName),
                escape(row.sourceLabel),
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `department_audit_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClearFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setEntryType('ALL');
        setSelectedPerson(null);
        setSelectedBusiness(null);
        setSelectedCategory(null);
        setTopLevelDeptId('');
        setSubDeptId('');
        setManualFilterDepartmentId(null);
        setReconcileFilter('ALL');
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
                                disabled={fetching || filteredRows.length === 0}
                                    data-tooltip="Download department audit CSV (transactions + refunds)"
                                data-tooltip-pos="bottom"
                            >
                                Export CSV
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<PrintIcon />}
                                onClick={handlePrint}
                                disabled={fetching || filteredRows.length === 0}
                                    data-tooltip="Print department audit report (transactions + refunds)"
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
                        {/* Row 1: Fiscal Year, Date Range & Search */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Typography variant="subtitle2" sx={{ minWidth: 50, color: 'text.secondary' }}>Period:</Typography>
                                <TextField
                                    select
                                    label="Fiscal Year"
                                    size="small"
                                    value={fiscalYearId || ''}
                                    onChange={(e) => setFiscalYearId(e.target.value)}
                                    sx={{ width: 140 }}
                                    data-tooltip="Select fiscal year for report"
                                    data-tooltip-pos="top"
                                >
                                    {fiscalYears.map((fy) => (
                                        <MenuItem key={fy.id} value={fy.id}>{fy.name}</MenuItem>
                                    ))}
                                </TextField>

                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    slotProps={{ textField: { size: 'small', sx: { width: 130 }, inputProps: { 'data-tooltip': "Filter by start date", 'data-tooltip-pos': "top" } } }}
                                />
                                <Typography variant="body2" color="text.secondary">-</Typography>
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    slotProps={{ textField: { size: 'small', sx: { width: 130 }, inputProps: { 'data-tooltip': "Filter by end date", 'data-tooltip-pos': "top" } } }}
                                />
                            </Box>

                            <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Search details..."
                                    size="small"
                                    onClick={() => setSearchDialogOpen(true)}
                                    sx={{ cursor: 'pointer' }}
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
                                                ⌘K
                                            </Box>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>

                        <Divider />

                        {/* Row 2: Advanced Filters - matching Transactions page layout */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Dept */}
                            <TextField
                                select
                                label="Dept"
                                size="small"
                                value={topLevelDeptId}
                                onChange={(e) => {
                                    setTopLevelDeptId(e.target.value);
                                    setSubDeptId('');
                                }}
                                sx={{ width: 120 }}
                            >
                                <MenuItem value="">All</MenuItem>
                                {topLevelDepartments.map((dept) => (
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
                                    sx={{ width: 120 }}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {subDepartments.map((dept) => (
                                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                    ))}
                                </TextField>
                            )}

                            {/* Type */}
                            <TextField
                                select
                                label="Type"
                                size="small"
                                value={entryType}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setEntryType(newType);
                                    if (selectedCategory && newType !== 'ALL' && selectedCategory.type !== newType) {
                                        setSelectedCategory(null);
                                    }
                                }}
                                sx={{ width: 120 }}
                            >
                                <MenuItem value="ALL">All</MenuItem>
                                <MenuItem value="DEBIT">Expense</MenuItem>
                                <MenuItem value="CREDIT">Income</MenuItem>
                            </TextField>

                            {/* Status */}
                            <TextField
                                select
                                label="Status"
                                size="small"
                                value={reconcileFilter}
                                onChange={(e) => setReconcileFilter(e.target.value)}
                                sx={{ width: 120 }}
                            >
                                <MenuItem value="ALL">All</MenuItem>
                                <MenuItem value="RECONCILED">Reconciled</MenuItem>
                                <MenuItem value="UNRECONCILED">Unreconciled</MenuItem>
                            </TextField>

                            {/* Category */}
                            <Box sx={{ width: 250 }}>
                                <CategoryAutocomplete
                                    categories={categoryOptions.filter((cat) => {
                                        if (entryType === 'ALL') return true;
                                        if (entryType === 'CREDIT') return cat.type?.toUpperCase() === 'CREDIT';
                                        if (entryType === 'DEBIT') return cat.type?.toUpperCase() === 'DEBIT';
                                        return true;
                                    }).map((cat) => ({
                                        ...cat,
                                        displayName: cat.displayName ?? undefined,
                                        groupName: cat.groupName ?? undefined,
                                        sortOrder: cat.sortOrder ?? undefined,
                                    }))}
                                    value={selectedCategory?.id || ''}
                                    onChange={(categoryId) => {
                                        const cat = categories.find((c) => c.id === categoryId);
                                        setSelectedCategory(cat || null);
                                    }}
                                    size="small"
                                />
                            </Box>

                            {/* Person */}
                            <Box sx={{ width: 250 }}>
                                <PersonAutocomplete
                                    people={personOptions}
                                    value={selectedPerson?.id || ''}
                                    onChange={(personId) => {
                                        const person = people.find((p) => p.id === personId);
                                        setSelectedPerson(person || null);
                                        if (person) setSelectedBusiness(null);
                                    }}
                                    label="Person"
                                    size="small"
                                />
                            </Box>

                            {/* Business */}
                            <Box sx={{ width: 250 }}>
                                <BusinessAutocomplete
                                    businesses={businessOptions}
                                    value={selectedBusiness?.id || ''}
                                    onChange={(businessId) => {
                                        const biz = businesses.find((b) => b.id === businessId);
                                        setSelectedBusiness(biz || null);
                                        if (biz) setSelectedPerson(null);
                                    }}
                                    label="Business"
                                    size="small"
                                />
                            </Box>

                            {(startDate || endDate || entryType !== 'ALL' || selectedPerson || selectedBusiness || selectedCategory || filterDepartmentId) && (
                                <Button
                                    size="small"
                                    onClick={handleClearFilters}
                                    startIcon={<CloseIcon />}
                                    sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                                >
                                    Clear All
                                </Button>
                            )}
                        </Box>
                    </Stack>
                </Paper>

                {/* Printable Content Area */}
                <div id="printable-area" ref={printRef}>
                    {fetching && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}

                    {error && <Alert severity="error">Error loading report data: {error.message}</Alert>}

                    {
                        !fetching && !error && filteredRows.length === 0 && (
                            <Alert severity="info">No transactions found for the selected criteria.</Alert>
                        )
                    }

                    {
                        !fetching && !error && filteredRows.length > 0 && (
                            <Grid container spacing={3}>
                                {/* Summary Cards */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: '4px solid #00E5FF' }}>
                                        <Typography color="text.secondary" gutterBottom>Total Inflow (Income + Reconciled Refunds)</Typography>
                                        <Typography variant="h4" color="success.main" fontWeight="bold">
                                            {currencyFormatter.format(aggregatedData.totalIncome)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: '4px solid #F65161' }}>
                                        <Typography color="text.secondary" gutterBottom>Total Outflow (Expenses net of Reconciled Refunds)</Typography>
                                        <Typography variant="h4" color="error.main" fontWeight="bold">
                                            {currencyFormatter.format(aggregatedData.totalExpenses)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: `4px solid ${aggregatedData.net >= 0 ? '#00E5FF' : '#F65161'}` }}>
                                        <Typography color="text.secondary" gutterBottom>Department Net Change (Inflow - Outflow)</Typography>
                                        <Typography variant="h4" color={aggregatedData.net >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                                            {currencyFormatter.format(aggregatedData.net)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            This audit includes transactions and refunds. Reconciled refunds are applied back to department balances.
                                            Rows: {aggregatedData.totalRows} | Refund rows: {aggregatedData.totalRefunds} | Reconciled: {aggregatedData.reconciledRows} | Pending: {aggregatedData.unreconciledRows}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                {/* Trends Chart */}
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>Income vs Expenses (Trend)</Typography>
                                        <Box sx={{ height: 300, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {fetching ? (
                                                <CircularProgress />
                                            ) : (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={aggregatedData.trendChartData}>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#000', borderRadius: 8 }}
                                                            formatter={(value: number | string | undefined) => currencyFormatter.format(Number(value ?? 0))}
                                                        />
                                                        <Legend />
                                                        <Area type="monotone" dataKey="income" name="Income" stroke="#00C853" fill="rgba(0, 200, 83, 0.2)" />
                                                        <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#D50000" fill="rgba(213, 0, 0, 0.2)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Top Categories Chart */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>Top Spending Categories</Typography>
                                        <Box sx={{ height: 300, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {fetching ? (
                                                <CircularProgress />
                                            ) : (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={aggregatedData.categoryChartData} layout="vertical">
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                                        <XAxis type="number" hide />
                                                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                                                        <Tooltip
                                                            cursor={{ fill: 'transparent' }}
                                                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#000', borderRadius: 8 }}
                                                            formatter={(value: number | string | undefined) => currencyFormatter.format(Number(value ?? 0))}
                                                        />
                                                        <Bar dataKey="value" fill="#6C5DD3" radius={[0, 4, 4, 0]} barSize={20} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Detailed audit list (matches Transactions style intent) */}
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>Department Audit Details (Transactions + Refunds)</Typography>
                                        <Box sx={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.2)', textAlign: 'left' }}>
                                                        <th style={{ padding: 8 }}>Date</th>
                                                        <th style={{ padding: 8 }}>Type</th>
                                                        <th style={{ padding: 8 }}>Status</th>
                                                        <th style={{ padding: 8 }}>Description</th>
                                                        <th style={{ padding: 8 }}>Category</th>
                                                        <th style={{ padding: 8 }}>Payment</th>
                                                        <th style={{ padding: 8, textAlign: 'right' }}>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredRows.slice(0, 200).map((row) => (
                                                        <tr key={row.id} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                                                            <td style={{ padding: 8 }}>{format(parseISO(row.date), 'MMM dd, yyyy')}</td>
                                                            <td style={{ padding: 8 }}>{row.rowTypeLabel}</td>
                                                            <td style={{ padding: 8 }}>{row.status}</td>
                                                            <td style={{ padding: 8 }}>{row.description}</td>
                                                            <td style={{ padding: 8 }}>{row.categoryName}</td>
                                                            <td style={{ padding: 8 }}>{row.paymentMethodLabel}</td>
                                                            <td style={{ padding: 8, textAlign: 'right', color: row.signedAmount >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                                                                {currencyFormatter.format(row.signedAmount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {filteredRows.length > 200 && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                                                    Showing first 200 rows. Export CSV for full audit dataset.
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )
                    }
                </div>
            </Box>

            <SearchDialog
                open={searchDialogOpen}
                onClose={() => setSearchDialogOpen(false)}
            />
        </LocalizationProvider>
    );
}
