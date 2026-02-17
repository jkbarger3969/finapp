import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface DepartmentPermission {
    id: string;
    departmentId: string;
    departmentName: string;
    accessLevel: 'VIEW' | 'EDIT';
}

interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: 'SUPER_ADMIN' | 'USER';
    status: 'INVITED' | 'ACTIVE' | 'DISABLED';
    canInviteUsers: boolean;
    departments: DepartmentPermission[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (code: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isSuperAdmin: boolean;
    canInviteUsers: boolean;
    canViewDepartment: (departmentId: string) => boolean;
    canEditDepartment: (departmentId: string) => boolean;
    getAccessibleDepartmentIds: () => string[];
    canAddTransaction: () => boolean;
    canEditTransaction: () => boolean;
    canDeleteTransaction: () => boolean;
    canIssueRefund: () => boolean;
    canExportReports: () => boolean;
    canManageBudget: () => boolean;
    canManageUsers: () => boolean;
    canManageCategories: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'finapp_auth_token';
const USER_KEY = 'finapp_user';

const USER_FRAGMENT = `
    id
    email
    name
    picture
    role
    status
    canInviteUsers
    departments {
        id
        department {
            id
            name
        }
        accessLevel
    }
`;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const parseUserFromResponse = (userData: any): User => {
        return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            role: userData.role,
            status: userData.status,
            canInviteUsers: userData.canInviteUsers ?? false,
            departments: (userData.departments || []).map((d: any) => ({
                id: d.id,
                departmentId: d.department.id,
                departmentName: d.department.name,
                accessLevel: d.accessLevel,
            })),
        };
    };

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
            } catch (e) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const refreshUser = useCallback(async () => {
        const currentToken = localStorage.getItem(TOKEN_KEY);
        if (!currentToken) return;

        try {
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`,
                },
                body: JSON.stringify({
                    query: `query { me { ${USER_FRAGMENT} } }`,
                }),
            });

            const result = await response.json();
            if (result.data?.me) {
                const newUser = parseUserFromResponse(result.data.me);
                localStorage.setItem(USER_KEY, JSON.stringify(newUser));
                setUser(newUser);
            }
        } catch (e) {
            console.error('Failed to refresh user:', e);
        }
    }, []);

    const login = async (code: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        mutation GoogleAuth($code: String!) {
                            googleAuth(code: $code) {
                                token
                                user {
                                    ${USER_FRAGMENT}
                                }
                            }
                        }
                    `,
                    variables: { code },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            const { token: newToken, user: userData } = result.data.googleAuth;
            const newUser = parseUserFromResponse(userData);

            localStorage.setItem(TOKEN_KEY, newToken);
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));

            setToken(newToken);
            setUser(newUser);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        if (token) {
            try {
                await fetch('/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        query: `mutation { logout }`,
                    }),
                });
            } catch (e) {
            }
        }

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    };

    const canViewDepartment = useCallback((departmentId: string): boolean => {
        if (!user) return false;
        if (user.role === 'SUPER_ADMIN') return true;
        return user.departments.some(d => d.departmentId === departmentId);
    }, [user]);

    const canEditDepartment = useCallback((departmentId: string): boolean => {
        if (!user) return false;
        if (user.role === 'SUPER_ADMIN') return true;
        const perm = user.departments.find(d => d.departmentId === departmentId);
        return perm?.accessLevel === 'EDIT';
    }, [user]);

    const getAccessibleDepartmentIds = useCallback((): string[] => {
        if (!user) return [];
        if (user.role === 'SUPER_ADMIN') return [];
        return user.departments.map(d => d.departmentId);
    }, [user]);

    const canAddTransaction = useCallback((): boolean => {
        return !!user;
    }, [user]);

    const canEditTransaction = useCallback((): boolean => {
        return !!user;
    }, [user]);

    const canDeleteTransaction = useCallback((): boolean => {
        return !!user;
    }, [user]);

    const canIssueRefund = useCallback((): boolean => {
        return !!user;
    }, [user]);

    const canExportReports = useCallback((): boolean => {
        return !!user;
    }, [user]);

    const canManageBudget = useCallback((): boolean => {
        if (!user) return false;
        return user.role === 'SUPER_ADMIN';
    }, [user]);

    const canManageUsers = useCallback((): boolean => {
        if (!user) return false;
        return user.role === 'SUPER_ADMIN';
    }, [user]);

    const canManageCategories = useCallback((): boolean => {
        if (!user) return false;
        return user.role === 'SUPER_ADMIN';
    }, [user]);

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        refreshUser,
        isSuperAdmin: user?.role === 'SUPER_ADMIN',
        canInviteUsers: user?.canInviteUsers || user?.role === 'SUPER_ADMIN',
        canViewDepartment,
        canEditDepartment,
        getAccessibleDepartmentIds,
        canAddTransaction,
        canEditTransaction,
        canDeleteTransaction,
        canIssueRefund,
        canExportReports,
        canManageBudget,
        canManageUsers,
        canManageCategories,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export function getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}
