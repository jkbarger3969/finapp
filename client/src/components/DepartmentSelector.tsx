import { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent } from '@mui/material';
import { useQuery } from 'urql';
import { formatFiscalYearFromDates } from '../utils/fiscalYear';
import { useDepartment } from '../context/DepartmentContext';

const GET_DEPARTMENTS_AND_FISCAL_YEARS = `
  query GetDepartmentsAndFiscalYears {
    departments {
      id
      name
      parent {
        __typename
        ... on Department {
          id
          name
        }
        ... on Business {
          id
          name
        }
      }
    }
    fiscalYears {
      id
      name
      begin
      end
    }
  }
`;

interface Department {
    id: string;
    name: string;
    parent?: {
        __typename: 'Business' | 'Department';
        id: string;
        name: string;
    };
}

interface FiscalYearData {
    id: string;
    name: string;
    begin: string;
    end: string;
}

export default function DepartmentSelector() {
    const { departmentId: contextDeptId, fiscalYearId: contextFYId, setDepartment } = useDepartment();
    const [result] = useQuery({ query: GET_DEPARTMENTS_AND_FISCAL_YEARS });

    const { data, fetching, error } = result;



    // State for two-level selection
    const [topLevelDeptId, setTopLevelDeptId] = useState<string>('');
    const [subDeptId, setSubDeptId] = useState<string>('');
    const [fiscalYearId, setFiscalYearId] = useState<string>('');

    const departments: Department[] = data?.departments || [];
    const fiscalYears: FiscalYearData[] = data?.fiscalYears || [];

    // Separate top-level and child departments
    // Top-level departments have a Business as parent, subdepartments have a Department as parent
    const topLevelDepartments = departments.filter(d => d.parent?.__typename === 'Business' || !d.parent);
    const allChildDepartments = departments.filter(d => d.parent?.__typename === 'Department');

    // Get subdepartments for selected top-level department
    const subDepartments = topLevelDeptId
        ? allChildDepartments.filter(d => d.parent?.id === topLevelDeptId)
        : [];



    // Initialize from context or set first available options
    useEffect(() => {
        if (contextDeptId && departments.length > 0) {
            const dept = departments.find(d => d.id === contextDeptId);
            if (dept) {
                if (dept.parent?.__typename === 'Department') {
                    // It's a subdepartment
                    setTopLevelDeptId(dept.parent.id);
                    setSubDeptId(dept.id);
                } else {
                    // It's a top-level department
                    setTopLevelDeptId(dept.id);
                    setSubDeptId('');
                }
            } else {
                // Invalid department ID from URL - clear it and select first department
                console.warn('Invalid department ID from URL:', contextDeptId);
                if (topLevelDepartments.length > 0) {
                    const firstDept = topLevelDepartments[0];
                    setTopLevelDeptId(firstDept.id);
                    setSubDeptId('');
                    // Update context with valid department
                    if (fiscalYearId) {
                        setDepartment(firstDept.id, fiscalYearId);
                    }
                }
            }
        } else if (!topLevelDeptId && topLevelDepartments.length > 0) {
            // Auto-select first department if none selected
            const firstDept = topLevelDepartments[0];
            setTopLevelDeptId(firstDept.id);
        }
    }, [contextDeptId, departments, topLevelDepartments, topLevelDeptId, fiscalYearId, setDepartment]);

    useEffect(() => {
        if (contextFYId && fiscalYears.length > 0) {
            setFiscalYearId(contextFYId);
        } else if (!fiscalYearId && fiscalYears.length > 0) {
            // Auto-select first fiscal year if none selected
            setFiscalYearId(fiscalYears[0].id);
        }
    }, [contextFYId, fiscalYears, fiscalYearId]);

    // Auto-set department when both are selected
    useEffect(() => {
        if (topLevelDeptId && fiscalYearId && !contextDeptId) {
            setDepartment(topLevelDeptId, fiscalYearId);
        }
    }, [topLevelDeptId, fiscalYearId, contextDeptId, setDepartment]);

    const handleTopLevelChange = (event: SelectChangeEvent) => {
        const newTopLevelId = event.target.value;
        setTopLevelDeptId(newTopLevelId);
        setSubDeptId(''); // Reset subdepartment when top-level changes

        // Update context with top-level department
        if (fiscalYearId) {
            setDepartment(newTopLevelId, fiscalYearId);
        }
    };

    const handleSubDeptChange = (event: SelectChangeEvent) => {
        const newSubDeptId = event.target.value;
        setSubDeptId(newSubDeptId);

        // Update context with subdepartment (or top-level if empty)
        if (fiscalYearId) {
            setDepartment(newSubDeptId || topLevelDeptId, fiscalYearId);
        }
    };

    const handleFiscalYearChange = (event: SelectChangeEvent) => {
        const newFYId = event.target.value;
        setFiscalYearId(newFYId);

        // Use subdepartment if selected, otherwise top-level
        const activeDeptId = subDeptId || topLevelDeptId;
        if (activeDeptId) {
            setDepartment(activeDeptId, newFYId);
        }
    };

    if (error) {
        console.error('Department selector error:', error);
        return null;
    }

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Top-Level Department Selector */}
            <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel id="top-dept-select-label">Department</InputLabel>
                <Select
                    labelId="top-dept-select-label"
                    id="top-dept-select"
                    value={topLevelDeptId}
                    label="Department"
                    onChange={handleTopLevelChange}
                    disabled={fetching}
                >
                    {topLevelDepartments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                            {dept.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Subdepartment Selector (only shown if top-level has subdepartments) */}
            {subDepartments.length > 0 && (
                <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel id="sub-dept-select-label">Subdepartment</InputLabel>
                    <Select
                        labelId="sub-dept-select-label"
                        id="sub-dept-select"
                        value={subDeptId}
                        label="Subdepartment"
                        onChange={handleSubDeptChange}
                    >
                        <MenuItem value="">
                            <em>All Subdepartments</em>
                        </MenuItem>
                        {subDepartments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>
                                {dept.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Fiscal Year Selector */}
            <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel id="fiscal-year-select-label">Fiscal Year</InputLabel>
                <Select
                    labelId="fiscal-year-select-label"
                    id="fiscal-year-select"
                    value={fiscalYearId}
                    label="Fiscal Year"
                    onChange={handleFiscalYearChange}
                >
                    {fiscalYears.map((fy) => (
                        <MenuItem key={fy.id} value={fy.id}>
                            {formatFiscalYearFromDates(fy.begin, fy.end, fy.name)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}
