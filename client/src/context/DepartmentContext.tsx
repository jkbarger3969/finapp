import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useQuery } from 'urql';
import type { FiscalYear } from '../utils/fiscalYear';

interface DepartmentContextType {
    departmentId: string | null;
    fiscalYearId: string;
    fiscalYears: FiscalYearRecord[];
    setSelectedDepartment: (deptId: string | null) => void;
    setFiscalYearId: (fyId: string) => void;
    refetchFiscalYears: () => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

import { isDateInFiscalYear } from '../utils/fiscalYear';

const GET_FISCAL_YEARS = `
  query GetFiscalYears {
    fiscalYears(where: { archived: false }) {
      id
      name
      begin
      end
    }
  }
`;

interface FiscalYearRecord {
    id: string;
    name: string;
    begin: string;
    end: string;
}

interface GetFiscalYearsData {
    fiscalYears: FiscalYearRecord[];
}

export function DepartmentProvider({ children }: { children: ReactNode }) {
    const [departmentId, setDepartmentId] = useState<string | null>(null);
    const [fiscalYearId, setFiscalYearId] = useState<string>('');

    const [{ data }, reexecuteQuery] = useQuery<GetFiscalYearsData>({
        query: GET_FISCAL_YEARS,
    });

    const refetchFiscalYears = useCallback(() => {
        reexecuteQuery({ requestPolicy: 'network-only' });
    }, [reexecuteQuery]);

    // Set fiscal year based on current date
    useEffect(() => {
        if (fiscalYearId || !data?.fiscalYears?.length) return;

        // Default to current fiscal year based on today's date
        const today = new Date();
        const currentFY = data.fiscalYears.find((fy) => {
            const fyObj: FiscalYear = {
                id: fy.id,
                name: fy.name,
                displayName: fy.name,
                startDate: new Date(fy.begin),
                endDate: new Date(fy.end)
            };
            return isDateInFiscalYear(today, fyObj);
        });

        if (currentFY) {
            const timer = setTimeout(() => setFiscalYearId(currentFY.id), 0);
            return () => clearTimeout(timer);
        } else {
            // Fallback to the most recent fiscal year
            const sorted = [...data.fiscalYears].sort((a, b) =>
                new Date(b.end).getTime() - new Date(a.end).getTime()
            );
            const timer = setTimeout(() => setFiscalYearId(sorted[0].id), 0);
            return () => clearTimeout(timer);
        }
    }, [data, fiscalYearId]);

    // Reset fiscalYearId if it's no longer in the list (deleted)
    useEffect(() => {
        if (!fiscalYearId || !data?.fiscalYears?.length) return;
        
        const stillExists = data.fiscalYears.some((fy) => fy.id === fiscalYearId);
        if (!stillExists) {
            // Current fiscal year was deleted, reset to find a new one
            const timer = setTimeout(() => setFiscalYearId(''), 0);
            return () => clearTimeout(timer);
        }
    }, [data?.fiscalYears, fiscalYearId]);

    const setSelectedDepartment = (deptId: string | null) => {
        setDepartmentId(deptId);
    };

    return (
        <DepartmentContext.Provider value={{
            departmentId,
            fiscalYearId,
            fiscalYears: data?.fiscalYears || [],
            setSelectedDepartment,
            setFiscalYearId,
            refetchFiscalYears
        }}>
            {children}
        </DepartmentContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDepartment() {
    const context = useContext(DepartmentContext);
    if (!context) {
        throw new Error('useDepartment must be used within DepartmentProvider');
    }
    return context;
}
