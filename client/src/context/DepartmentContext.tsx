import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useQuery } from 'urql';

interface DepartmentContextType {
    departmentId: string | null;
    fiscalYearId: string;
    fiscalYears: any[];
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

export function DepartmentProvider({ children }: { children: ReactNode }) {
    const [departmentId, setDepartmentId] = useState<string | null>(null);
    const [fiscalYearId, setFiscalYearId] = useState<string>('');

    const [{ data }, reexecuteQuery] = useQuery({
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
        const currentFY = data.fiscalYears.find((fy: any) => {
            const fyObj = {
                ...fy,
                startDate: new Date(fy.begin),
                endDate: new Date(fy.end)
            };
            return isDateInFiscalYear(today, fyObj);
        });

        if (currentFY) {
            setFiscalYearId(currentFY.id);
        } else {
            // Fallback to the most recent fiscal year
            const sorted = [...data.fiscalYears].sort((a: any, b: any) =>
                new Date(b.end).getTime() - new Date(a.end).getTime()
            );
            setFiscalYearId(sorted[0].id);
        }
    }, [data, fiscalYearId]);

    // Reset fiscalYearId if it's no longer in the list (deleted)
    useEffect(() => {
        if (!fiscalYearId || !data?.fiscalYears?.length) return;
        
        const stillExists = data.fiscalYears.some((fy: any) => fy.id === fiscalYearId);
        if (!stillExists) {
            // Current fiscal year was deleted, reset to find a new one
            setFiscalYearId('');
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

export function useDepartment() {
    const context = useContext(DepartmentContext);
    if (!context) {
        throw new Error('useDepartment must be used within DepartmentProvider');
    }
    return context;
}
