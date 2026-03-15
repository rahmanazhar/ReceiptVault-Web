import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = 'MYR'): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(num);
}

export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(d);
}

export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

export function getConfidenceColor(score: number): string {
    if (score >= 0.8) return 'text-[var(--color-success)]';
    if (score >= 0.5) return 'text-[var(--color-warning)]';
    return 'text-[var(--color-error)]';
}

export function getConfidenceLabel(score: number): string {
    if (score >= 0.8) return 'High';
    if (score >= 0.5) return 'Medium';
    return 'Low';
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'completed':
            return 'bg-[var(--color-success-muted)] text-[var(--color-success)]';
        case 'processing':
            return 'bg-[var(--color-info-muted)] text-[var(--color-info)]';
        case 'review_needed':
            return 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]';
        case 'failed':
            return 'bg-[var(--color-error-muted)] text-[var(--color-error)]';
        default:
            return 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]';
    }
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}
