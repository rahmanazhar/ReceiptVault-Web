import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import Tooltip from './Tooltip';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    tooltip: string;
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon, tooltip, tooltipPosition = 'top', variant = 'ghost', size = 'md', className, disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]',
            secondary: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)]',
            danger: 'bg-[var(--color-error-muted)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white',
            ghost: 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]',
        };

        const sizes = {
            sm: 'p-1.5',
            md: 'p-2',
            lg: 'p-2.5',
        };

        return (
            <Tooltip content={tooltip} position={tooltipPosition}>
                <button
                    ref={ref}
                    disabled={disabled}
                    className={cn(
                        'inline-flex items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        variants[variant],
                        sizes[size],
                        className
                    )}
                    {...props}
                >
                    {icon}
                </button>
            </Tooltip>
        );
    }
);

IconButton.displayName = 'IconButton';
export default IconButton;
