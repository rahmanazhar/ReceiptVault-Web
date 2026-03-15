import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';
import HelpTooltip from './HelpTooltip';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    helpText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, helpText, id, ...props }, ref) => {
        return (
            <div className="space-y-1">
                {label && (
                    <div className="flex items-center gap-1.5">
                        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-secondary)]">
                            {label}
                        </label>
                        {helpText && <HelpTooltip text={helpText} />}
                    </div>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={cn(
                        'w-full rounded-lg px-3 py-2 text-sm',
                        'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
                        'border border-[var(--color-border)]',
                        'placeholder:text-[var(--color-text-muted)]',
                        'focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
                        'transition-colors duration-150',
                        error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
                {hint && !error && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
export default Input;
