import { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import EmptyState from '@/Components/ui/EmptyState';
import Tooltip from '@/Components/ui/Tooltip';
import { formatDate } from '@/lib/utils';
import SortHeader from '@/Components/ui/SortHeader';
import {
    ClipboardDocumentCheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    FunnelIcon,
    CalendarIcon,
    PhotoIcon,
    EllipsisVerticalIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    TrashIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import type { MedicalCertificate, PaginatedResponse } from '@/types/models';

interface Props {
    medicalCertificates: PaginatedResponse<MedicalCertificate>;
    filters: {
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    sorting: { sort_by: string; sort_dir: 'asc' | 'desc' };
}

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'review_needed', label: 'Review Needed' },
    { value: 'processing', label: 'Processing' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
];

function formatMcPeriod(startDate: string | null, endDate: string | null, days: number | null): string {
    if (!startDate && !endDate) return '—';
    const parts: string[] = [];
    if (startDate) parts.push(formatDate(startDate));
    if (endDate && endDate !== startDate) {
        parts.push('–');
        parts.push(formatDate(endDate));
    }
    if (days !== null && days !== undefined) {
        parts.push(`(${days} day${days !== 1 ? 's' : ''})`);
    }
    return parts.join(' ');
}

export default function MedicalCertificatesIndex({ medicalCertificates, filters, sorting }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(
        !!(filters.status || filters.date_from || filters.date_to)
    );

    const handleSort = (column: string) => {
        const newDir = sorting.sort_by === column && sorting.sort_dir === 'asc' ? 'desc' : 'asc';
        router.get('/medical-certificates', { ...filters, sort_by: column, sort_dir: newDir }, { preserveState: true, preserveScroll: true });
    };

    const statusVariant = (status: string) => {
        switch (status) {
            case 'completed': return 'success' as const;
            case 'review_needed': return 'warning' as const;
            case 'processing': return 'info' as const;
            case 'failed': return 'error' as const;
            default: return 'default' as const;
        }
    };

    const applyFilters = (newFilters: Record<string, string | undefined>) => {
        const merged = { ...filters, ...newFilters };
        const cleaned: Record<string, string> = {};
        Object.entries(merged).forEach(([k, v]) => {
            if (v) cleaned[k] = v;
        });
        router.get('/medical-certificates', cleaned, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: search || undefined });
    };

    const clearSearch = () => {
        setSearch('');
        applyFilters({ search: undefined });
    };

    const clearAllFilters = () => {
        setSearch('');
        router.get('/medical-certificates', {}, { preserveState: true });
    };

    const hasActiveFilters = !!(filters.search || filters.status || filters.date_from || filters.date_to);

    const pageUrl = (page: number) => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.status) params.set('status', filters.status);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        if (sorting.sort_by) params.set('sort_by', sorting.sort_by);
        if (sorting.sort_dir) params.set('sort_dir', sorting.sort_dir);
        params.set('page', String(page));
        return `/medical-certificates?${params.toString()}`;
    };

    return (
        <>
            <Head title="Medical Certificates" />
            <AppLayout>
                <TopBar title="Medical Certificates" subtitle={`${medicalCertificates.total} total`} action={{ label: 'Upload MC', href: '/medical-certificates/create' }} />

                <div className="p-4 sm:p-6 space-y-4">
                    {/* Quick actions */}
                    <div className="flex justify-end">
                        <Link
                            href="/medical-certificates/summary"
                            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                        >
                            <ChartBarIcon className="h-4 w-4" />
                            Leave Summary
                        </Link>
                    </div>

                    {/* Search & Filter Bar */}
                    <Card>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <form onSubmit={handleSearch} className="flex-1 relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by patient, clinic, MC number, or notes..."
                                        className="w-full rounded-lg pl-9 pr-9 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </form>
                                <Tooltip content={showFilters ? 'Hide filters' : 'Show filters'} position="bottom">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`rounded-lg px-3 py-2 border transition-colors ${
                                            showFilters || hasActiveFilters
                                                ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                                                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                                        }`}
                                    >
                                        <FunnelIcon className="h-4 w-4" />
                                    </button>
                                </Tooltip>
                            </div>

                            {showFilters && (
                                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[var(--color-border)]">
                                    <div className="sm:w-44">
                                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Status</label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={(e) => applyFilters({ status: e.target.value || undefined })}
                                            className="w-full rounded-lg px-3 py-2 text-sm appearance-none bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                                        >
                                            {STATUS_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                                            <CalendarIcon className="h-3.5 w-3.5 inline mr-1" />
                                            From
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.date_from || ''}
                                            onChange={(e) => applyFilters({ date_from: e.target.value || undefined })}
                                            className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                                            <CalendarIcon className="h-3.5 w-3.5 inline mr-1" />
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.date_to || ''}
                                            onChange={(e) => applyFilters({ date_to: e.target.value || undefined })}
                                            className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                                        />
                                    </div>
                                    {hasActiveFilters && (
                                        <div className="flex items-end">
                                            <button
                                                onClick={clearAllFilters}
                                                className="rounded-lg px-3 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-error-muted)] transition-colors"
                                            >
                                                Clear all
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2">
                                    {filters.search && (
                                        <FilterTag label={`Search: "${filters.search}"`} onRemove={() => { setSearch(''); applyFilters({ search: undefined }); }} />
                                    )}
                                    {filters.status && (
                                        <FilterTag label={`Status: ${filters.status.replace('_', ' ')}`} onRemove={() => applyFilters({ status: undefined })} />
                                    )}
                                    {filters.date_from && (
                                        <FilterTag label={`From: ${filters.date_from}`} onRemove={() => applyFilters({ date_from: undefined })} />
                                    )}
                                    {filters.date_to && (
                                        <FilterTag label={`To: ${filters.date_to}`} onRemove={() => applyFilters({ date_to: undefined })} />
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Content */}
                    {medicalCertificates.data.length === 0 ? (
                        <EmptyState
                            icon={<ClipboardDocumentCheckIcon className="h-12 w-12" />}
                            title={hasActiveFilters ? 'No medical certificates match your filters' : 'No medical certificates yet'}
                            description={hasActiveFilters
                                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                                : 'Upload your first medical certificate to start tracking your medical leave records.'
                            }
                            action={hasActiveFilters
                                ? { label: 'Clear Filters', onClick: clearAllFilters }
                                : { label: 'Upload MC', onClick: () => window.location.href = '/medical-certificates/create' }
                            }
                        />
                    ) : (
                        <>
                            {/* Desktop table view */}
                            <Card className="overflow-hidden !p-0 hidden md:block">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)]">
                                            <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-3 w-16"></th>
                                            <SortHeader column="patient_name" label="Patient" sorting={sorting} onSort={handleSort} />
                                            <SortHeader column="clinic_name" label="Clinic" sorting={sorting} onSort={handleSort} />
                                            <SortHeader column="mc_start_date" label="MC Period" sorting={sorting} onSort={handleSort} />
                                            <SortHeader column="mc_days" label="Days" sorting={sorting} onSort={handleSort} align="center" />
                                            <SortHeader column="status" label="Status" sorting={sorting} onSort={handleSort} align="center" />
                                            <SortHeader column="ai_confidence_score" label="AI" sorting={sorting} onSort={handleSort} align="right" />
                                            <th className="text-right text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-3 w-16">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicalCertificates.data.map((mc) => (
                                            <tr
                                                key={mc.id}
                                                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
                                                onClick={() => router.visit(`/medical-certificates/${mc.id}`)}
                                            >
                                                <td className="px-4 py-2">
                                                    <McThumbnail mc={mc} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[200px]">
                                                        {mc.patient_name || 'Unknown Patient'}
                                                    </p>
                                                    {mc.doctor_name && (
                                                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                                                            Dr. {mc.doctor_name}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] truncate max-w-[180px]">
                                                    {mc.clinic_name || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
                                                    {formatMcPeriod(mc.mc_start_date, mc.mc_end_date, mc.mc_days)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center text-[var(--color-text-secondary)] whitespace-nowrap">
                                                    {mc.mc_days ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant={statusVariant(mc.status)}>
                                                        {mc.status.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {mc.ai_confidence_score ? (
                                                        <span className={`text-xs font-medium ${
                                                            parseFloat(mc.ai_confidence_score) >= 0.8
                                                                ? 'text-[var(--color-success)]'
                                                                : parseFloat(mc.ai_confidence_score) >= 0.5
                                                                    ? 'text-[var(--color-warning)]'
                                                                    : 'text-[var(--color-error)]'
                                                        }`}>
                                                            {Math.round(parseFloat(mc.ai_confidence_score) * 100)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-[var(--color-text-muted)]">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <RowActions mc={mc} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>

                            {/* Mobile card view */}
                            <div className="md:hidden space-y-3">
                                {medicalCertificates.data.map((mc) => (
                                    <Link key={mc.id} href={`/medical-certificates/${mc.id}`}>
                                        <Card hover>
                                            <div className="flex gap-3">
                                                <McThumbnail mc={mc} size="lg" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">
                                                            {mc.patient_name || 'Unknown Patient'}
                                                        </p>
                                                        <Badge variant={statusVariant(mc.status)}>
                                                            {mc.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                                        {mc.clinic_name || 'No clinic'}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                                            {formatMcPeriod(mc.mc_start_date, mc.mc_end_date, mc.mc_days)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {medicalCertificates.last_page > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <Link
                                href={medicalCertificates.current_page > 1 ? pageUrl(medicalCertificates.current_page - 1) : '#'}
                                className={`p-1.5 rounded-lg ${
                                    medicalCertificates.current_page > 1
                                        ? 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                                        : 'text-[var(--color-text-muted)]/30 pointer-events-none'
                                }`}
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </Link>

                            <div className="hidden sm:flex gap-2">
                                {Array.from({ length: medicalCertificates.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={pageUrl(page)}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${
                                            page === medicalCertificates.current_page
                                                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
                                                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                            </div>

                            <span className="sm:hidden text-sm text-[var(--color-text-secondary)]">
                                Page {medicalCertificates.current_page} of {medicalCertificates.last_page}
                            </span>

                            <Link
                                href={medicalCertificates.current_page < medicalCertificates.last_page ? pageUrl(medicalCertificates.current_page + 1) : '#'}
                                className={`p-1.5 rounded-lg ${
                                    medicalCertificates.current_page < medicalCertificates.last_page
                                        ? 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                                        : 'text-[var(--color-text-muted)]/30 pointer-events-none'
                                }`}
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </Link>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}

function RowActions({ mc }: { mc: MedicalCertificate }) {
    const [open, setOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setConfirmDelete(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        setOpen(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        router.delete(`/medical-certificates/${mc.id}`, { preserveScroll: true });
        setOpen(false);
        setConfirmDelete(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); setConfirmDelete(false); }}
                className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
                <EllipsisVerticalIcon className="h-5 w-5" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-lg z-50 py-1">
                    <button
                        onClick={(e) => handleAction(e, () => router.visit(`/medical-certificates/${mc.id}`))}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    >
                        <EyeIcon className="h-4 w-4" />
                        View
                    </button>
                    <button
                        onClick={(e) => handleAction(e, () => window.open(`/medical-certificates/${mc.id}/download`, '_blank'))}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Download
                    </button>
                    {mc.status !== 'processing' && (
                        <button
                            onClick={(e) => handleAction(e, () => router.post(`/medical-certificates/${mc.id}/retry-ai`, {}, { preserveScroll: true }))}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        >
                            <ArrowPathIcon className="h-4 w-4" />
                            Retry AI
                        </button>
                    )}
                    <div className="border-t border-[var(--color-border)] my-1" />
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-error-muted)] transition-colors"
                    >
                        <TrashIcon className="h-4 w-4" />
                        {confirmDelete ? 'Confirm Delete?' : 'Delete'}
                    </button>
                </div>
            )}
        </div>
    );
}

function McThumbnail({ mc, size = 'sm' }: { mc: MedicalCertificate; size?: 'sm' | 'lg' }) {
    const sizeClasses = size === 'lg' ? 'h-16 w-16' : 'h-10 w-10';
    const url = mc.thumbnail_url || mc.image_url;

    if (!url) {
        return (
            <div className={`${sizeClasses} rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0`}>
                <PhotoIcon className="h-5 w-5 text-[var(--color-text-muted)]" />
            </div>
        );
    }

    return (
        <img
            src={url}
            alt={mc.patient_name || 'Medical Certificate'}
            className={`${sizeClasses} rounded-lg object-cover shrink-0 bg-[var(--color-bg-tertiary)]`}
            loading="lazy"
        />
    );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-xs px-2.5 py-1">
            {label}
            <button onClick={onRemove} className="hover:text-[var(--color-text-primary)] transition-colors">
                <XMarkIcon className="h-3 w-3" />
            </button>
        </span>
    );
}
