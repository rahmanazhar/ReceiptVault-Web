import { Link } from '@inertiajs/react';
import type { TaxReliefProgress } from '@/types/models';
import { formatCurrency } from '@/lib/utils';

interface Props {
    data: TaxReliefProgress[];
    limit?: number;
    showViewAll?: boolean;
}

export default function TaxReliefWidget({ data, limit, showViewAll }: Props) {
    if (!data || data.length === 0) {
        return (
            <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
                No tax relief categories available
            </p>
        );
    }

    const displayData = limit ? data.slice(0, limit) : data;
    const hasMore = limit ? data.length > limit : false;

    return (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {displayData.map((item) => {
                const isUnlimited = item.annual_limit === 0 && item.metadata?.deduction_type === 'tax_rebate';
                const pct = isUnlimited ? 0 : Math.min(item.percentage, 100);
                const hasClaims = item.claimed_amount > 0;
                const barColor =
                    pct >= 100 ? 'bg-[var(--color-error)]' :
                    pct >= 80 ? 'bg-[var(--color-warning)]' :
                    'bg-[var(--color-accent)]';

                return (
                    <div key={item.code} className={!hasClaims ? 'opacity-50' : ''}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-[var(--color-text-secondary)] truncate pr-2">
                                {item.name}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                                {isUnlimited ? (
                                    formatCurrency(item.claimed_amount)
                                ) : (
                                    <>{formatCurrency(item.claimed_amount)} / {formatCurrency(item.annual_limit)}</>
                                )}
                            </span>
                        </div>
                        {isUnlimited ? (
                            <div className="h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                                <div className="h-full rounded-full bg-[var(--color-accent)] w-full opacity-30" />
                            </div>
                        ) : (
                            <div className="h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}

            {hasMore && showViewAll && (
                <Link
                    href="/tax"
                    className="block text-center text-sm text-[var(--color-accent)] hover:underline py-2"
                >
                    View all categories
                </Link>
            )}
        </div>
    );
}
