import { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import EmptyState from '@/Components/ui/EmptyState';
import Tooltip from '@/Components/ui/Tooltip';
import { formatCurrency, formatDate } from '@/lib/utils';
import SortHeader from '@/Components/ui/SortHeader';
import {
    DocumentTextIcon,
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
} from '@heroicons/react/24/outline';
import type { Receipt, PaginatedResponse } from '@/types/models';

interface Props {
    receipts: PaginatedResponse<Receipt>;
    filters: {
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    sorting: {
        sort_by: string;
        sort_dir: 'asc' | 'desc';
    };
}

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'review_needed', label: 'Review Needed' },
    { value: 'processing', label: 'Processing' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
];

export default function ReceiptsIndex({ receipts, filters, sorting }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(
        !!(filters.status || filters.date_from || filters.date_to)
    );

    const handleSort = (column: string) => {
        const newDir = sorting.sort_by === column && sorting.sort_dir === 'asc' ? 'desc' : 'asc';
        router.get('/receipts', { ...filters, sort_by: column, sort_dir: newDir }, { preserveState: true, preserveScroll: true });
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
        // Remove empty values
        const cleaned: Record<string, string> = {};
        Object.entries(merged).forEach(([k, v]) => {
            if (v) cleaned[k] = v;
        });
        router.get('/receipts', cleaned, { preserveState: true, preserveScroll: true });
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
        router.get('/receipts', {}, { preserveState: true });
    };

    const hasActiveFilters = !!(filters.search || filters.status || filters.date_from || filters.date_to);

    // Build pagination URL preserving filters and sorting
    const pageUrl = (page: number) => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.status) params.set('status', filters.status);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        if (sorting.sort_by) params.set('sort_by', sorting.sort_by);
        if (sorting.sort_dir) params.set('sort_dir', sorting.sort_dir);
        params.set('page', String(page));
        return `/receipts?${params.toString()}`;
    };

    return (
        <>
            <Head title="Receipts" />
            <AppLayout>
                <TopBar title="Receipts" subtitle={`${receipts.total} total`} action={{ label: 'Upload Receipt', href: '/receipts/create' }} />

                <div className="p-4 sm:p-6 space-y-4">
                    {/* Search & Filter Bar */}
                    <Card>
                        <div className="space-y-3">
                            {/* Search row */}
                            <div className="flex gap-3">
                                <form onSubmit={handleSearch} className="flex-1 relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by merchant, receipt number, or notes..."
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

                            {/* Filter row */}
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

                            {/* Active filter tags */}
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
                    {receipts.data.length === 0 ? (
                        <EmptyState
                            icon={<DocumentTextIcon className="h-12 w-12" />}
                            title={hasActiveFilters ? 'No receipts match your filters' : 'No receipts yet'}
                            description={hasActiveFilters
                                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                                : 'Upload your first receipt to start tracking your expenses and tax deductions.'
                            }
                            action={hasActiveFilters
                                ? { label: 'Clear Filters', onClick: clearAllFilters }
                                : { label: 'Upload Receipt', onClick: () => window.location.href = '/receipts/create' }
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
                                            <SortHeader column="merchant_name" label="Merchant" sorting={sorting} onSort={handleSort} />
                                            <SortHeader column="purchase_date" label="Date" sorting={sorting} onSort={handleSort} />
                                            <SortHeader column="total_amount" label="Amount" sorting={sorting} onSort={handleSort} align="right" />
                                            <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-3">Payment</th>
                                            <SortHeader column="status" label="Status" sorting={sorting} onSort={handleSort} align="center" />
                                            <SortHeader column="ai_confidence_score" label="AI" sorting={sorting} onSort={handleSort} align="right" />
                                            <th className="text-right text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-3 w-16">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receipts.data.map((receipt) => (
                                            <tr
                                                key={receipt.id}
                                                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
                                                onClick={() => router.visit(`/receipts/${receipt.id}`)}
                                            >
                                                <td className="px-4 py-2">
                                                    <ReceiptThumbnail receipt={receipt} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[200px]">
                                                        {receipt.merchant_name || 'Unknown Merchant'}
                                                    </p>
                                                    {receipt.receipt_number && (
                                                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                                                            #{receipt.receipt_number}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
                                                    {receipt.purchase_date ? formatDate(receipt.purchase_date) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
                                                    {formatCurrency(receipt.total_amount)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] capitalize whitespace-nowrap">
                                                    {receipt.payment_method?.replace('_', ' ') || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant={statusVariant(receipt.status)}>
                                                        {receipt.status.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {receipt.ai_confidence_score ? (
                                                        <span className={`text-xs font-medium ${
                                                            parseFloat(receipt.ai_confidence_score) >= 0.8
                                                                ? 'text-[var(--color-success)]'
                                                                : parseFloat(receipt.ai_confidence_score) >= 0.5
                                                                    ? 'text-[var(--color-warning)]'
                                                                    : 'text-[var(--color-error)]'
                                                        }`}>
                                                            {Math.round(parseFloat(receipt.ai_confidence_score) * 100)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-[var(--color-text-muted)]">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <RowActions receipt={receipt} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>

                            {/* Mobile card view */}
                            <div className="md:hidden space-y-3">
                                {receipts.data.map((receipt) => (
                                    <Link key={receipt.id} href={`/receipts/${receipt.id}`}>
                                        <Card hover>
                                            <div className="flex gap-3">
                                                <ReceiptThumbnail receipt={receipt} size="lg" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">
                                                            {receipt.merchant_name || 'Unknown Merchant'}
                                                        </p>
                                                        <Badge variant={statusVariant(receipt.status)}>
                                                            {receipt.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                                        {receipt.purchase_date ? formatDate(receipt.purchase_date) : 'No date'}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-lg font-bold text-[var(--color-text-primary)]">
                                                            {formatCurrency(receipt.total_amount)}
                                                        </p>
                                                        {receipt.payment_method && (
                                                            <p className="text-xs text-[var(--color-text-muted)] capitalize">
                                                                {receipt.payment_method.replace('_', ' ')}
                                                            </p>
                                                        )}
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
                    {receipts.last_page > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <Link
                                href={receipts.current_page > 1 ? pageUrl(receipts.current_page - 1) : '#'}
                                className={`p-1.5 rounded-lg ${
                                    receipts.current_page > 1
                                        ? 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                                        : 'text-[var(--color-text-muted)]/30 pointer-events-none'
                                }`}
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </Link>

                            <div className="hidden sm:flex gap-2">
                                {Array.from({ length: receipts.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={pageUrl(page)}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${
                                            page === receipts.current_page
                                                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
                                                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                            </div>

                            <span className="sm:hidden text-sm text-[var(--color-text-secondary)]">
                                Page {receipts.current_page} of {receipts.last_page}
                            </span>

                            <Link
                                href={receipts.current_page < receipts.last_page ? pageUrl(receipts.current_page + 1) : '#'}
                                className={`p-1.5 rounded-lg ${
                                    receipts.current_page < receipts.last_page
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

function RowActions({ receipt }: { receipt: Receipt }) {
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
        router.delete(`/receipts/${receipt.id}`, { preserveScroll: true });
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
                        onClick={(e) => handleAction(e, () => router.visit(`/receipts/${receipt.id}`))}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    >
                        <EyeIcon className="h-4 w-4" />
                        View
                    </button>
                    <button
                        onClick={(e) => handleAction(e, () => window.open(`/receipts/${receipt.id}/download`, '_blank'))}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Download
                    </button>
                    {receipt.status !== 'processing' && (
                        <button
                            onClick={(e) => handleAction(e, () => router.post(`/receipts/${receipt.id}/retry-ai`, {}, { preserveScroll: true }))}
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

function ReceiptThumbnail({ receipt, size = 'sm' }: { receipt: Receipt; size?: 'sm' | 'lg' }) {
    const sizeClasses = size === 'lg' ? 'h-16 w-16' : 'h-10 w-10';
    const url = receipt.thumbnail_url || receipt.image_url;

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
            alt={receipt.merchant_name || 'Receipt'}
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
