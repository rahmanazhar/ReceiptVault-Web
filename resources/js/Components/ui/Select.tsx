import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, placeholder, id, ...props }, ref) => {
        return (
            <div className="space-y-1">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={id}
                    className={cn(
                        'w-full rounded-lg px-3 py-2 text-sm appearance-none',
                        'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
                        'border border-[var(--color-border)]',
                        'focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
                        'transition-colors duration-150',
                        error && 'border-[var(--color-error)]',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" className="text-[var(--color-text-muted)]">
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
export default Select;
