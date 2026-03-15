import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CalendarDaysIcon,
    ClipboardDocumentCheckIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import type { MedicalCertificate } from '@/types/models';

interface YearlyStat {
    year: number;
    total_mcs: number;
    total_days: number;
}

interface MonthlyStat {
    year: number;
    month: number;
    total_mcs: number;
    total_days: number;
}

interface Props {
    yearly: YearlyStat[];
    monthly: Record<string, MonthlyStat[]>;
    recentMcs: MedicalCertificate[];
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function Summary({ yearly, monthly, recentMcs }: Props) {
    const [expandedYear, setExpandedYear] = useState<number | null>(
        yearly.length > 0 ? yearly[0].year : null
    );

    const totalAllTime = yearly.reduce((sum, y) => sum + Number(y.total_days), 0);
    const totalMcsAllTime = yearly.reduce((sum, y) => sum + Number(y.total_mcs), 0);

    const toggleYear = (year: number) => {
        setExpandedYear(expandedYear === year ? null : year);
    };

    // For the bar chart, find the max days in any month across all data
    const allMonthlyStats = Object.values(monthly).flat();
    const maxMonthDays = Math.max(...allMonthlyStats.map(m => Number(m.total_days)), 1);

    return (
        <>
            <Head title="Leave Summary" />
            <AppLayout>
                <TopBar title="Leave Summary" subtitle="Yearly medical leave overview" />

                <div className="p-4 sm:p-6 space-y-6">
                    {/* Back link */}
                    <Link
                        href="/medical-certificates"
                        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Medical Certificates
                    </Link>

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Card>
                            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Total Leave Days</p>
                            <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{totalAllTime}</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">all time</p>
                        </Card>
                        <Card>
                            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Total MCs</p>
                            <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{totalMcsAllTime}</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">all time</p>
                        </Card>
                        <Card className="col-span-2 sm:col-span-1">
                            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Avg Days / MC</p>
                            <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">
                                {totalMcsAllTime > 0 ? (totalAllTime / totalMcsAllTime).toFixed(1) : '0'}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">all time</p>
                        </Card>
                    </div>

                    {yearly.length === 0 ? (
                        <Card className="text-center py-12">
                            <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto text-[var(--color-text-muted)] mb-3" />
                            <p className="text-[var(--color-text-muted)]">No medical certificates with dates found.</p>
                            <Link
                                href="/medical-certificates/create"
                                className="inline-block mt-3 text-sm text-[var(--color-accent)] hover:underline"
                            >
                                Upload your first MC
                            </Link>
                        </Card>
                    ) : (
                        <>
                            {/* Yearly breakdown */}
                            <div className="space-y-3">
                                <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                                    Yearly Breakdown
                                </h2>
                                {yearly.map((yearStat) => {
                                    const isExpanded = expandedYear === yearStat.year;
                                    const yearMonths = monthly[yearStat.year] || [];

                                    return (
                                        <Card key={yearStat.year} className="!p-0 overflow-hidden">
                                            {/* Year header */}
                                            <button
                                                onClick={() => toggleYear(yearStat.year)}
                                                className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xl font-bold text-[var(--color-text-primary)]">
                                                        {yearStat.year}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="info">
                                                            {yearStat.total_mcs} MC{Number(yearStat.total_mcs) !== 1 ? 's' : ''}
                                                        </Badge>
                                                        <Badge variant="warning">
                                                            {yearStat.total_days} day{Number(yearStat.total_days) !== 1 ? 's' : ''}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUpIcon className="h-5 w-5 text-[var(--color-text-muted)]" />
                                                ) : (
                                                    <ChevronDownIcon className="h-5 w-5 text-[var(--color-text-muted)]" />
                                                )}
                                            </button>

                                            {/* Monthly breakdown */}
                                            {isExpanded && (
                                                <div className="border-t border-[var(--color-border)] px-4 sm:px-6 py-4 space-y-3">
                                                    {/* Monthly bar chart */}
                                                    <div className="space-y-2">
                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((monthNum) => {
                                                            const monthData = yearMonths.find(
                                                                (m: MonthlyStat) => Number(m.month) === monthNum
                                                            );
                                                            const days = monthData ? Number(monthData.total_days) : 0;
                                                            const mcs = monthData ? Number(monthData.total_mcs) : 0;
                                                            const barWidth = maxMonthDays > 0 ? (days / maxMonthDays) * 100 : 0;

                                                            return (
                                                                <div key={monthNum} className="flex items-center gap-3">
                                                                    <span className="text-xs font-medium text-[var(--color-text-muted)] w-8 text-right shrink-0">
                                                                        {MONTH_SHORT[monthNum - 1]}
                                                                    </span>
                                                                    <div className="flex-1 h-6 bg-[var(--color-bg-tertiary)] rounded-md overflow-hidden relative">
                                                                        {days > 0 && (
                                                                            <div
                                                                                className="h-full bg-[var(--color-accent)] rounded-md transition-all duration-300"
                                                                                style={{ width: `${Math.max(barWidth, 4)}%` }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs text-[var(--color-text-secondary)] w-20 shrink-0 text-right">
                                                                        {days > 0
                                                                            ? `${days}d / ${mcs} MC${mcs !== 1 ? 's' : ''}`
                                                                            : '—'
                                                                        }
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Recent MCs */}
                            {recentMcs.length > 0 && (
                                <div className="space-y-3">
                                    <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                                        Recent Medical Leaves
                                    </h2>
                                    <Card className="!p-0 overflow-hidden">
                                        <div className="divide-y divide-[var(--color-border)]">
                                            {recentMcs.map((mc) => (
                                                <Link
                                                    key={mc.id}
                                                    href={`/medical-certificates/${mc.id}`}
                                                    className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                                            {mc.patient_name || 'Unknown Patient'}
                                                        </p>
                                                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                                                            {mc.clinic_name || 'No clinic'}{mc.mc_number ? ` • ${mc.mc_number}` : ''}
                                                        </p>
                                                    </div>
                                                    <div className="text-right shrink-0 ml-4">
                                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                                            {mc.mc_start_date ? formatDate(mc.mc_start_date) : '—'}
                                                        </p>
                                                        {mc.mc_days !== null && (
                                                            <p className="text-xs font-medium text-[var(--color-accent)]">
                                                                {mc.mc_days} day{mc.mc_days !== 1 ? 's' : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
