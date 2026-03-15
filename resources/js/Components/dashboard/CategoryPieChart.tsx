import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryDistribution } from '@/types/models';
import { formatCurrency } from '@/lib/utils';

const DEFAULT_COLORS = ['#22d3ee', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c'];

interface Props {
    data: CategoryDistribution[];
}

export default function CategoryPieChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
                No category data yet
            </div>
        );
    }

    return (
        <div className="flex h-full items-center">
            <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="total"
                    >
                        {data.map((entry, i) => (
                            <Cell key={entry.name} fill={entry.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#12121a',
                            border: '1px solid #1e1e36',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                        formatter={(value) => [formatCurrency(Number(value)), 'Total']}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-2">
                {data.slice(0, 5).map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                        />
                        <span className="text-xs text-[var(--color-text-secondary)] truncate flex-1">{item.name}</span>
                        <span className="text-xs font-medium text-[var(--color-text-primary)]">
                            {formatCurrency(item.total)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
