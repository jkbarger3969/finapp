import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface DepartmentContextType {
    departmentId: string | null;
    fiscalYearId: string;
    setDepartment: (deptId: string, fyId: string) => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export function DepartmentProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [departmentId, setDepartmentId] = useState<string | null>(null);
    const [fiscalYearId, setFiscalYearId] = useState<string>('');

    // Parse URL on mount and location changes
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        if (pathParts[1] === 'transactions' && pathParts[2] && pathParts[3]) {
            setDepartmentId(pathParts[2]);
            setFiscalYearId(pathParts[3]);
        }
    }, [location]);

    const setDepartment = (deptId: string, fyId: string) => {
        setDepartmentId(deptId);
        setFiscalYearId(fyId);

        // Update URL if on transactions page
        if (location.pathname.startsWith('/transactions')) {
            navigate(`/transactions/${deptId}/${fyId}`);
        }
    };

    return (
        <DepartmentContext.Provider value={{ departmentId, fiscalYearId, setDepartment }}>
            {children}
        </DepartmentContext.Provider>
    );
}

export function useDepartment() {
    const context = useContext(DepartmentContext);
    if (!context) {
        throw new Error('useDepartment must be used within DepartmentProvider');
    }
    return context;
}
