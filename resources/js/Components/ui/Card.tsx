import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover = false, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-6',
                hover && 'transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-tertiary)] cursor-pointer',
                className
            )}
            {...props}
        />
    )
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('mb-4', className)} {...props} />
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn('text-lg font-semibold text-[var(--color-text-primary)]', className)} {...props} />
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('text-sm text-[var(--color-text-muted)]', className)} {...props} />
    )
);
CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardTitle, CardDescription };
export default Card;
