import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const reconcileMock = vi.fn();
const triggerRefreshMock = vi.fn();
const enqueueSnackbarMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock('urql', () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
    useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

vi.mock('../context/LayoutContext', () => ({
    useLayout: () => ({ triggerRefresh: triggerRefreshMock }),
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: () => useAuthMock(),
}));

const superAdminUser = { id: 'user-1', role: 'SUPER_ADMIN', departments: [] };

vi.mock('notistack', () => ({
    useSnackbar: () => ({ enqueueSnackbar: enqueueSnackbarMock }),
}));

import Unreconciled from './Unreconciled';

const reconciledEntry = {
    id: 'entry-1',
    description: 'Office supplies',
    date: '2026-01-10T00:00:00.000Z',
    department: { id: 'dept-1', name: 'Maintenance' },
    category: { id: 'cat-1', name: 'Supplies', type: 'DEBIT' },
    total: JSON.stringify({ s: 1, n: 5000, d: 100 }),
    paymentMethod: { __typename: 'PaymentMethodCash', currency: 'USD' },
};

const unreconciledRefund = {
    id: 'refund-1',
    description: null,
    date: '2026-02-01T00:00:00.000Z',
    total: JSON.stringify({ s: 1, n: 1200, d: 100 }),
    paymentMethod: { __typename: 'PaymentMethodCash', currency: 'USD' },
    entry: {
        id: 'entry-2',
        description: 'Vendor invoice',
        department: { id: 'dept-1', name: 'Maintenance' },
        category: { id: 'cat-1', name: 'Supplies', type: 'DEBIT' },
    },
};

const maintenanceDept = { id: 'dept-1', name: 'Maintenance', parent: { __typename: 'Business', id: 'biz-1', name: 'Church' } };
const officeDept = { id: 'dept-2', name: 'Office', parent: { __typename: 'Business', id: 'biz-1', name: 'Church' } };
const maintenanceSubDept = { id: 'dept-1a', name: 'HVAC', parent: { __typename: 'Department', id: 'dept-1', name: 'Maintenance' } };
const suppliesCategory = { id: 'cat-1', name: 'Supplies', displayName: null, type: 'DEBIT', hidden: false, groupName: null, sortOrder: 0 };

describe('Unreconciled page', () => {
    beforeEach(() => {
        useAuthMock.mockReturnValue({ user: superAdminUser });
    });

    it('renders unreconciled entries and refunds flattened, not collapsed', () => {
        useQueryMock.mockReturnValue([
            {
                data: { entries: [reconciledEntry], entryRefunds: [unreconciledRefund], departments: [], categories: [] },
                fetching: false,
                error: undefined,
            },
            vi.fn(),
        ]);
        useMutationMock.mockReturnValue([{}, reconcileMock]);

        render(<Unreconciled />);

        expect(screen.getByText('Office supplies')).toBeInTheDocument();
        // Refund row shows parent transaction context without needing to expand anything.
        expect(screen.getByText('Refund for: Vendor invoice')).toBeInTheDocument();
        expect(screen.getByText('Transaction')).toBeInTheDocument();
        // "Refund" appears twice: once as the Type chip, once as the Category cell.
        expect(screen.getAllByText('Refund').length).toBeGreaterThanOrEqual(1);
    });

    it('shows an empty state when there is nothing unreconciled', () => {
        useQueryMock.mockReturnValue([
            { data: { entries: [], entryRefunds: [], departments: [], categories: [] }, fetching: false, error: undefined },
            vi.fn(),
        ]);
        useMutationMock.mockReturnValue([{}, reconcileMock]);

        render(<Unreconciled />);

        expect(screen.getByText('Nothing to reconcile')).toBeInTheDocument();
    });

    it('reconciling a single refund row calls the mutation with the refund id, not an entry id', async () => {
        const user = userEvent.setup();
        useQueryMock.mockReturnValue([
            {
                data: { entries: [], entryRefunds: [unreconciledRefund], departments: [], categories: [] },
                fetching: false,
                error: undefined,
            },
            vi.fn(),
        ]);
        reconcileMock.mockResolvedValue({ error: undefined });
        useMutationMock.mockReturnValue([{}, reconcileMock]);

        render(<Unreconciled />);

        const button = screen.getByRole('button', { name: /mark reconciled/i });
        await user.click(button);

        expect(reconcileMock).toHaveBeenCalledWith({
            input: { entries: [], refunds: ['refund-1'] },
        });
    });

    it('only lists departments the caller has access to in the Dept filter', async () => {
        const user = userEvent.setup();
        useAuthMock.mockReturnValue({
            user: { id: 'user-2', role: 'USER', departments: [{ departmentId: 'dept-1' }] },
        });
        useQueryMock.mockReturnValue([
            {
                data: {
                    entries: [],
                    entryRefunds: [],
                    departments: [maintenanceDept, officeDept, maintenanceSubDept],
                    categories: [],
                },
                fetching: false,
                error: undefined,
            },
            vi.fn(),
        ]);
        useMutationMock.mockReturnValue([{}, reconcileMock]);

        render(<Unreconciled />);

        await user.click(screen.getByRole('combobox', { name: 'Dept' }));
        expect(await screen.findByRole('option', { name: 'Maintenance' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'Office' })).not.toBeInTheDocument();
    });

    it('selecting a department re-queries with a department filter scoped to that department and its subdepartments', async () => {
        const user = userEvent.setup();
        useAuthMock.mockReturnValue({ user: superAdminUser });
        useQueryMock.mockReturnValue([
            {
                data: {
                    entries: [],
                    entryRefunds: [],
                    departments: [maintenanceDept, officeDept, maintenanceSubDept],
                    categories: [suppliesCategory],
                },
                fetching: false,
                error: undefined,
            },
            vi.fn(),
        ]);
        useMutationMock.mockReturnValue([{}, reconcileMock]);

        render(<Unreconciled />);

        await user.click(screen.getByRole('combobox', { name: 'Dept' }));
        await user.click(await screen.findByRole('option', { name: 'Maintenance' }));

        const lastCall = useQueryMock.mock.calls[useQueryMock.mock.calls.length - 1][0];
        expect(lastCall.variables.where.department).toEqual({ id: { lte: 'dept-1' } });
        expect(lastCall.variables.refundEntriesWhere.department).toEqual({ id: { lte: 'dept-1' } });
    });
});
