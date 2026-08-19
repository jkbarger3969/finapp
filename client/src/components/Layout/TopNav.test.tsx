import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const useQueryMock = vi.fn();

vi.mock('urql', () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { name: 'Test User', email: 'test@test.com', canInviteUsers: false },
        logout: vi.fn(),
        isSuperAdmin: false,
    }),
}));

vi.mock('../../context/LayoutContext', () => ({
    useLayout: () => ({
        openEntryDialog: vi.fn(),
        refreshTrigger: 0,
    }),
}));

vi.mock('../../context/ThemeModeContext', () => ({
    useThemeMode: () => ({ mode: 'light', toggleTheme: vi.fn() }),
}));

vi.mock('../InviteUserDialog', () => ({
    default: () => null,
}));

import TopNav from './TopNav';

function renderTopNav() {
    return render(
        <MemoryRouter>
            <TopNav />
        </MemoryRouter>
    );
}

describe('TopNav unreconciled badge', () => {
    it('shows the unreconciled count on the nav badge', () => {
        useQueryMock.mockReturnValue([
            { data: { unreconciledCount: 7 }, fetching: false, error: undefined },
            vi.fn(),
        ]);

        renderTopNav();

        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('Unreconciled')).toBeInTheDocument();
    });

    it('hides the badge when the count is zero', () => {
        useQueryMock.mockReturnValue([
            { data: { unreconciledCount: 0 }, fetching: false, error: undefined },
            vi.fn(),
        ]);

        renderTopNav();

        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
});
