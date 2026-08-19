import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'urql';
import {
    Box,
    Chip,
    Divider,
    Paper,
    Stack,
    Typography,
    Button,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';

import PageHeader from '../components/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/TableSkeleton';
import { useLayout } from '../context/LayoutContext';
import { parseRational } from '../utils/rational';
import type { DepartmentRef, CategoryRef, PaymentMethod } from '../types/transactions';

const GET_UNRECONCILED = `
  query GetUnreconciled {
    entries(where: { reconciled: false, deleted: false }, limit: 0) {
      id
      description
      date
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
      entriesWhere: { deleted: false }
    ) {
      id
      description
      date
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
    department?: DepartmentRef | null;
    category?: CategoryRef | null;
    total: string;
    paymentMethod: PaymentMethod;
}

interface UnreconciledRefund {
    id: string;
    description?: string | null;
    date: string;
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
}

interface UnreconciledRow {
    id: string;
    itemType: 'TRANSACTION' | 'REFUND';
    date: string;
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
    const { triggerRefresh } = useLayout();
    const { enqueueSnackbar } = useSnackbar();
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });

    const [{ data, fetching, error }, reexecuteQuery] = useQuery<GetUnreconciledData>({
        query: GET_UNRECONCILED,
        requestPolicy: 'cache-and-network',
    });

    const [, reconcile] = useMutation(RECONCILE_MUTATION);

    const rows = useMemo<UnreconciledRow[]>(() => {
        const transactionRows: UnreconciledRow[] = (data?.entries || []).map((entry) => ({
            id: `entry-${entry.id}`,
            itemType: 'TRANSACTION',
            date: entry.date,
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
            width: 120,
            valueGetter: (value: string) => new Date(value).toLocaleDateString(),
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
                <Stack direction="row" spacing={3} alignItems="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                        Total Unreconciled: <Box component="span" sx={{ color: 'text.primary' }}>{rows.length}</Box>
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />
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
