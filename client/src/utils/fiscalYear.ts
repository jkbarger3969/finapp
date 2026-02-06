/**
 * Fiscal Year Utilities
 * Fiscal Year runs from September 1st to August 31st
 * Example: FY 2026 runs from Sept 1, 2025 to Aug 31, 2026
 * Displayed as "2025-2026"
 */

export interface FiscalYear {
    id: string;
    name: string;
    displayName: string;
    startDate: Date;
    endDate: Date;
}

/**
 * Get the current fiscal year based on today's date
 * FY runs Sept 1 - Aug 31
 * Example: Sept 1, 2025 - Aug 31, 2026 = FY 2026 (displayed as 2025-2026)
 */
export const getCurrentFiscalYear = (): FiscalYear => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-indexed (0 = Jan, 8 = Sept)
    const currentYear = today.getFullYear();

    // If we're in Sept through Dec (months 8-11), we're in the next fiscal year
    const fiscalYear = currentMonth >= 8 ? currentYear + 1 : currentYear;

    return {
        id: fiscalYear.toString(),
        name: `FY ${fiscalYear}`,
        displayName: `${fiscalYear - 1}-${fiscalYear}`,
        startDate: new Date(fiscalYear - 1, 8, 1), // Sept 1 of previous year (inclusive)
        endDate: new Date(fiscalYear, 8, 1), // Sept 1 of current year (exclusive)
    };
};

/**
 * Get a specific fiscal year by year number
 * @param year - The ending year of the fiscal year (e.g., 2026 for FY 2025-2026)
 */
export const getFiscalYear = (year: number): FiscalYear => {
    return {
        id: year.toString(),
        name: `FY ${year}`,
        displayName: `${year - 1}-${year}`,
        startDate: new Date(year - 1, 8, 1), // Sept 1 of previous year (inclusive)
        endDate: new Date(year, 8, 1), // Sept 1 of current year (exclusive)
    };
};

/**
 * Get a range of fiscal years (for dropdown selection)
 * @param yearsBack - How many years back from current
 * @param yearsForward - How many years forward from current
 */
export const getFiscalYearRange = (
    yearsBack: number = 5,
    yearsForward: number = 1
): FiscalYear[] => {
    const currentFY = getCurrentFiscalYear();
    const currentFYNumber = parseInt(currentFY.id);

    const years: FiscalYear[] = [];

    for (let i = currentFYNumber - yearsBack; i <= currentFYNumber + yearsForward; i++) {
        years.push(getFiscalYear(i));
    }

    return years.reverse(); // Most recent first
};

/**
 * Format fiscal year for display (shows both years: 2025-2026)
 */
export const formatFiscalYear = (fy: FiscalYear): string => {
    return fy.displayName;
};

/**
 * Format fiscal year from begin/end dates (for GraphQL data)
 * @param begin - Start date string (ISO format)
 * @param end - End date string (ISO format) 
 * @param name - Optional name from database
 */
export const formatFiscalYearFromDates = (begin: string, end: string, name?: string): string => {
    const startYear = new Date(begin).getFullYear();
    const endYear = new Date(end).getFullYear();
    
    // If start and end years are different, show both
    if (startYear !== endYear) {
        return `${startYear}-${endYear}`;
    }
    
    // Fallback to name or just the year
    return name || endYear.toString();
};

/**
 * Get suggested dates for a new fiscal year
 * @param targetEndYear - The ending year of the fiscal year (e.g., 2027 for FY 2026-2027)
 * Note: End date is exclusive (Sept 1 of end year) for proper date range comparison
 */
export const getSuggestedFiscalYearDates = (targetEndYear: number): { begin: string; end: string; displayName: string } => {
    const begin = new Date(targetEndYear - 1, 8, 1); // Sept 1 of start year
    const end = new Date(targetEndYear, 8, 1); // Sept 1 of end year (exclusive boundary)
    
    return {
        begin: begin.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        displayName: `${targetEndYear - 1}-${targetEndYear}`,
    };
};

/**
 * Determine if a date falls within a fiscal year
 * Uses [startDate, endDate) interval - inclusive start, exclusive end
 */
export const isDateInFiscalYear = (date: Date, fiscalYear: FiscalYear): boolean => {
    return date >= fiscalYear.startDate && date < fiscalYear.endDate;
};
