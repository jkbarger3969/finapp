import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQuery } from 'urql';

interface DepartmentContextType {
    departmentId: string | null;
    fiscalYearId: string;
    fiscalYears: any[];
    setSelectedDepartment: (deptId: string | null) => void;
    setFiscalYearId: (fyId: string) => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

import { isDateInFiscalYear } from '../utils/fiscalYear';

const GET_FISCAL_YEARS = `
  query GetFiscalYears {
    fiscalYears {
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

    const [{ data }] = useQuery({
        query: GET_FISCAL_YEARS,
    });

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

    const setSelectedDepartment = (deptId: string | null) => {
        setDepartmentId(deptId);
    };

    return (
        <DepartmentContext.Provider value={{
            departmentId,
            fiscalYearId,
            fiscalYears: data?.fiscalYears || [],
            setSelectedDepartment,
            setFiscalYearId
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
