export interface Rational {
    s: 1 | -1;
    n: number;
    d: number;
}

export function toRationalString(amount: number): string {
    return JSON.stringify({
        s: amount >= 0 ? 1 : -1,
        n: Math.abs(Math.round(amount * 100)),
        d: 100,
    });
}

export function parseRational(rational: Rational | string | null | undefined): number {
    if (!rational) return 0;
    try {
        const r: Rational = typeof rational === 'string' ? JSON.parse(rational) : rational;
        return (r.s * r.n) / r.d;
    } catch {
        return 0;
    }
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
}
