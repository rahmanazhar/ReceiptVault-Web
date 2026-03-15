import { cn } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants = {
        default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
        success: 'bg-[var(--color-success-muted)] text-[var(--color-success)]',
        warning: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
        error: 'bg-[var(--color-error-muted)] text-[var(--color-error)]',
        info: 'bg-[var(--color-info-muted)] text-[var(--color-info)]',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
