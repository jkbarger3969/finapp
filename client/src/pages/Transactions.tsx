import { useMemo, useState } from "react";
import { useMutation, useQuery } from "urql";
import {
    Box,
    Paper,
    Typography,
    Chip,
    Alert,
    ToggleButtonGroup,
    ToggleButton,
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
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import type { GridColDef, GridRowSelectionModel, GridRowId } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useDepartment } from "../context/DepartmentContext";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { ReceiptManagerDialog } from "../components/ReceiptManagerDialog";
import EditEntryDialog from "../components/EditEntryDialog";
import EntryFormDialog from "../components/EntryFormDialog";

const GET_ENTRIES_BY_DEPARTMENT = `
  query GetEntriesByDepartment($where: EntriesWhere!) {
    entries(where: $where) {
      id
      description
      date
      dateOfRecord {
        date
        overrideFiscalYear
      }
      reconciled
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
          id
          personName: name {
            first
            last
          }
        }
        ... on Business {
          id
          businessName: name
        }
      }
      refunds {
        id
        date
        description
        total
        reconciled
        paymentMethod {
          currency
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
      attachments {
        id
      }
      paymentMethod {
        currency
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
    id
  }
}
`;

// Helper to parse Rational JSON
const parseRational = (rationalStr: string) => {
    try {
        const { s, n, d } = JSON.parse(rationalStr);
        return (n / d) * s;
    } catch (e) {
        return 0;
    }
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export default function Transactions() {
    const { departmentId, fiscalYearId } = useDepartment();

    // Filter state
    const [reconcileMode, setReconcileMode] = useState<"all" | "unreconciled">("all");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showMatchingOnly, setShowMatchingOnly] = useState(false);
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set<GridRowId>() });

    // Action menu state
    const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionMenuEntry, setActionMenuEntry] = useState<any>(null);

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editEntry, setEditEntry] = useState<any>(null);

    // Refund dialog state
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [refundEntry, setRefundEntry] = useState<any>(null);

    const [, reconcileEntries] = useMutation(RECONCILE_ENTRIES_MUTATION);
    const [, deleteEntry] = useMutation(DELETE_ENTRY_MUTATION);

    // Build GraphQL where clause
    const where = useMemo(() => {
        const baseWhere: any = {
            deleted: false,
        };

        // Add department filter (includes subdepartments with lte)
        if (departmentId) {
            baseWhere.department = {
                id: {
                    lte: departmentId,
                },
            };
        }

        // Add fiscal year filter
        if (fiscalYearId) {
            baseWhere.fiscalYear = {
                id: {
                    eq: fiscalYearId,
                },
            };
        }

        // Add reconciliation filter
        if (reconcileMode === "unreconciled") {
            baseWhere.reconciled = false;
        }

        // Add date range filter
        if (startDate || endDate) {
            baseWhere.date = {};
            if (startDate) {
                baseWhere.date.gte = startDate.toISOString();
            }
            if (endDate) {
                baseWhere.date.lte = endDate.toISOString();
            }
        }

        // Add category filter
        if (selectedCategories.length > 0) {
            baseWhere.category = {
                id: {
                    in: selectedCategories,
                },
            };
        }

        return baseWhere;
    }, [departmentId, fiscalYearId, reconcileMode, startDate, endDate, selectedCategories]);

    const [result, reexecuteQuery] = useQuery({
        query: GET_ENTRIES_BY_DEPARTMENT,
        variables: { where },
        pause: !departmentId,
    });

    const handleReexecute = () => {
        reexecuteQuery({ requestPolicy: 'network-only' });
    };

    const { data, fetching, error } = result;

    // Column Definitions
    const columns: GridColDef[] = [
        {
            field: "date",
            headerName: "Date",
            width: 140,
            renderCell: (params: any) => {
                const txDate = format(new Date(params.value), "MMM dd, yyyy");
                const postedDate = params.row.dateOfRecord?.date;

                if (postedDate && postedDate !== params.value) {
                    const formattedPosted = format(new Date(postedDate), "MMM dd, yyyy");
                    return (
                        <Box>
                            <Typography variant="body2">{txDate}</Typography>
                            <Typography variant="caption" color="text.secondary">
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
            flex: 1,
            minWidth: 200,
            renderCell: (params: any) => {
                if (params.row.isRefund) {
                    return (
                        <Box>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                {params.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ↳ Refund for original transaction
                            </Typography>
                        </Box>
                    );
                }
                if (params.row.refunds?.length > 0) {
                    return (
                        <Box>
                            <Typography variant="body2">{params.value}</Typography>
                            <Typography variant="caption" color="success.main">
                                Has {params.row.refunds.length} refund(s)
                            </Typography>
                        </Box>
                    );
                }
                return params.value;
            },
        },
        {
            field: "department",
            headerName: "Department",
            width: 150,
            valueGetter: (_value, row) => row?.department?.name || "",
        },
        {
            field: "source",
            headerName: "Source",
            width: 180,
            renderCell: (params: any) => {
                const source = params.row.source;
                if (!source) return <Typography variant="body2" color="text.secondary">-</Typography>;

                if (source.__typename === 'Business') {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BusinessIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            <Typography variant="body2" sx={{ color: 'primary.main' }}>
                                {source.businessName}
                            </Typography>
                        </Box>
                    );
                }
                if (source.__typename === 'Person') {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
            width: 150,
            renderCell: (params: any) => (
                <Chip
                    label={params.value?.name || "Uncategorized"}
                    size="small"
                    color={params.value?.type === "CREDIT" ? "success" : "error"}
                    variant="outlined"
                />
            ),
        },
        {
            field: "paymentMethod",
            headerName: "Payment",
            width: 150,
            valueGetter: (val: any) => {
                const value = val as any;
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
            width: 150,
            align: "right",
            headerAlign: "right",
            valueGetter: (value) => parseRational(value),
            renderCell: (params) => {
                const amount = params.value as number;
                const isCredit = params.row.category?.type === "CREDIT";
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
            width: 80,
            sortable: false,
            renderCell: (params: any) => {
                const count = params.row.attachments?.length || 0;
                return (
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
                                <ReceiptLongIcon fontSize="small" />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                );
            }
        },
        {
            field: "reconciled",
            headerName: "Status",
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Reconciled" : "Pending"}
                    size="small"
                    color={params.value ? "success" : "default"}
                    variant={params.value ? "filled" : "outlined"}
                />
            ),
        },
        {
            field: "actions",
            headerName: "",
            width: 60,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: any) => {
                if (params.row.isRefund) return null;
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
    ];

    // Process rows and apply client-side filters
    const rows = useMemo(() => {
        if (!data?.entries) return [];

        if (showMatchingOnly) {
            // Show entries with refunds AND their refunds as separate rows
            const matchingRows: any[] = [];

            data.entries.forEach((entry: any) => {
                if (entry.refunds && entry.refunds.length > 0) {
                    // Add the original entry (debit)
                    matchingRows.push({
                        ...entry,
                        id: entry.id,
                        isRefund: false,
                        parentEntryId: null,
                        rowType: 'DEBIT',
                    });

                    // Add each refund as a separate row (credit)
                    entry.refunds.forEach((refund: any) => {
                        matchingRows.push({
                            id: `refund-${refund.id}`,
                            refundId: refund.id,
                            description: refund.description || `Refund for: ${entry.description}`,
                            date: refund.date,
                            reconciled: refund.reconciled,
                            total: refund.total,
                            category: { name: 'Refund', type: 'CREDIT' },
                            department: entry.department,
                            paymentMethod: refund.paymentMethod,
                            attachments: [],
                            isRefund: true,
                            parentEntryId: entry.id,
                            parentDescription: entry.description,
                            rowType: 'CREDIT',
                        });
                    });
                }
            });

            return matchingRows;
        }

        // Normal mode - just return entries
        return data.entries.map((entry: any) => ({
            ...entry,
            id: entry.id,
            isRefund: false,
        }));
    }, [data, showMatchingOnly]);

    // Calculate summary
    const summary = useMemo(() => {
        if (!rows.length) return { total: 0, count: 0, balance: 0 };

        const balance = rows.reduce((sum: number, row: any) => {
            const amount = parseRational(row.total);
            const isCredit = row.category?.type === "CREDIT";
            return sum + (isCredit ? amount : -amount);
        }, 0);

        return {
            count: rows.length,
            balance,
        };
    }, [rows]);

    // Get unique categories for filter
    const uniqueCategories = useMemo(() => {
        if (!data?.entries) return [];
        const categoryMap = new Map();
        data.entries.forEach((entry: any) => {
            if (entry.category) {
                categoryMap.set(entry.category.id, entry.category.name);
            }
        });
        return Array.from(categoryMap.entries()).map(([id, name]) => ({ id, name }));
    }, [data]);

    // Count active filters
    const activeFilters = useMemo(() => {
        const filters = [];
        if (startDate) filters.push({ type: 'startDate', label: `From: ${format(startDate, 'MMM dd, yyyy')}` });
        if (endDate) filters.push({ type: 'endDate', label: `To: ${format(endDate, 'MMM dd, yyyy')}` });
        if (selectedCategories.length > 0) {
            selectedCategories.forEach(catId => {
                const cat = uniqueCategories.find(c => c.id === catId);
                if (cat) filters.push({ type: 'category', label: cat.name, id: catId });
            });
        }
        if (showMatchingOnly) filters.push({ type: 'matching', label: 'Matching Transactions Only' });
        if (reconcileMode === 'unreconciled') filters.push({ type: 'reconciled', label: 'Unreconciled Only' });
        return filters;
    }, [startDate, endDate, selectedCategories, showMatchingOnly, reconcileMode, uniqueCategories]);

    const handleClearFilter = (filter: any) => {
        if (filter.type === 'startDate') setStartDate(null);
        if (filter.type === 'endDate') setEndDate(null);
        if (filter.type === 'category') {
            setSelectedCategories(prev => prev.filter(id => id !== filter.id));
        }
        if (filter.type === 'matching') setShowMatchingOnly(false);
        if (filter.type === 'reconciled') setReconcileMode('all');
    };

    const handleReconcileSelected = async () => {
        if (rowSelectionModel.ids.size === 0) return;

        await reconcileEntries({
            input: {
                entries: Array.from(rowSelectionModel.ids) as string[]
            }
        });

        setRowSelectionModel({ type: 'include', ids: new Set() });
        handleReexecute();
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4">Transactions</Typography>

                    {/* Reconciliation Mode Toggle */}
                    <ToggleButtonGroup
                        value={reconcileMode}
                        exclusive
                        onChange={(_, newMode) => newMode && setReconcileMode(newMode)}
                        size="small"
                    >
                        <ToggleButton value="all">All</ToggleButton>
                        <ToggleButton value="unreconciled">Unreconciled</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Filter Controls */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Stack spacing={2}>
                        {/* Date Range Filters */}
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                slotProps={{
                                    textField: { size: "small", sx: { minWidth: 180 } },
                                }}
                            />
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                slotProps={{
                                    textField: { size: "small", sx: { minWidth: 180 } },
                                }}
                            />
                            {(startDate || endDate) && (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setStartDate(null);
                                        setEndDate(null);
                                    }}
                                >
                                    Clear Dates
                                </Button>
                            )}
                        </Box>

                        {/* Additional Filters */}
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showMatchingOnly}
                                        onChange={(e) => setShowMatchingOnly(e.target.checked)}
                                    />
                                }
                                label="Show Matching Transactions Only (with refunds)"
                            />
                        </Box>

                        {/* Active Filters Display */}
                        {activeFilters.length > 0 && (
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                                <Typography variant="caption" color="text.secondary">
                                    Active Filters:
                                </Typography>
                                {activeFilters.map((filter, index) => (
                                    <Chip
                                        key={index}
                                        label={filter.label}
                                        size="small"
                                        onDelete={() => handleClearFilter(filter)}
                                        deleteIcon={<CloseIcon />}
                                    />
                                ))}
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setStartDate(null);
                                        setEndDate(null);
                                        setSelectedCategories([]);
                                        setShowMatchingOnly(false);
                                        setReconcileMode('all');
                                    }}
                                >
                                    Clear All
                                </Button>
                            </Box>
                        )}
                    </Stack>
                </Paper>

                {/* Bulk Action Bar - Only visible when items selected */}
                <Fade in={rowSelectionModel.ids.size > 0}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            mb: 2,
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
                </Fade>

                {!departmentId ? (
                    <Alert severity="info">
                        Please select a department and fiscal year to view transactions.
                    </Alert>
                ) : error ? (
                    <Alert severity="error">Error loading transactions: {error.message}</Alert>
                ) : (
                    <Fade in timeout={600}>
                        <Box>
                            {/* Summary Bar */}
                            <Paper sx={{ p: 2, mb: 2, display: "flex", gap: 4 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Total Transactions
                                    </Typography>
                                    <Typography variant="h6">{summary.count}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Balance
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        color={summary.balance >= 0 ? "success.main" : "error.main"}
                                    >
                                        {currencyFormatter.format(summary.balance)}
                                    </Typography>
                                </Box>
                                {reconcileMode === "unreconciled" && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Unreconciled
                                        </Typography>
                                        <Typography variant="h6" color="warning.main">
                                            {summary.count}
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>

                            {/* Data Grid */}
                            <Paper
                                sx={{
                                    height: 600,
                                    width: "100%",
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                                }}
                            >
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    loading={fetching}
                                    pageSizeOptions={[25, 50, 100]}
                                    initialState={{
                                        pagination: { paginationModel: { pageSize: 25 } },
                                        sorting: {
                                            sortModel: [{ field: "date", sort: "desc" }],
                                        },
                                    }}
                                    checkboxSelection
                                    rowSelectionModel={rowSelectionModel}
                                    onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
                                    slots={{ toolbar: GridToolbar }}
                                    slotProps={{
                                        toolbar: {
                                            showQuickFilter: true,
                                            sx: { p: 2, '& .MuiTextField-root': { width: '300px' } }
                                        },
                                    }}
                                    getRowClassName={(params) => {
                                        if (params.row.isRefund) return 'refund-row';
                                        if (params.row.refunds?.length > 0) return 'has-refunds-row';
                                        return '';
                                    }}
                                    sx={{
                                        border: "none",
                                        color: 'text.primary',
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        },
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: 'text.secondary',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                        },
                                        "& .MuiDataGrid-row": {
                                            transition: "all 0.2s",
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
                                        "& .refund-row": {
                                            borderLeft: "4px solid",
                                            borderLeftColor: "success.main",
                                            pl: 1,
                                            bgcolor: 'rgba(0, 229, 255, 0.02)',
                                        },
                                        "& .has-refunds-row": {
                                            borderLeft: "4px solid",
                                            borderLeftColor: "warning.main",
                                        },
                                    }}
                                />
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
                <MenuItem onClick={() => {
                    setEditEntry(actionMenuEntry);
                    setEditDialogOpen(true);
                    setActionMenuAnchor(null);
                    setActionMenuEntry(null);
                }}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit Transaction</ListItemText>
                </MenuItem>
                <MenuItem onClick={async () => {
                    if (actionMenuEntry) {
                        await reconcileEntries({
                            input: { entries: [actionMenuEntry.id] }
                        });
                        handleReexecute();
                    }
                    setActionMenuAnchor(null);
                    setActionMenuEntry(null);
                }}>
                    <ListItemIcon>
                        <CheckCircleIcon fontSize="small" color={actionMenuEntry?.reconciled ? "disabled" : "success"} />
                    </ListItemIcon>
                    <ListItemText>
                        {actionMenuEntry?.reconciled ? "Already Reconciled" : "Mark as Reconciled"}
                    </ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    setRefundEntry(actionMenuEntry);
                    setRefundDialogOpen(true);
                    setActionMenuAnchor(null);
                    setActionMenuEntry(null);
                }}>
                    <ListItemIcon><ReplayIcon fontSize="small" color="info" /></ListItemIcon>
                    <ListItemText>Issue Refund</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={async () => {
                        if (actionMenuEntry && window.confirm('Are you sure you want to delete this transaction?')) {
                            await deleteEntry({ id: actionMenuEntry.id });
                            handleReexecute();
                        }
                        setActionMenuAnchor(null);
                        setActionMenuEntry(null);
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText>Delete Transaction</ListItemText>
                </MenuItem>
            </Menu>

            <ReceiptManagerDialog
                open={receiptDialogOpen}
                onClose={() => setReceiptDialogOpen(false)}
                entryId={selectedEntryId}
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
                initialSelectedEntry={refundEntry}
            />
        </LocalizationProvider>
    );
}
