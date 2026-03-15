import type { TaxReliefProgress } from '@/types/models';
import { formatCurrency } from '@/lib/utils';

interface Props {
    data: TaxReliefProgress[];
}

export default function TaxReliefWidget({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
                No tax relief claims yet this year
            </p>
        );
    }

    return (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {data.map((item) => {
                const pct = Math.min(item.percentage, 100);
                const barColor =
                    pct >= 100 ? 'bg-[var(--color-error)]' :
                    pct >= 80 ? 'bg-[var(--color-warning)]' :
                    'bg-[var(--color-accent)]';

                return (
                    <div key={item.code}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-[var(--color-text-secondary)] truncate pr-2">
                                {item.name}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                                {formatCurrency(item.claimed_amount)} / {formatCurrency(item.annual_limit)}
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
