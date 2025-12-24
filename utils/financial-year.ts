/**
 * Financial Year Utilities
 * Provides functions to work with financial years (April to March)
 */

/**
 * Gets the financial year for a given date in format "YYYY-YYYY" (e.g., "2024-2025")
 * @param date - The date to get the financial year for (defaults to current date)
 * @returns Financial year as string in format "YYYY-YYYY"
 */
export function getFinancialYear(date = new Date()): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // January = 0

    if (month >= 4) {
        // April to December → current year - next year (e.g., 2024-2025)
        return `${year}-${year + 1}`;
    } else {
        // January to March → previous year - current year (e.g., 2023-2024)
        return `${year - 1}-${year}`;
    }
}

/**
 * Gets the current financial year in format "YYYY-YYYY"
 * @returns Current financial year as string (e.g., "2024-2025")
 */
export function getCurrentFinancialYear(): string {
    return getFinancialYear();
}

/**
 * Gets the start and end years of the current financial year
 * @returns Object with startYear and endYear as numbers
 */
export function getCurrentFinancialYearRange(): { startYear: number; endYear: number } {
    const [startYear, endYear] = getFinancialYear().split('-').map(Number);
    return { startYear, endYear };
}

export default getFinancialYear;
