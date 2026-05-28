/**
 * Currency formatting utilities
 */
import type { Rational } from './rational';

/**
 * Format a number as USD currency with cents
 * @param amount - The amount to format
 * @returns Formatted string like "$1,234.56"
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format a number as USD currency without cents (for display purposes where precision isn't needed)
 * @param amount - The amount to format
 * @returns Formatted string like "$1,235"
 */
export function formatCurrencyWhole(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Parse a Rational amount from GraphQL
 * Rational is { s: sign, n: numerator, d: denominator }
 */
export function parseRational(total: Rational | string | null | undefined): number {
    if (!total) return 0;
    
    try {
        const t: Rational = typeof total === 'string' ? JSON.parse(total) : total;
        if (t && t.n !== undefined && t.d !== undefined) {
            const sign = t.s ?? 1;
            return (sign * t.n) / t.d;
        }
    } catch {
        return 0;
    }
    
    return 0;
}
