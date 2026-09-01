import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'urql';
import {
    Box,
    Chip,
    Divider,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
    Button,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';

import PageHeader from '../components/PageHeader';
import CategoryAutocomplete from '../components/CategoryAutocomplete';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/TableSkeleton';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { parseRational } from '../utils/rational';
import type { DepartmentRef, CategoryRef, PaymentMethod, EntryDateOfRecord } from '../types/transactions';
import type { CategoryRecord, DepartmentRecord } from '../types/filterOptions';

const GET_UNRECONCILED = `
  query GetUnreconciled($where: EntriesWhere!, $refundEntriesWhere: EntriesWhere!) {
    entries(where: $where, limit: 0) {
      id
      description
      date
      dateOfRecord { date overrideFiscalYear }
      department { id name }
      category { id name type }
      total
      paymentMethod {
        currency
        ... on PaymentMethodCard { card { type trailingDigits } }
        ... on PaymentMethodCheck { check { checkNumber } }
      }
    }
    entryRefunds(
      where: { reconciled: false, deleted: false }
      entriesWhere: $refundEntriesWhere
    ) {
      id
      description
      date
      dateOfRecord { date overrideFiscalYear }
      total
      paymentMethod {
        currency
        ... on PaymentMethodCard { card { type trailingDigits } }
        ... on PaymentMethodCheck { check { checkNumber } }
      }
      entry {
        id
        description
        department { id name }
        category { id name type }
      }
    }
    departments {
      id
      name
      parent {
        __typename
        ... on Department { id name }
        ... on Business { id name }
      }
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
  }
`;

const RECONCILE_MUTATION = `
  mutation ReconcileEntries($input: ReconcileEntries!) {
    reconcileEntries(input: $input) {
      reconciledEntries { id reconciled }
      reconciledRefunds { id reconciled }
    }
  }
`;

interface UnreconciledEntry {
    id: string;
    description?: string | null;
    date: string;
    dateOfRecord?: EntryDateOfRecord | null;
    department?: DepartmentRef | null;
    category?: CategoryRef | null;
    total: string;
    paymentMethod: PaymentMethod;
}

interface UnreconciledRefund {
    id: string;
    description?: string | null;
    date: string;
    dateOfRecord?: EntryDateOfRecord | null;
    total: string;
    paymentMethod: PaymentMethod;
    entry: {
        id: string;
        description?: string | null;
        department?: DepartmentRef | null;
        category?: CategoryRef | null;
    };
}

interface GetUnreconciledData {
    entries: UnreconciledEntry[];
    entryRefunds: UnreconciledRefund[];
    departments: DepartmentRecord[];
    categories: CategoryRecord[];
}

interface UnreconciledRow {
    id: string;
    itemType: 'TRANSACTION' | 'REFUND';
    date: string;
    dateOfRecord?: EntryDateOfRecord | null;
    description: string;
    department: DepartmentRef | null;
    category: CategoryRef;
    total: string;
    paymentMethod: PaymentMethod;
    entryId?: string;
    refundId?: string;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function Unreconciled() {
    const { user } = useAuth();
    const { triggerRefresh } = useLayout();
    const { enqueueSnackbar } = useSnackbar();
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });

    const [topLevelDeptId, setTopLevelDeptId] = useState('');
    const [subDeptId, setSubDeptId] = useState('');
    const [categoryId, setCategoryId] = useState('');

    // entries/entryRefunds are already scoped server-side to the caller's
    // accessible departments; department/category here only narrow further.
    const where = useMemo(() => {
        const w: Record<string, unknown> = { reconciled: false, deleted: false };
        if (subDeptId) {
            w.department = { id: { eq: subDeptId } };
        } else if (topLevelDeptId) {
            w.department = { id: { lte: topLevelDeptId } };
        }
        if (categoryId) {
            w.category = { id: { eq: categoryId } };
        }
        return w;
    }, [topLevelDeptId, subDeptId, categoryId]);

    // Refunds don't carry their own department/category - filter by the
    // parent entry instead, same fields, via entriesWhere.
    const refundEntriesWhere = useMemo(() => {
        const w: Record<string, unknown> = { deleted: false };
        if (subDeptId) {
            w.department = { id: { eq: subDeptId } };
        } else if (topLevelDeptId) {
            w.department = { id: { lte: topLevelDeptId } };
        }
        if (categoryId) {
            w.category = { id: { eq: categoryId } };
        }
        return w;
    }, [topLevelDeptId, subDeptId, categoryId]);

    const [{ data, fetching, error }, reexecuteQuery] = useQuery<GetUnreconciledData>({
        query: GET_UNRECONCILED,
        variables: { where, refundEntriesWhere },
        requestPolicy: 'cache-and-network',
    });

    const [, reconcile] = useMutation(RECONCILE_MUTATION);

    const departmentsRaw = data?.departments || [];
    const categories = data?.categories || [];

    // departments is already server-scoped to what the caller can access;
    // this mirrors Transactions.tsx's client-side pass to also surface
    // parent departments for navigation when the user only has subdept access.
    const departments = useMemo(() => {
        let depts = departmentsRaw;
        if (user?.role !== 'SUPER_ADMIN') {
            const userDeptIds = user?.departments?.map((d) => d.departmentId) || [];
            if (userDeptIds.length > 0) {
                const accessibleDeptIds = new Set<string>();
                departmentsRaw.forEach((d) => {
                    if (userDeptIds.includes(d.id)) accessibleDeptIds.add(d.id);
                    if (d.parent?.__typename === 'Department' && userDeptIds.includes(d.parent.id)) {
                        accessibleDeptIds.add(d.id);
                    }
                });
                departmentsRaw.forEach((d) => {
                    if (accessibleDeptIds.has(d.id) && d.parent?.__typename === 'Department') {
                        accessibleDeptIds.add(d.parent.id);
                    }
                });
                depts = departmentsRaw.filter((d) => accessibleDeptIds.has(d.id));
            }
        }
        return depts;
    }, [departmentsRaw, user]);

    const topLevelDepartments = useMemo(
        () => departments.filter((d) => d.parent?.__typename === 'Business' || !d.parent),
        [departments]
    );
    const allChildDepartments = useMemo(
        () => departments.filter((d) => d.parent?.__typename === 'Department'),
        [departments]
    );

    const subDepartments = useMemo(() => {
        let subs: DepartmentRecord[] = topLevelDeptId
            ? allChildDepartments.filter((d) => d.parent?.id === topLevelDeptId)
            : allChildDepartments;

        if (user?.role !== 'SUPER_ADMIN') {
            const userDeptIds = user?.departments?.map((d) => d.departmentId) || [];
            if (userDeptIds.length > 0) {
                subs = subs.filter((d) =>
                    userDeptIds.includes(d.id) ||
                    (topLevelDeptId && userDeptIds.includes(topLevelDeptId)) ||
                    (d.parent?.id ? userDeptIds.includes(d.parent.id) : false)
                );
            }
        }
        return subs;
    }, [topLevelDeptId, allChildDepartments, user]);

    const categoryOptions = useMemo(
        () => categories.map((c) => ({
            ...c,
            displayName: c.displayName ?? undefined,
            groupName: c.groupName ?? undefined,
            sortOrder: c.sortOrder ?? undefined,
        })),
        [categories]
    );

    const rows = useMemo<UnreconciledRow[]>(() => {
        const transactionRows: UnreconciledRow[] = (data?.entries || []).map((entry) => ({
            id: `entry-${entry.id}`,
            itemType: 'TRANSACTION',
            date: entry.date,
            dateOfRecord: entry.dateOfRecord,
            description: entry.description || 'Transaction',
            department: entry.department ?? null,
            category: entry.category ?? { id: 'unknown', name: 'Uncategorized', type: 'DEBIT' },
            total: entry.total,
            paymentMethod: entry.paymentMethod,
            entryId: entry.id,
        }));

        const refundRows: UnreconciledRow[] = (data?.entryRefunds || []).map((refund) => ({
            id: `refund-${refund.id}`,
            itemType: 'REFUND',
            date: refund.date,
            dateOfRecord: refund.dateOfRecord,
            description: refund.description || `Refund for: ${refund.entry.description || 'Transaction'}`,
            department: refund.entry.department ?? null,
            category: { id: 'refund-category', name: 'Refund', type: 'CREDIT' },
            total: refund.total,
            paymentMethod: refund.paymentMethod,
            refundId: refund.id,
        }));

        return [...transactionRows, ...refundRows].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [data]);

    const rowsById = useMemo(() => {
        const map = new Map<string, UnreconciledRow>();
        rows.forEach((row) => map.set(row.id, row));
        return map;
    }, [rows]);

    const buildReconcileInput = (ids: string[]) => {
        const entryIds: string[] = [];
        const refundIds: string[] = [];
        ids.forEach((id) => {
            const row = rowsById.get(id);
            if (!row) return;
            if (row.itemType === 'TRANSACTION' && row.entryId) entryIds.push(row.entryId);
            if (row.itemType === 'REFUND' && row.refundId) refundIds.push(row.refundId);
        });
        return { entries: entryIds, refunds: refundIds };
    };

    const handleReconcile = async (ids: string[]) => {
        const input = buildReconcileInput(ids);
        if (input.entries.length === 0 && input.refunds.length === 0) return;

        const response = await reconcile({ input });
        if (response.error) {
            enqueueSnackbar(response.error.message, { variant: 'error' });
            return;
        }

        enqueueSnackbar(`Reconciled ${input.entries.length + input.refunds.length} item(s)`, { variant: 'success' });
        setRowSelectionModel({ type: 'include', ids: new Set() });
        reexecuteQuery({ requestPolicy: 'network-only' });
        triggerRefresh();
    };

    const selectedCount = rowSelectionModel.ids.size;

    const columns: GridColDef<UnreconciledRow>[] = [
        {
            field: 'itemType',
            headerName: 'Type',
            width: 130,
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={params.value === 'REFUND' ? 'Refund' : 'Transaction'}
                    color={params.value === 'REFUND' ? 'secondary' : 'default'}
                    variant="outlined"
                />
            ),
        },
        {
            field: 'date',
            headerName: 'Date',
            width: 140,
            renderCell: (params) => {
                const txDate = new Date(params.value as string).toLocaleDateString();
                const postedDate = (params.row as UnreconciledRow).dateOfRecord?.date;

                if (postedDate && postedDate !== params.value) {
                    return (
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="body2">{txDate}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Posted: {new Date(postedDate).toLocaleDateString()}
                            </Typography>
                        </Box>
                    );
                }
                return <Typography variant="body2">{txDate}</Typography>;
            },
        },
        {
            field: 'description',
            headerName: 'Description',
            flex: 1,
            minWidth: 200,
        },
        {
            field: 'department',
            headerName: 'Department',
            width: 160,
            valueGetter: (value: DepartmentRef | null) => value?.name || '—',
        },
        {
            field: 'category',
            headerName: 'Category',
            width: 140,
            valueGetter: (value: CategoryRef) => value?.name || '—',
        },
        {
            field: 'total',
            headerName: 'Amount',
            width: 130,
            valueGetter: (value: string) => parseRational(value),
            renderCell: (params) => {
                const amount = params.value as number;
                const isCredit = params.row.category?.type?.toUpperCase() === 'CREDIT';
                return (
                    <Typography fontWeight="bold" color={isCredit ? 'success.main' : 'error.main'}>
                        {isCredit ? '+' : '-'}
                        {currencyFormatter.format(Math.abs(amount))}
                    </Typography>
                );
            },
        },
        {
            field: 'actions',
            headerName: '',
            width: 160,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleReconcile([String(params.id)])}
                >
                    Mark Reconciled
                </Button>
            ),
        },
    ];

    if (error) {
        return (
            <Box>
                <PageHeader title="Unreconciled Items" />
                <EmptyState title="Failed to load" description={error.message} />
            </Box>
        );
    }

    return (
        <Box>
            <PageHeader
                title="Unreconciled Items"
                subtitle="Every unreconciled transaction and refund you have access to, in one place."
            />

            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                    <TextField
                        select
                        label="Dept"
                        size="small"
                        value={topLevelDeptId}
                        onChange={(e) => {
                            setTopLevelDeptId(e.target.value);
                            setSubDeptId('');
                        }}
                        sx={{ width: 140 }}
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
                            sx={{ width: 140 }}
                        >
                            <MenuItem value="">All</MenuItem>
                            {subDepartments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                            ))}
                        </TextField>
                    )}

                    <Box sx={{ width: 220 }}>
                        <CategoryAutocomplete
                            categories={categoryOptions}
                            value={categoryId}
                            onChange={setCategoryId}
                            size="small"
                        />
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />

                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                        Total Unreconciled: <Box component="span" sx={{ color: 'text.primary' }}>{rows.length}</Box>
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                        variant="contained"
                        color="success"
                        disabled={selectedCount === 0}
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleReconcile(Array.from(rowSelectionModel.ids, String))}
                    >
                        Reconcile Selected {selectedCount > 0 ? `(${selectedCount})` : ''}
                    </Button>
                </Stack>
            </Paper>

            {fetching && !data ? (
                <TableSkeleton rows={8} columns={6} />
            ) : rows.length === 0 ? (
                <EmptyState
                    title="Nothing to reconcile"
                    description="Every transaction and refund you have access to is reconciled."
                    icon={<CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', opacity: 0.6 }} />}
                />
            ) : (
                <Paper sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        checkboxSelection
                        rowSelectionModel={rowSelectionModel}
                        onRowSelectionModelChange={setRowSelectionModel}
                        slots={{ toolbar: GridToolbar }}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 25 } },
                        }}
                        pageSizeOptions={[25, 50, 100]}
                    />
                </Paper>
            )}
        </Box>
    );
}
