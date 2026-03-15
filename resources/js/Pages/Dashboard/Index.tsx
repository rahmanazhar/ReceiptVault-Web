import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card, CardTitle } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import HelpTooltip from '@/Components/ui/HelpTooltip';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { DashboardStats, MonthlySpending, CategoryDistribution, TaxReliefProgress, Receipt } from '@/types/models';
import SpendingChart from '@/Components/dashboard/SpendingChart';
import CategoryPieChart from '@/Components/dashboard/CategoryPieChart';
import TaxReliefWidget from '@/Components/dashboard/TaxReliefWidget';
import {
    DocumentTextIcon,
    BanknotesIcon,
    CalculatorIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

interface Props {
    stats: DashboardStats;
    monthlySpending: MonthlySpending[];
    categoryDistribution: CategoryDistribution[];
    taxReliefProgress: TaxReliefProgress[];
    recentReceipts: Receipt[];
}

export default function DashboardIndex({ stats, monthlySpending, categoryDistribution, taxReliefProgress, recentReceipts }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <AppLayout>
                <TopBar title="Dashboard" action={{ label: 'New Receipt', href: '/receipts/create' }} />

                <div className="p-4 sm:p-6 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={<DocumentTextIcon className="h-5 w-5" />}
                            label="Total Receipts"
                            helpText="Total number of receipts uploaded across all time"
                            value={stats.total_receipts.toString()}
                            sub={`${stats.receipts_this_month} this month`}
                        />
                        <StatCard
                            icon={<BanknotesIcon className="h-5 w-5" />}
                            label="Spending This Month"
                            helpText="Sum of all receipt amounts for the current month"
                            value={formatCurrency(stats.spending_this_month)}
                        />
                        <StatCard
                            icon={<CalculatorIcon className="h-5 w-5" />}
                            label="Tax Deductible (YTD)"
                            helpText="Total tax-deductible amount claimed year-to-date under LHDN categories"
                            value={formatCurrency(stats.tax_deductible_ytd)}
                            accent
                        />
                        <StatCard
                            icon={<ClockIcon className="h-5 w-5" />}
                            label="Pending Review"
                            helpText="Receipts that need manual verification of AI-extracted data"
                            value={stats.pending_reviews.toString()}
                            warning={stats.pending_reviews > 0}
                        />
                    </div>

                    {/* Charts row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <div className="flex items-center gap-2">
                                <CardTitle>Monthly Spending</CardTitle>
                                <HelpTooltip text="Your spending trend over the past 12 months. Shows total vs tax-deductible amounts." />
                            </div>
                            <div className="mt-4 h-48 sm:h-64">
                                <SpendingChart data={monthlySpending} />
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center gap-2">
                                <CardTitle>By Category</CardTitle>
                                <HelpTooltip text="Breakdown of your spending by expense category" />
                            </div>
                            <div className="mt-4 h-48 sm:h-64">
                                <CategoryPieChart data={categoryDistribution} />
                            </div>
                        </Card>
                    </div>

                    {/* Tax Relief + Recent Receipts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <div className="flex items-center gap-2">
                                <CardTitle>LHDN Tax Relief Progress</CardTitle>
                                <HelpTooltip text="Progress toward annual LHDN tax relief limits by category" />
                            </div>
                            <div className="mt-4 space-y-3">
                                <TaxReliefWidget data={taxReliefProgress} />
                            </div>
                        </Card>

                        <Card>
                            <CardTitle>Recent Receipts</CardTitle>
                            <div className="mt-4 space-y-3">
                                {recentReceipts.length === 0 ? (
                                    <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">No receipts yet</p>
                                ) : (
                                    recentReceipts.slice(0, 5).map((receipt) => (
                                        <a
                                            key={receipt.id}
                                            href={`/receipts/${receipt.id}`}
                                            className="flex items-center justify-between rounded-lg p-3 hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                                    {receipt.merchant_name || 'Unknown Merchant'}
                                                </p>
                                                <p className="text-xs text-[var(--color-text-muted)]">
                                                    {receipt.purchase_date ? formatDate(receipt.purchase_date) : 'No date'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                                    {formatCurrency(receipt.total_amount)}
                                                </span>
                                                <Badge variant={
                                                    receipt.status === 'completed' ? 'success' :
                                                    receipt.status === 'review_needed' ? 'warning' :
                                                    receipt.status === 'processing' ? 'info' :
                                                    receipt.status === 'failed' ? 'error' : 'default'
                                                }>
                                                    {receipt.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}

function StatCard({ icon, label, value, sub, accent, warning, helpText }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    accent?: boolean;
    warning?: boolean;
    helpText?: string;
}) {
    return (
        <Card>
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    accent ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]' :
                    warning ? 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]' :
                    'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                }`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                        {helpText && <HelpTooltip text={helpText} />}
                    </div>
                    <p className={`text-xl font-bold ${
                        accent ? 'text-[var(--color-accent)]' :
                        warning ? 'text-[var(--color-warning)]' :
                        'text-[var(--color-text-primary)]'
                    }`}>
                        {value}
                    </p>
                    {sub && <p className="text-xs text-[var(--color-text-muted)]">{sub}</p>}
                </div>
            </div>
        </Card>
    );
}
