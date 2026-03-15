import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import EmptyState from '@/Components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import type { Receipt, PaginatedResponse } from '@/types/models';

interface Props {
    receipts: PaginatedResponse<Receipt>;
}

export default function ReceiptsIndex({ receipts }: Props) {
    const statusVariant = (status: string) => {
        switch (status) {
            case 'completed': return 'success' as const;
            case 'review_needed': return 'warning' as const;
            case 'processing': return 'info' as const;
            case 'failed': return 'error' as const;
            default: return 'default' as const;
        }
    };

    return (
        <>
            <Head title="Receipts" />
            <AppLayout>
                <TopBar title="Receipts" subtitle={`${receipts.total} total`} action={{ label: 'Upload Receipt', href: '/receipts/create' }} />

                <div className="p-6">
                    {receipts.data.length === 0 ? (
                        <EmptyState
                            icon={<DocumentTextIcon className="h-12 w-12" />}
                            title="No receipts yet"
                            description="Upload your first receipt to start tracking your expenses and tax deductions."
                            action={{ label: 'Upload Receipt', onClick: () => window.location.href = '/receipts/create' }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {receipts.data.map((receipt) => (
                                <Link key={receipt.id} href={`/receipts/${receipt.id}`}>
                                    <Card hover className="h-full">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-[var(--color-text-primary)] truncate">
                                                    {receipt.merchant_name || 'Unknown Merchant'}
                                                </p>
                                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                                    {receipt.purchase_date ? formatDate(receipt.purchase_date) : 'No date'}
                                                </p>
                                            </div>
                                            <Badge variant={statusVariant(receipt.status)}>
                                                {receipt.status.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-xl font-bold text-[var(--color-text-primary)]">
                                                    {formatCurrency(receipt.total_amount)}
                                                </p>
                                                {receipt.payment_method && (
                                                    <p className="text-xs text-[var(--color-text-muted)] mt-1 capitalize">
                                                        {receipt.payment_method.replace('_', ' ')}
                                                    </p>
                                                )}
                                            </div>
                                            {receipt.ai_confidence_score && (
                                                <div className="text-xs text-[var(--color-text-muted)]">
                                                    AI: {Math.round(parseFloat(receipt.ai_confidence_score) * 100)}%
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {receipts.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {Array.from({ length: receipts.last_page }, (_, i) => i + 1).map((page) => (
                                <Link
                                    key={page}
                                    href={`/receipts?page=${page}`}
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
                    )}
                </div>
            </AppLayout>
        </>
    );
}
