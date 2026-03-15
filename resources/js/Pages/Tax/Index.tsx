import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card, CardTitle, CardDescription } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import HelpTooltip from '@/Components/ui/HelpTooltip';
import Tooltip from '@/Components/ui/Tooltip';
import TaxReliefWidget from '@/Components/dashboard/TaxReliefWidget';
import { formatCurrency } from '@/lib/utils';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import type { TaxReliefProgress } from '@/types/models';

interface Props {
    year: number;
    reliefProgress: TaxReliefProgress[];
    totalClaimed: number;
    totalLimit: number;
    availableYears: number[];
}

export default function TaxIndex({ year, reliefProgress, totalClaimed, totalLimit, availableYears }: Props) {
    const overallPercentage = totalLimit > 0 ? Math.round((totalClaimed / totalLimit) * 100) : 0;

    return (
        <>
            <Head title="Tax Tracking" />
            <AppLayout>
                <TopBar
                    title="LHDN Tax Relief Tracking"
                    subtitle={`Year of Assessment ${year}`}
                />

                <div className="p-4 sm:p-6 space-y-6">
                    {/* Year selector + overview */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {availableYears.map((y) => (
                                <Tooltip key={y} content={`View tax data for ${y}`} position="bottom">
                                    <button
                                        onClick={() => router.get('/tax', { year: y }, { preserveState: true })}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                            y === year
                                                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-medium'
                                                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'
                                        }`}
                                    >
                                        {y}
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                        <Link href={`/tax/report/${year}`}>
                            <Button variant="secondary" size="sm" tooltip="View detailed tax report for printing">
                                <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                                View Full Report
                            </Button>
                        </Link>
                    </div>

                    {/* Overview card */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle>Total Tax Relief Claimed</CardTitle>
                                    <HelpTooltip text="Total amount claimed across all LHDN relief categories for this year" />
                                </div>
                                <CardDescription>Combined relief across all LHDN categories</CardDescription>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-[var(--color-accent)]">
                                    {formatCurrency(totalClaimed)}
                                </p>
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    of {formatCurrency(totalLimit)} available
                                </p>
                            </div>
                        </div>
                        <div className="h-3 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700"
                                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                            />
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            <p className="text-xs text-[var(--color-text-muted)]">{overallPercentage}% utilized</p>
                            <HelpTooltip text="Percentage of total available tax relief limits used" />
                        </div>
                    </Card>

                    {/* Category breakdown */}
                    <Card>
                        <div className="flex items-center gap-2">
                            <CardTitle>Relief Categories</CardTitle>
                            <HelpTooltip text="Detailed breakdown of claims against each LHDN category" />
                        </div>
                        <div className="mt-4">
                            <TaxReliefWidget data={reliefProgress} />
                        </div>
                    </Card>

                    {/* Individual category cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reliefProgress.filter(item => !item.parent_code).map((item) => {
                            const pct = Math.min(item.percentage, 100);
                            return (
                                <Card key={item.code}>
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.name}</p>
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            {item.receipt_count} receipts
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-[var(--color-text-primary)]">
                                        {formatCurrency(item.claimed_amount)}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)] mb-2">
                                        Limit: {formatCurrency(item.annual_limit)}
                                    </p>
                                    <div className="h-1.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                pct >= 100 ? 'bg-[var(--color-error)]' :
                                                pct >= 80 ? 'bg-[var(--color-warning)]' :
                                                'bg-[var(--color-accent)]'
                                            }`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
