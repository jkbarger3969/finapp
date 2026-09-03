import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery } from "urql";
import SearchDialog from "../components/SearchDialog";
import { useLocation } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    Chip,
    Alert,
    Fade,
    Button,
    FormControlLabel,
    Checkbox,
    Stack,
    Badge,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import type { GridColDef, GridRowSelectionModel, GridRowId, GridSortModel } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useDepartment } from "../context/DepartmentContext";
import { useAuth } from "../context/AuthContext";
import { useOnlineStatus } from "../context/OnlineStatusContext";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { ReceiptManagerDialog } from "../components/ReceiptManagerDialog";
import EditEntryDialog from "../components/EditEntryDialog";
import EntryFormDialog from "../components/EntryFormDialog";
import PageHeader from "../components/PageHeader";
import PersonAutocomplete from "../components/PersonAutocomplete";
import BusinessAutocomplete from "../components/BusinessAutocomplete";
import { useLayout } from "../context/LayoutContext";

// New Imports
import { useSnackbar } from 'notistack';
import { TableSkeleton } from '../components/common/TableSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useTransactions } from '../hooks/useTransactions';
import type { RefundCandidateEntry } from '../components/EntryFormDialog';
import type {
    BusinessRecord,
    CategoryRecord,
    DepartmentRecord,
    GetFilterOptionsData,
    PersonRecord,
} from '../types/filterOptions';
import type { EntryRecord, PaymentMethod } from '../types/transactions';

const RECONCILE_ENTRIES_MUTATION = `
mutation ReconcileEntries($input: ReconcileEntries!) {
  reconcileEntries(input: $input) {
    reconciledEntries {
      id
      reconciled
    }
  }
}
`;

const DELETE_ENTRY_MUTATION = `
mutation DeleteEntry($id: ID!) {
  deleteEntry(id: $id) {
    deletedEntry {
      id
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

// Helper to parse Rational JSON
const parseRational = (rationalStr: string) => {
    try {
        const { s, n, d } = JSON.parse(rationalStr);
        return (n / d) * s;
    } catch {
        return 0;
    }
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

interface TransactionRow extends EntryRecord {
    id: string;
    refundId?: string;
    isRefund?: boolean;
    isRefundForEntry?: boolean;
    isOriginalForRefund?: boolean;
    isSpacerRow?: boolean;
    hasRefunds?: boolean;
    rowType?: 'CREDIT' | 'DEBIT';
    originalEntry?: EntryRecord;
    parentEntryId?: string;
    isLastDataRow?: boolean;
    formattedTotal?: string;
}

const toRefundCandidate = (row: TransactionRow | null): RefundCandidateEntry | null => {
    if (!row) return null;
    return {
        id: row.id,
        date: row.date,
        description: row.description,
        total: row.total,
        department: row.department ?? null,
        category: row.category ?? null,
        refunds: (row.refunds || []).map((r) => ({ id: r.id, total: r.total })),
        paymentMethod: row.paymentMethod ? { ...(row.paymentMethod as object) } : null,
    };
};

const toEditDialogEntry = (row: TransactionRow | null): TransactionRow | null => {
    if (!row) return null;
    if (row.isRefund || row.isRefundForEntry) {
        return {
            ...row,
            id: row.refundId || row.id,
            isRefund: true,
        };
    }
    return row;
};

interface CellParams {
    row: TransactionRow;
    value?: unknown;
}

type ActiveFilterType =
    | 'startDate'
    | 'endDate'
    | 'entryType'
    | 'category'
    | 'department'
    | 'person'
    | 'business'
    | 'paymentMethod'
    | 'matching'
    | 'reconciled';

interface ActiveFilter {
    type: ActiveFilterType;
    label: string;
    value?: string;
}

const CustomCheckbox = (props: object) => (
    <Checkbox {...props} icon={<RadioButtonUncheckedIcon />} checkedIcon={<CheckCircleIcon />} />
);

export default function Transactions() {
    const { departmentId: contextDeptId, fiscalYearId, fiscalYears, setFiscalYearId } = useDepartment();
    const { setSelectedDepartmentId, refreshTrigger } = useLayout();

    // Filter state
    const [reconcileFilter, setReconcileFilter] = useState<string>('ALL');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Advanced Filters (matching Reporting)
    const [entryType, setEntryType] = useState<string>('ALL');
    const [selectedCategories, setSelectedCategories] = useState<CategoryRecord[]>([]);
    const [manualFilterDepartmentId, setManualFilterDepartmentId] = useState<string | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(null);

    const [selectedBusiness, setSelectedBusiness] = useState<BusinessRecord | null>(null);
    const [paymentMethodType, setPaymentMethodType] = useState<string>('ALL');

    const [showMatchingOnly, setShowMatchingOnly] = useState(false);
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set<GridRowId>() });
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pendingDepartmentId, setPendingDepartmentId] = useState<string | null>(null);
    const location = useLocation();

    // Handle navigation from Dashboard or SearchDialog
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;

        if (location.state?.searchQuery) {
            timer = setTimeout(() => {
                setSearchTerm(location.state.searchQuery);
            }, 0);

            // If coming from SearchDialog with clearFilters, temporarily clear fiscal year
            // so we can see ALL matching transactions across all periods
            if (location.state?.clearFilters) {
                // Note: We can't easily clear fiscalYearId since it comes from context
                // Instead, we'll modify the where clause to ignore fiscal year when searchTerm is set
                // (see where clause logic below)
            }

            // Clear navigation state so refresh doesn't re-trigger
            window.history.replaceState({}, document.title);
        }

        // Handle navigation from Dashboard budget cards
        if (location.state?.departmentId) {
            const pendingId = location.state.departmentId as string;
            timer = setTimeout(() => {
                setPendingDepartmentId(pendingId);
            }, 0);
            // Clear navigation state so refresh doesn't re-trigger
            window.history.replaceState({}, document.title);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [location.state]);

    // Expandable refunds state
    const [expandedRefunds, setExpandedRefunds] = useState<Set<string>>(new Set());
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "date", sort: "desc" }]);

    // Action menu state
    const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionMenuEntry, setActionMenuEntry] = useState<TransactionRow | null>(null);

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editEntry, setEditEntry] = useState<TransactionRow | null>(null);

    // Refund dialog state
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [refundEntry, setRefundEntry] = useState<TransactionRow | null>(null);

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<TransactionRow | null>(null);

    // Fetch filter options
    const [optionsResult] = useQuery<GetFilterOptionsData>({ query: GET_FILTER_OPTIONS });
    const peopleRaw = useMemo(() => optionsResult.data?.people || [], [optionsResult.data?.people]);
    const businessesRaw = useMemo(() => optionsResult.data?.businesses || [], [optionsResult.data?.businesses]);
    const categories = useMemo(() => optionsResult.data?.categories || [], [optionsResult.data?.categories]);
    const departmentsRaw = useMemo(() => optionsResult.data?.departments || [], [optionsResult.data?.departments]);
    const { user, canEditTransaction, canDeleteTransaction, canIssueRefund } = useAuth();

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

    // Filter departments based on user access (using proper departmentId from permissions)
    // Also include subdepartments of any top-level department the user has access to
    // AND include parent departments (for navigation) if user has access to any subdepartment
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

    // Process pending department ID from Dashboard navigation
    useEffect(() => {
        if (!pendingDepartmentId || !departmentsRaw || departmentsRaw.length === 0) return;

        const dept = departmentsRaw.find((d: DepartmentRecord) => d.id === pendingDepartmentId);
        if (!dept) {
            console.log('[Transactions] Department not found:', pendingDepartmentId);
            return;
        }

        console.log('[Transactions] Setting department filter:', dept.name, 'parent:', dept.parent?.name);

        if (dept.parent?.__typename === 'Department') {
            // It's a subdepartment
            const parentId = dept.parent.id;
            const timer = setTimeout(() => {
                setTopLevelDeptId(parentId);
                setSubDeptId(dept.id);
                setPendingDepartmentId(null);
            }, 0);
            return () => clearTimeout(timer);
        } else {
            // It's a top-level department
            const timer = setTimeout(() => {
                setTopLevelDeptId(dept.id);
                setSubDeptId('');
                setPendingDepartmentId(null);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [pendingDepartmentId, departmentsRaw]);

    const filterDepartmentId = subDeptId || topLevelDeptId || manualFilterDepartmentId || null;

    // Sync selected department to LayoutContext for New Entry default
    useEffect(() => {
        setSelectedDepartmentId(subDeptId || topLevelDeptId || null);
    }, [topLevelDeptId, subDeptId, setSelectedDepartmentId]);

    // Initialize filter from context on mount
    useEffect(() => {
        if (!contextDeptId || topLevelDeptId || subDeptId) return; // Don't override if user already set something

        // Find which department contextDeptId refers to
        const dept = departments.find((d: DepartmentRecord) => d.id === contextDeptId);
        if (!dept) return;

        if (dept.parent?.__typename === 'Department') {
            // It's a subdepartment
            const parentId = dept.parent.id;
            const timer = setTimeout(() => {
                setTopLevelDeptId(parentId);
                setSubDeptId(dept.id);
            }, 0);
            return () => clearTimeout(timer);
        } else {
            // It's a top-level department
            const timer = setTimeout(() => {
                setTopLevelDeptId(dept.id);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [contextDeptId, departments, topLevelDeptId, subDeptId]);

    // Auto-select department for users with limited access
    useEffect(() => {
        // Skip if user already selected something or if coming from context
        if (topLevelDeptId || subDeptId || contextDeptId || pendingDepartmentId) return;
        if (user?.role === 'SUPER_ADMIN') return; // SuperAdmin sees all
        if (topLevelDepartments.length === 0) return;

        // If user only has access to ONE top-level department, auto-select it
        if (topLevelDepartments.length === 1) {
            const timer = setTimeout(() => {
                setTopLevelDeptId(topLevelDepartments[0].id);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [topLevelDepartments, user, topLevelDeptId, subDeptId, contextDeptId, pendingDepartmentId]);

    // Global keyboard shortcut for search (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchDialogOpen(true);
            }
            if (e.key === 'Escape') {
                setSearchDialogOpen(false);
                setEditDialogOpen(false);
                setRefundDialogOpen(false);
                setReceiptDialogOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const [, reconcileEntries] = useMutation(RECONCILE_ENTRIES_MUTATION);
    const [, deleteEntry] = useMutation(DELETE_ENTRY_MUTATION);

    const { enqueueSnackbar } = useSnackbar();
    const { isOnline } = useOnlineStatus();

    // Use Custom Hook for data fetching
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

    // Use Custom Hook for data fetching
    const { entries, totalCount, summary, fetching, error, refresh } = useTransactions({
        departmentId: filterDepartmentId || contextDeptId,
        accessibleDepartmentIds: user?.role !== 'SUPER_ADMIN' ? departments.map((d: DepartmentRecord) => d.id) : [],
        fiscalYearId,
        reconcileFilter,
        startDate,
        endDate,
        entryType,
        categoryIds: selectedCategories.map((c) => c.id),
        personId: selectedPerson?.id,
        businessId: selectedBusiness?.id,
        paginationModel,
        paymentMethodType,
        searchTerm,
        hasRefunds: showMatchingOnly ? true : undefined,
    });

    // Refresh when new entry is created (from LayoutContext)
    useEffect(() => {
        if (refreshTrigger > 0) {
            refresh();
        }
    }, [refreshTrigger, refresh]);

    // Alias refresh to handleReexecute for compatibility
    const handleReexecute = refresh;

    const handleClearAllFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setEntryType('ALL');
        setSelectedCategories([]);
        setManualFilterDepartmentId(null);
        setSelectedPerson(null);
        setSelectedBusiness(null);
        setPaymentMethodType('ALL');
        setShowMatchingOnly(false);
        setReconcileFilter('ALL');
        setSearchTerm('');
    };

    // Column Definitions
    const columns = [
        {
            field: "actions",
            headerName: "Menu",
            width: 80,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: CellParams) => {
                if (params.row.isOriginalForRefund || params.row.isSpacerRow) return null;
                return (
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuAnchor(e.currentTarget);
                            setActionMenuEntry(params.row);
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                );
            },
        },
        {
            field: "reconciled",
            headerName: "Status",
            width: 100,
            align: 'left',
            headerAlign: 'center',
            renderCell: (params: CellParams) => (
                <Chip
                    label={params.value ? "Reconciled" : "Pending"}
                    size="small"
                    color={params.value ? "success" : "default"}
                    variant={params.value ? "filled" : "outlined"}
                />
            ),
        },
        {
            field: "date",
            headerName: "Date",
            width: 120,
            align: 'left',
            headerAlign: 'center',
            renderCell: (params: CellParams) => {
                const txDate = format(new Date(String(params.value ?? "")), "MMM dd, yyyy");
                const postedDate = params.row.dateOfRecord?.date;

                if (postedDate && postedDate !== params.value) {
                    const formattedPosted = format(new Date(postedDate), "MMM dd, yyyy");
                    return (
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="body2">{txDate}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Posted: {formattedPosted}
                            </Typography>
                        </Box>
                    );
                }
                return <Typography variant="body2">{txDate}</Typography>;
            },
        },
        {
            field: "description",
            headerName: "Description",
            flex: 0.7,
            minWidth: 150,
            align: 'left',
            headerAlign: 'center',
            renderCell: (params: CellParams) => {
                if (params.row.isRefund) {
                    const isExpanded = expandedRefunds.has(params.row.id);
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newExpanded = new Set(expandedRefunds);
                                    if (isExpanded) {
                                        newExpanded.delete(params.row.id);
                                    } else {
                                        newExpanded.add(params.row.id);
                                    }
                                    setExpandedRefunds(newExpanded);
                                }}
                                data-tooltip={isExpanded ? "Collapse refund details" : "Expand refund details"}
                                data-tooltip-pos="left"
                            >
                                {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                            </IconButton>
                            <Box>
                                <Typography variant="body2" fontWeight="bold">
                                    {String(params.value ?? '')}
                                </Typography>
                                <Typography variant="caption" color="primary.main">
                                    ↳ Refund Item (Click arrow to show matching entry)
                                </Typography>
                            </Box>
                        </Box>
                    );
                }
                if (params.row.isOriginalForRefund) {
                    return (
                        <Box sx={{ pl: 6, borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                            <Typography variant="body2" color="text.secondary">
                                Original: {String(params.value ?? '')}
                            </Typography>
                        </Box>
                    );
                }
                if (params.row.isRefundForEntry) {
                    return (
                        <Box sx={{ pl: 6, borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                            <Typography variant="body2" color="text.secondary">
                                Refund: {String(params.value ?? '')}
                            </Typography>
                        </Box>
                    );
                }
                if (params.row.hasRefunds) {
                    const isExpanded = expandedRefunds.has(params.row.id);
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newExpanded = new Set(expandedRefunds);
                                    if (isExpanded) {
                                        newExpanded.delete(params.row.id);
                                    } else {
                                        newExpanded.add(params.row.id);
                                    }
                                    setExpandedRefunds(newExpanded);
                                }}
                                data-tooltip={isExpanded ? "Collapse refund details" : "Expand refund details"}
                                data-tooltip-pos="left"
                            >
                                {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                            </IconButton>
                            <Box>
                                <Typography variant="body2">{String(params.value ?? '')}</Typography>
                                <Typography variant="caption" color="primary.main">
                                    Has {params.row.refunds?.length || 0} refund(s) (Click arrow to show)
                                </Typography>
                            </Box>
                        </Box>
                    );
                }
                return String(params.value ?? '');
            },
        },
        {
            field: "department",
            headerName: "Department",
            width: 140,
            align: 'left',
            headerAlign: 'center',
            valueGetter: (_value: unknown, row: TransactionRow) => row?.department?.name || "",
        },
        {
            field: "source",
            headerName: "Source",
            width: 160,
            align: 'left',
            headerAlign: 'center',
            renderCell: (params: CellParams) => {
                const source = params.row.source;
                if (!source) return <Typography variant="body2" color="text.secondary">-</Typography>;

                if (source.__typename === 'Business') {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
                            <BusinessIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            <Typography variant="body2" sx={{ color: 'primary.main' }}>
                                {source.businessName}
                            </Typography>
                        </Box>
                    );
                }
                if (source.__typename === 'Person') {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
                            <PersonIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                            <Typography variant="body2" sx={{ color: 'secondary.main' }}>
                                {source.personName?.first} {source.personName?.last}
                            </Typography>
                        </Box>
                    );
                }
                return <Typography variant="body2" color="text.secondary">-</Typography>;
            },
        },
        {
            field: "category",
            headerName: "Category",
            width: 180,
            align: 'left',
            headerAlign: 'center',
            renderCell: (params: CellParams) => (
                <Chip
                    label={(params.value as { name?: string } | undefined)?.name || "Uncategorized"}
                    size="small"
                    color={(params.value as { type?: string } | undefined)?.type?.toUpperCase() === "CREDIT" ? "success" : "error"}
                    variant="outlined"
                />
            ),
        },
        {
            field: "paymentMethod",
            headerName: "Payment",
            width: 130,
            align: 'left',
            headerAlign: 'center',
            valueGetter: (val: unknown) => {
                const value = val as PaymentMethod;
                if (!value) return "Unknown";
                if (value.__typename === "PaymentMethodCard") {
                    return `${value.card?.type} *${value.card?.trailingDigits}`;
                }
                if (value.__typename === "PaymentMethodCheck") {
                    return `Check #${value.check?.checkNumber}`;
                }
                if (value.__typename === "PaymentMethodCash") return "Cash";
                if (value.__typename === "PaymentMethodOnline") return "Online";
                return "Other";
            },
        },
        {
            field: "total",
            headerName: "Amount",
            width: 130,
            align: "left",
            headerAlign: "center",
            valueGetter: (value: string) => parseRational(value),
            renderCell: (params: CellParams) => {
                const amount = params.value as number;
                const isCredit = params.row.category?.type?.toUpperCase() === "CREDIT";
                return (
                    <Typography
                        fontWeight="bold"
                        color={isCredit ? "success.main" : "error.main"}
                    >
                        {isCredit ? "+" : "-"}
                        {currencyFormatter.format(Math.abs(amount))}
                    </Typography>
                );
            },
        },
        {
            field: "receipts",
            headerName: "Receipts",
            width: 90,
            sortable: false,
            renderCell: (params: CellParams) => {
                const count = params.row.attachments?.length || 0;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                        <Tooltip title="Manage Receipts">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEntryId(params.row.id);
                                    setReceiptDialogOpen(true);
                                }}
                            >
                                <Badge badgeContent={count} color="primary">
                                    <ReceiptLongIcon
                                        fontSize="small"
                                        color={count > 0 ? "primary" : "action"}
                                        sx={{ opacity: count > 0 ? 1 : 0.3 }}
                                    />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            }
        },


    ] as GridColDef<TransactionRow>[];

    const mappedColumns: GridColDef<TransactionRow>[] = columns.map((c) => ({ ...c, sortable: !showMatchingOnly }));

    // Process rows and apply client-side filters
    const rows = useMemo<TransactionRow[]>(() => {
        if (!entries?.length) return [];

        if (showMatchingOnly) {
            // Show entries with refunds AND their refunds as separate rows
            const matchingRows: TransactionRow[] = [];

            entries.forEach((entry: EntryRecord) => {
                if (entry.refunds && entry.refunds.length > 0) {
                    // 1. Add each refund as a primary row
                    entry.refunds.forEach((refund) => {
                        matchingRows.push({
                            id: `refund-${refund.id}`,
                            refundId: refund.id,
                            description: refund.description || `Refund`,
                            date: refund.date,
                            reconciled: refund.reconciled,
                            total: refund.total,
                            category: { id: 'refund-category', name: 'Refund', type: 'CREDIT' },
                            department: entry.department,
                            paymentMethod: refund.paymentMethod,
                            attachments: [],
                            refunds: [],
                            isRefund: true,
                            parentEntryId: entry.id,
                            rowType: 'CREDIT',
                            // Pass original entry data for expansion
                            originalEntry: entry,
                        });

                        if (expandedRefunds.has(`refund-${refund.id}`)) {
                            matchingRows.push({
                                ...entry,
                                id: `original-for-${refund.id}`,
                                isRefund: false,
                                isOriginalForRefund: true,
                                rowType: 'DEBIT',
                                refundId: refund.id,
                                // Determine payment method type for filtering (original usually has same as refund?)
                                // Actually entry has paymentMethod too.
                            });
                        }
                    });
                }
            });

            // Client-side Payment Filter for Matching Rows (Now server-side for main list, but matching rows logic is complex)
            // Since we only fetched entries matching the payment type, the matching rows generated from them should be correct?
            // Matching rows are refunds. Refunds have their own payment method.
            // If I filter by "Card", I get entries paid by Card.
            // Their refunds might be by Check?
            // If I want to filter matching rows by payment type... 
            // The server filter operates on the PARENT entry?
            // Wait, my server filter `paymentMethodType` (step 5451) query `paymentMethod.type`.
            // This filters the *Entry*.
            // If I toggle "Show Matching", I generate rows for *Refunds*.
            // If the Refund payment method differs, do I show it?
            // The previous logic filtered the *Refund* rows by payment type.
            // If I remove client-side filter, I show all refunds of the matching entries.
            // This seems correct/acceptable.
            // But what if I filter "Check" and the Entry is "Card" but Refund is "Check"?
            // Server filter "Check" won't find the Entry (since it's Card). So I see nothing.
            // This is a limitation of filtering on Parent only.
            // But typically Entry and Refund match? Or simpler: filter applies to Entry.

            // Mark the last data row and add invisible spacer row
            if (matchingRows.length > 0) {
                // Mark the actual last data row
                matchingRows[matchingRows.length - 1].isLastDataRow = true;
                
                // Add invisible spacer row at the end
                matchingRows.push({
                    id: '__spacer__',
                    isSpacerRow: true,
                    description: '',
                    date: new Date().toISOString(),
                    reconciled: false,
                    total: '{"s":1,"n":0,"d":1}',
                    category: null,
                    department: null,
                    paymentMethod: null,
                    attachments: [],
                    refunds: [],
                });
            }

            return matchingRows;
        }

        // Normal mode
        // Server-side filtered already
        const normalRows: TransactionRow[] = [];
        entries.forEach((entry: EntryRecord) => {
            // If entry has refunds, show with expand capability
            if (entry.refunds?.length > 0) {
                // Show the parent entry with indicator
                normalRows.push({
                    ...entry,
                    id: entry.id,
                    isRefund: false,
                    hasRefunds: true,
                });

                // If expanded, show refund rows below (reverse of filter view)
                if (expandedRefunds.has(entry.id)) {
                    entry.refunds.forEach((refund) => {
                        // The refund row - shown indented below parent (like "Original:" in filter view)
                        normalRows.push({
                            id: `refund-for-${refund.id}`,
                            refundId: refund.id,
                            description: refund.description || 'Refund',
                            date: refund.date,
                            reconciled: refund.reconciled,
                            total: refund.total,
                            category: { id: 'refund-category', name: 'Refund', type: 'CREDIT' },
                            department: entry.department,
                            paymentMethod: refund.paymentMethod,
                            attachments: [],
                            refunds: [],
                            isRefundForEntry: true,
                            parentEntryId: entry.id,
                            rowType: 'CREDIT',
                        });
                    });
                }
            } else {
                // Regular entry without refunds
                normalRows.push({
                    ...entry,
                    id: entry.id,
                    isRefund: false,
                });
            }
        });
        
        // Mark the last data row and add invisible spacer row
        if (normalRows.length > 0) {
            // Mark the actual last data row
            normalRows[normalRows.length - 1].isLastDataRow = true;
            
            // Add invisible spacer row at the end
            normalRows.push({
                id: '__spacer__',
                isSpacerRow: true,
                description: '',
                date: new Date().toISOString(),
                reconciled: false,
                total: '{"s":1,"n":0,"d":1}',
                category: null,
                department: null,
                paymentMethod: null,
                attachments: [],
                refunds: [],
            });
        }
        
        return normalRows;
    }, [entries, showMatchingOnly, expandedRefunds]);

    const rowsById = useMemo(() => {
        const map = new Map<string, TransactionRow>();
        rows.forEach((row) => map.set(String(row.id), row));
        return map;
    }, [rows]);

    const buildReconcileInputFromSelection = (selectedIds: string[]) => {
        const entryIds = new Set<string>();
        const refundIds = new Set<string>();

        selectedIds.forEach((id) => {
            const row = rowsById.get(id);
            if (row?.isSpacerRow) return;

            if (row?.isRefund || row?.isRefundForEntry) {
                if (row.refundId) refundIds.add(row.refundId);
                return;
            }

            if (row?.isOriginalForRefund) {
                if (row.originalEntry?.id) {
                    entryIds.add(row.originalEntry.id);
                    return;
                }
                if (row.parentEntryId) {
                    entryIds.add(row.parentEntryId);
                    return;
                }
            }

            if (id.startsWith('refund-for-')) {
                refundIds.add(id.replace('refund-for-', ''));
                return;
            }

            if (id.startsWith('refund-')) {
                refundIds.add(id.replace('refund-', ''));
                return;
            }

            if (id.startsWith('original-for-')) {
                return;
            }

            entryIds.add(id);
        });

        return {
            entries: Array.from(entryIds),
            refunds: Array.from(refundIds),
        };
    };



    // Count active filters
    const activeFilters = useMemo(() => {
        const filters: ActiveFilter[] = [];
        if (startDate) filters.push({ type: 'startDate', label: `From: ${format(startDate, 'MMM dd, yyyy')}` });
        if (endDate) filters.push({ type: 'endDate', label: `To: ${format(endDate, 'MMM dd, yyyy')}` });

        if (entryType !== 'ALL') filters.push({ type: 'entryType', label: entryType === 'CREDIT' ? 'Income' : 'Expense' });
        selectedCategories.forEach((cat) => filters.push({ type: 'category', label: cat.name, value: cat.id }));
        if (filterDepartmentId) {
            const d = departments.find((dept: DepartmentRecord) => dept.id === filterDepartmentId);
            if (d) filters.push({ type: 'department', label: d.name });
        }
        if (selectedPerson) filters.push({ type: 'person', label: `Person: ${selectedPerson.name.first}` });

        if (selectedBusiness) filters.push({ type: 'business', label: `Business: ${selectedBusiness.name}` });
        if (paymentMethodType !== 'ALL') filters.push({ type: 'paymentMethod', label: `Payment: ${paymentMethodType}` });


        if (showMatchingOnly) filters.push({ type: 'matching', label: 'Matching Transactions Only' });
        if (reconcileFilter !== 'ALL') filters.push({ type: 'reconciled', label: reconcileFilter === 'RECONCILED' ? 'Reconciled Only' : 'Unreconciled Only' });
        return filters;
    }, [startDate, endDate, entryType, selectedCategories, filterDepartmentId, selectedPerson, selectedBusiness, paymentMethodType, showMatchingOnly, reconcileFilter, departments]);

    const handleClearFilter = (filter: ActiveFilter) => {
        if (filter.type === 'startDate') setStartDate(null);
        if (filter.type === 'endDate') setEndDate(null);
        if (filter.type === 'entryType') setEntryType('ALL');
        if (filter.type === 'category') setSelectedCategories((prev) => prev.filter((c) => c.id !== filter.value));
        if (filter.type === 'department') setManualFilterDepartmentId(null);
        if (filter.type === 'person') setSelectedPerson(null);
        if (filter.type === 'person') setSelectedPerson(null);
        if (filter.type === 'business') setSelectedBusiness(null);
        if (filter.type === 'paymentMethod') setPaymentMethodType('ALL');
        if (filter.type === 'matching') setShowMatchingOnly(false);
        if (filter.type === 'reconciled') setReconcileFilter('ALL');
    };

    const handleReconcileSelected = async () => {
        if (!isOnline) {
            enqueueSnackbar('Cannot reconcile while offline. Please reconnect.', { variant: 'warning' });
            return;
        }
        if (rowSelectionModel.ids.size === 0) return;

        // Strip prefixes if selecting expanded rows? 
        // IDs might be "refund-ID" or "original-for-refund-ID".
        // Reconcile expects Entry IDs or Refund IDs.
        // My mutation `ReconcileEntries` takes `entries` and `refunds`.
        // The mutation signature in file is `ReconcileEntries($input: ReconcileEntries!)`.
        // $input has `entries` and `refunds`.
        // I need to parse the selected IDs.

        const rawIds = Array.from(rowSelectionModel.ids).map((id) => String(id));
        const input = buildReconcileInputFromSelection(rawIds);

        if (!input.entries.length && !input.refunds.length) {
            enqueueSnackbar('No valid transactions or refunds selected.', { variant: 'warning' });
            return;
        }

        const { error } = await reconcileEntries({ input });
        if (error) {
            enqueueSnackbar(`Error reconciling selection: ${error.message}`, { variant: 'error' });
            return;
        }

        setRowSelectionModel({ type: 'include', ids: new Set() });
        enqueueSnackbar(`Reconciled ${input.entries.length + input.refunds.length} item(s) successfully`, { variant: 'success' });
        handleReexecute();
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box>
                <PageHeader
                    title="Transactions"
                    subtitle="View and manage all financial entries"
                />

                {/* Filter Controls - Optimized Toolbar Layout */}
                <Paper sx={{ p: 2, mb: 0.5 }}>
                    <Stack spacing={2}>
                        {/* Row 1: Context, Time & Search */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Period & Time */}
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <TextField
                                    select
                                    label="Fiscal Year"
                                    size="small"
                                    value={fiscalYearId || ''}
                                    onChange={(e) => setFiscalYearId(e.target.value)}
                                    sx={{ width: 140 }}
                                    data-tooltip="Select fiscal year"
                                    data-tooltip-pos="top"
                                >
                                    {fiscalYears.map((fy) => (
                                        <MenuItem key={fy.id} value={fy.id}>{fy.name}</MenuItem>
                                    ))}
                                </TextField>
                                <DatePicker
                                    label="Start"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    slotProps={{ textField: { size: "small", sx: { width: 130 } } }}
                                />
                                <Typography variant="body2" color="text.secondary">-</Typography>
                                <DatePicker
                                    label="End"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    slotProps={{ textField: { size: "small", sx: { width: 130 } } }}
                                />
                            </Box>

                            {/* Search (Flexible) */}
                            <Box>
                                <TextField
                                    fullWidth
                                    placeholder="Search transactions or amount..."
                                    size="small"
                                    sx={{ width: 300 }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Box component="span" sx={{ mr: 1, color: 'text.secondary' }}>🔍</Box>,
                                        endAdornment: <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.75rem' }}>⌘K</Box>,
                                    }}
                                />
                            </Box>

                            {/* Actions / Toggles */}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showMatchingOnly}
                                        onChange={(e) => setShowMatchingOnly(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label={<Typography variant="body2" noWrap>Show Transactions with Refunds</Typography>}
                            />

                            {/* Stats */}
                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', ml: 'auto' }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                    Total Transactions: <Box component="span" sx={{ color: 'text.primary' }}>{summary.count}</Box>
                                </Typography>
                                <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto', borderColor: 'divider' }} />
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                    Balance: <Box component="span" sx={{ color: summary.balance >= 0 ? 'success.main' : 'error.main' }}>{currencyFormatter.format(summary.balance)}</Box>
                                </Typography>
                            </Box>
                        </Box>

                        <Divider />

                        {/* Row 2: Filters */}
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
                                    if (newType !== 'ALL') {
                                        setSelectedCategories((prev) => prev.filter((c) => c.type === newType));
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

                            {/* Payment */}
                            <TextField
                                select
                                label="Payment"
                                size="small"
                                value={paymentMethodType}
                                onChange={(e) => setPaymentMethodType(e.target.value)}
                                sx={{ width: 120 }}
                            >
                                <MenuItem value="ALL">All</MenuItem>
                                <MenuItem value="CARD">Card</MenuItem>
                                <MenuItem value="CHECK">Check</MenuItem>
                                <MenuItem value="CASH">Cash</MenuItem>
                                <MenuItem value="ONLINE">Online</MenuItem>
                            </TextField>

                            {/* Category */}
                            <Box sx={{ width: 250 }}>
                                <Autocomplete
                                    multiple
                                    disableCloseOnSelect
                                    size="small"
                                    options={categoryOptions
                                        .filter((cat) => !cat.hidden)
                                        .filter((cat) => entryType === 'ALL' || cat.type?.toUpperCase() === entryType)
                                        .sort((a, b) => {
                                            const aCredit = a.type?.toUpperCase() === 'CREDIT';
                                            const bCredit = b.type?.toUpperCase() === 'CREDIT';
                                            if (aCredit !== bCredit) return aCredit ? -1 : 1;
                                            return (a.name || '').localeCompare(b.name || '');
                                        })}
                                    groupBy={(cat) => (cat.type?.toUpperCase() === 'CREDIT' ? 'Income' : 'Expense')}
                                    getOptionLabel={(cat) => cat.name}
                                    isOptionEqualToValue={(cat, value) => cat.id === value.id}
                                    value={selectedCategories}
                                    onChange={(_, newValue) => setSelectedCategories(newValue)}
                                    renderOption={(props, cat, { selected }) => {
                                        const { key, ...otherProps } = props;
                                        return (
                                            <Box component="li" key={key} {...otherProps}>
                                                <Checkbox checked={selected} size="small" sx={{ p: 0.5, mr: 1 }} />
                                                {cat.name}
                                            </Box>
                                        );
                                    }}
                                    renderTags={(value) =>
                                        value.length === 0
                                            ? null
                                            : value.length === 1
                                                ? value[0].name
                                                : `${value.length} categories`
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Category"
                                            placeholder={selectedCategories.length ? undefined : 'All'}
                                        />
                                    )}
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
                        </Box>

                        {/* Active Filters Display */}
                        {activeFilters.length > 0 && (
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", pt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Active:
                                </Typography>
                                {activeFilters.map((filter, index) => (
                                    <Chip
                                        key={index}
                                        label={filter.label}
                                        size="small"
                                        onDelete={() => handleClearFilter(filter)}
                                        deleteIcon={<CloseIcon />}
                                        sx={{ height: 24 }}
                                    />
                                ))}
                                <Button
                                    size="small"
                                    onClick={handleClearAllFilters}
                                    sx={{ minWidth: 'auto', p: 0.5 }}
                                >
                                    Clear All
                                </Button>
                            </Box>
                        )}
                    </Stack>
                </Paper>

                {/* Bulk Action Bar - Only visible when items selected */}
                {rowSelectionModel.ids.size > 0 && (
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            mb: 0.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText'
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold">
                                {rowSelectionModel.ids.size} items selected
                            </Typography>
                            <Typography variant="body2">
                                Ready to reconcile?
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleReconcileSelected}
                            >
                                Reconcile Selected
                            </Button>
                            <Button
                                color="inherit"
                                onClick={() => setRowSelectionModel({ type: 'include', ids: new Set() })}
                            >
                                Cancel
                            </Button>
                        </Stack>
                    </Paper>
                )}

                {!fiscalYearId ? (
                    <Alert severity="info">
                        Please select a department and fiscal year to view transactions.
                    </Alert>
                ) : error ? (
                    <Alert severity="error">Error loading transactions: {error.message}</Alert>
                ) : (
                    <Fade in timeout={600}>
                        <Box>


                            {/* Data Grid */}
                            <Paper
                                sx={{
                                    height: 600,
                                    width: "100%",
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderBottom: 'none', // Remove bottom border to eliminate last row line
                                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                                    overflow: 'hidden', // Clip any internal borders
                                }}
                            >
                                {fetching && !entries.length ? (
                                    <TableSkeleton rows={15} columns={8} />
                                ) : !fetching && !entries.length ? (
                                    <EmptyState
                                        title="No Transactions Found"
                                        description="Try adjusting your filters, selecting a different department, or clearing your search."
                                        height={400}
                                        action={{ label: "Clear Filters", onClick: handleClearAllFilters }}
                                    />
                                ) : (
                                    <DataGrid
                                        rows={rows}
                                        columns={mappedColumns as GridColDef[]}
                                        loading={fetching}
                                        pageSizeOptions={[25, 50, 100]}
                                        rowCount={totalCount}
                                        paginationMode="server"
                                        paginationModel={paginationModel}
                                        onPaginationModelChange={setPaginationModel}
                                        sortingMode="server" // Ensure server-side sorting for row order stability
                                        sortModel={showMatchingOnly ? [] : sortModel}
                                        onSortModelChange={(model) => !showMatchingOnly && setSortModel([...model])}
                                        disableColumnSorting={showMatchingOnly}
                                        checkboxSelection
                                        isRowSelectable={(params) => !params.row.reconciled && !params.row.isSpacerRow}
                                        rowSelectionModel={rowSelectionModel}
                                        onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
                                        slots={{
                                            toolbar: GridToolbar,
                                            baseCheckbox: CustomCheckbox
                                        }}
                                        slotProps={{
                                            toolbar: {
                                                showQuickFilter: true,
                                                sx: { p: 2, '& .MuiTextField-root': { width: '300px' } }
                                            },
                                        }}
                                        getRowClassName={(params) => {
                                            let classes = '';
                                            if (params.row.isSpacerRow) classes += ' spacer-row';
                                            if (params.row.isRefund) classes += ' refund-row';
                                            if (params.row.refunds?.length > 0) classes += ' has-refunds-row';
                                            // Mark the row before spacer as last-data-row
                                            if (params.row.isLastDataRow) classes += ' last-data-row';
                                            return classes.trim();
                                        }}
                                        getRowHeight={(params) => {
                                            // Hide spacer row completely
                                            if (params.model?.isSpacerRow) return 0;
                                            return 'auto';
                                        }}
                                        getEstimatedRowHeight={() => 100}
                                        sx={{
                                            border: "none",
                                            color: 'text.primary',
                                            // Remove ALL cell borders - use row borders instead
                                            '& .MuiDataGrid-cell': {
                                                borderBottom: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                            "& .MuiDataGrid-footerContainer": {
                                                borderTop: "none !important",
                                            },
                                            "& .MuiDataGrid-main": {
                                                borderBottom: "none !important",
                                            },
                                            "& .MuiDataGrid-virtualScroller": {
                                                marginTop: "8px !important",
                                                borderBottom: "none !important",
                                            },
                                            "& .MuiDataGrid-virtualScrollerContent": {
                                                borderBottom: "none !important",
                                            },
                                            "& .MuiDataGrid-columnHeaders": {
                                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px',
                                                color: 'text.secondary',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                borderLeft: '4px solid transparent',
                                            },
                                            // Use row border-bottom instead of cell border-bottom
                                            "& .MuiDataGrid-row": {
                                                transition: "all 0.2s",
                                                borderRadius: '8px',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                borderLeft: '4px solid transparent',
                                                "&:hover": {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
                                                    transform: "scale(1.002)",
                                                    zIndex: 1,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                                },
                                                "&.Mui-selected": {
                                                    backgroundColor: 'rgba(108, 93, 211, 0.1) !important',
                                                    "&:hover": {
                                                        backgroundColor: 'rgba(108, 93, 211, 0.2) !important',
                                                    }
                                                }
                                            },
                                            // Header Checkbox Centering
                                            "& .MuiDataGrid-columnHeader--selectionInput": {
                                                padding: "0 !important",
                                                justifyContent: "center !important",
                                                alignItems: "center !important",
                                            },
                                            "& .MuiDataGrid-columnHeader--selectionInput .MuiDataGrid-columnHeaderTitleContainer": {
                                                display: "flex",
                                                justifyContent: "center !important",
                                                padding: "0 !important",
                                                width: "100%",
                                                flex: 1,
                                            },
                                            "& .MuiDataGrid-columnHeader.MuiDataGrid-columnHeader--checkboxSelection": {
                                                padding: "0 !important",
                                                justifyContent: "center !important",
                                                alignItems: "center !important",
                                            },
                                            "& .MuiDataGrid-columnHeader.MuiDataGrid-columnHeader--checkboxSelection .MuiDataGrid-columnHeaderTitleContainer": {
                                                justifyContent: "center !important",
                                            },

                                            // Hide spacer row completely
                                            "& .spacer-row, & .MuiDataGrid-row.spacer-row": {
                                                display: "none !important",
                                                height: "0 !important",
                                            },
                                            // Remove border from last data row (border is now on row, not cell)
                                            "& .MuiDataGrid-row.last-data-row": {
                                                borderBottom: "none !important",
                                            },

                                            "& .refund-row": {
                                                borderLeft: "4px solid",
                                                borderLeftColor: "success.main",
                                                bgcolor: 'rgba(0, 229, 255, 0.02)',
                                            },
                                            "& .has-refunds-row": {
                                                borderLeft: "4px solid",
                                                borderLeftColor: "warning.main",
                                            },
                                        }}
                                    />
                                )}
                            </Paper>
                        </Box>
                    </Fade>
                )}
            </Box>

            {/* Action Menu */}
            <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={() => {
                    setActionMenuAnchor(null);
                    setActionMenuEntry(null);
                }}
            >
                {(actionMenuEntry?.isRefund || actionMenuEntry?.isRefundForEntry) ? (
                    <MenuItem
                        onClick={() => {
                            setEditEntry(toEditDialogEntry(actionMenuEntry));
                            setEditDialogOpen(true);
                            setActionMenuAnchor(null);
                            setActionMenuEntry(null);
                        }}
                        disabled={!canEditTransaction() || !actionMenuEntry}
                    >
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Edit Refund</ListItemText>
                    </MenuItem>
                ) : (
                    <MenuItem
                        onClick={() => {
                            setEditEntry(toEditDialogEntry(actionMenuEntry));
                            setEditDialogOpen(true);
                            setActionMenuAnchor(null);
                            setActionMenuEntry(null);
                        }}
                        disabled={!canEditTransaction() || !actionMenuEntry}
                    >
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Edit Transaction</ListItemText>
                    </MenuItem>
                )}
                <MenuItem
                    onClick={async () => {
                        if (actionMenuEntry) {
                            const input = buildReconcileInputFromSelection([String(actionMenuEntry.id)]);
                            if (!input.entries.length && !input.refunds.length) {
                                enqueueSnackbar('No valid transaction selected to reconcile.', { variant: 'warning' });
                                setActionMenuAnchor(null);
                                setActionMenuEntry(null);
                                return;
                            }

                            const { error } = await reconcileEntries({
                                input
                            });

                            if (error) {
                                enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
                            } else {
                                enqueueSnackbar('Reconciled successfully', { variant: 'success' });
                                handleReexecute();
                            }
                        }
                        setActionMenuAnchor(null);
                        setActionMenuEntry(null);
                    }}
                    disabled={!canEditTransaction() || !actionMenuEntry}
                >
                    <ListItemIcon>
                        <CheckCircleIcon fontSize="small" color={actionMenuEntry?.reconciled ? "disabled" : "success"} />
                    </ListItemIcon>
                    <ListItemText>
                        {actionMenuEntry?.reconciled ? "Already Reconciled" : "Mark as Reconciled"}
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setRefundEntry(actionMenuEntry);
                        setRefundDialogOpen(true);
                        setActionMenuAnchor(null);
                        setActionMenuEntry(null);
                    }}
                    disabled={!canIssueRefund() || !actionMenuEntry || !!actionMenuEntry?.isRefund || !!actionMenuEntry?.isRefundForEntry}
                >
                    <ListItemIcon><ReplayIcon fontSize="small" color="info" /></ListItemIcon>
                    <ListItemText>Issue Refund</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => {
                        if (!isOnline) {
                            enqueueSnackbar('Cannot delete while offline. Please reconnect.', { variant: 'warning' });
                            setActionMenuAnchor(null);
                            setActionMenuEntry(null);
                            return;
                        }
                        setEntryToDelete(actionMenuEntry);
                        setDeleteDialogOpen(true);
                        setActionMenuAnchor(null);
                        setActionMenuEntry(null);
                    }}
                    sx={{ color: 'error.main' }}
                    disabled={!isOnline || !canDeleteTransaction() || !actionMenuEntry || !!actionMenuEntry?.isRefund || !!actionMenuEntry?.isRefundForEntry}
                >
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText>{actionMenuEntry?.isRefund || actionMenuEntry?.isRefundForEntry ? 'Delete Refund' : 'Delete Transaction'}</ListItemText>
                </MenuItem>
            </Menu>

            <ReceiptManagerDialog
                open={receiptDialogOpen}
                onClose={() => setReceiptDialogOpen(false)}
                entryId={selectedEntryId}
                onUpdate={handleReexecute}
            />

            <EditEntryDialog
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setEditEntry(null);
                }}
                onSuccess={() => {
                    handleReexecute();
                }}
                entry={editEntry}
            />

            <EntryFormDialog
                open={refundDialogOpen}
                onClose={() => {
                    setRefundDialogOpen(false);
                    setRefundEntry(null);
                }}
                onSuccess={() => {
                    handleReexecute();
                }}
                initialEntryType="refund"
                initialSelectedEntry={toRefundCandidate(refundEntry)}
            />

            <SearchDialog
                open={searchDialogOpen}
                onClose={() => setSearchDialogOpen(false)}
            />

            <Dialog
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setEntryToDelete(null);
                }}
            >
                <DialogTitle>Delete Transaction</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this transaction? This action cannot be undone.
                    </Typography>
                    {entryToDelete && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Description: {entryToDelete.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Amount: {entryToDelete.formattedTotal}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setDeleteDialogOpen(false);
                        setEntryToDelete(null);
                    }}>Cancel</Button>
                    <Button
                        onClick={async () => {
                            if (entryToDelete) {
                                const { error } = await deleteEntry({ id: entryToDelete.id });
                                if (error) {
                                    enqueueSnackbar(`Failed to delete: ${error.message}`, { variant: 'error' });
                                } else {
                                    enqueueSnackbar('Transaction deleted', { variant: 'success' });
                                    handleReexecute();
                                }
                            }
                            setDeleteDialogOpen(false);
                            setEntryToDelete(null);
                        }}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
