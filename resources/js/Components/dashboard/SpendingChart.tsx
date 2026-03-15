import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlySpending } from '@/types/models';
import { formatCurrency } from '@/lib/utils';

interface Props {
    data: MonthlySpending[];
}

export default function SpendingChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
                No spending data yet
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                    <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="month"
                    stroke="#5a5a7a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#5a5a7a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `RM${v}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#12121a',
                        border: '1px solid #1e1e36',
                        borderRadius: '8px',
                        fontSize: '12px',
                    }}
                    labelStyle={{ color: '#e4e4ef' }}
                    formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        name === 'total' ? 'Total Spending' : 'Tax Deductible',
                    ]}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fill="url(#totalGradient)"
                />
                <Area
                    type="monotone"
                    dataKey="tax_deductible"
                    stroke="#34d399"
                    strokeWidth={2}
                    fill="url(#taxGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
