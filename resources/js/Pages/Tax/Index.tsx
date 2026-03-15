import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card, CardTitle, CardDescription } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import HelpTooltip from '@/Components/ui/HelpTooltip';
import Tooltip from '@/Components/ui/Tooltip';
import TaxReliefWidget from '@/Components/dashboard/TaxReliefWidget';
import { formatCurrency } from '@/lib/utils';
import {
    DocumentTextIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
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

                    {/* Individual category cards with expandable details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reliefProgress.map((item) => (
                            <TaxReliefCategoryCard key={item.code} item={item} />
                        ))}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}

function TaxReliefCategoryCard({ item }: { item: TaxReliefProgress }) {
    const [expanded, setExpanded] = useState(false);

    const isUnlimited = item.annual_limit === 0 && item.metadata?.deduction_type === 'tax_rebate';
    const pct = isUnlimited ? 0 : Math.min(item.percentage, 100);
    const isPerChild = item.metadata?.per_child;
    const isPerParent = item.metadata?.per_parent;
    const qualifyingItems = item.metadata?.qualifying_items || [];
    const children = item.children || [];

    return (
        <Card>
            <div
                className="cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {isPerChild && (
                                <Badge variant="info">Per child</Badge>
                            )}
                            {isPerParent && (
                                <Badge variant="info">Per parent</Badge>
                            )}
                            {isUnlimited && (
                                <Badge variant="default">Tax rebate</Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[var(--color-text-muted)]">
                            {item.receipt_count} receipts
                        </span>
                        {expanded ? (
                            <ChevronUpIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
                        )}
                    </div>
                </div>

                <p className="text-lg font-bold text-[var(--color-text-primary)]">
                    {formatCurrency(item.claimed_amount)}
                </p>
                {isUnlimited ? (
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">
                        Deducted from tax (no limit)
                    </p>
                ) : (
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">
                        Limit: {formatCurrency(item.annual_limit)}
                    </p>
                )}

                {!isUnlimited && (
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
                )}
            </div>

            {/* Expandable detail section */}
            {expanded && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                    {item.description && (
                        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                            {item.description}
                        </p>
                    )}

                    {qualifyingItems.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs font-medium text-[var(--color-text-primary)] mb-2">
                                What qualifies:
                            </p>
                            <ul className="space-y-1.5">
                                {qualifyingItems.map((qi, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                                        <CheckCircleIcon className="h-3.5 w-3.5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                                        <span>{qi}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Sub-categories */}
                    {children.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs font-medium text-[var(--color-text-primary)] mb-2">
                                Sub-limits:
                            </p>
                            <div className="space-y-2">
                                {children.map((child) => {
                                    const childPct = child.annual_limit > 0
                                        ? Math.min(Math.round((child.claimed_amount / child.annual_limit) * 100), 100)
                                        : 0;
                                    return (
                                        <div key={child.code} className="rounded-lg bg-[var(--color-bg-tertiary)] p-2.5">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-[var(--color-text-secondary)]">
                                                    {child.name}
                                                </span>
                                                <span className="text-xs text-[var(--color-text-muted)]">
                                                    {formatCurrency(child.claimed_amount)} / {formatCurrency(child.annual_limit)}
                                                </span>
                                            </div>
                                            <div className="h-1 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        childPct >= 100 ? 'bg-[var(--color-error)]' :
                                                        childPct >= 80 ? 'bg-[var(--color-warning)]' :
                                                        'bg-[var(--color-accent)]'
                                                    }`}
                                                    style={{ width: `${childPct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
