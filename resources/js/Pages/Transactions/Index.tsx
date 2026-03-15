import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Select from '@/Components/ui/Select';
import EmptyState from '@/Components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import type { Transaction, Category, PaginatedResponse } from '@/types/models';

interface Props {
    transactions: PaginatedResponse<Transaction>;
    categories: Category[];
    filters: Record<string, string>;
}

export default function TransactionsIndex({ transactions, categories, filters }: Props) {
    return (
        <>
            <Head title="Transactions" />
            <AppLayout>
                <TopBar title="Transactions" subtitle={`${transactions.total} total`} />

                <div className="p-6">
                    {/* Filters */}
                    <Card className="mb-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="w-48">
                                <Select
                                    options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                                    placeholder="All categories"
                                    value={filters.category_id || ''}
                                    onChange={(e) => router.get('/transactions', { ...filters, category_id: e.target.value || undefined }, { preserveState: true })}
                                />
                            </div>
                            <div>
                                <input
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => router.get('/transactions', { ...filters, date_from: e.target.value || undefined }, { preserveState: true })}
                                    className="rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                                    placeholder="From"
                                />
                            </div>
                            <div>
                                <input
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => router.get('/transactions', { ...filters, date_to: e.target.value || undefined }, { preserveState: true })}
                                    className="rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                                    placeholder="To"
                                />
                            </div>
                        </div>
                    </Card>

                    {transactions.data.length === 0 ? (
                        <EmptyState
                            icon={<BanknotesIcon className="h-12 w-12" />}
                            title="No transactions yet"
                            description="Transactions are created automatically when you upload and process receipts."
                        />
                    ) : (
                        <Card className="overflow-hidden !p-0">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)]">
                                        <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-3">Description</th>
                                        <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-3">Category</th>
                                        <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-3">Date</th>
                                        <th className="text-right text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-3">Amount</th>
                                        <th className="text-center text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-3">Tax</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-[var(--color-text-primary)]">{tx.description}</p>
                                                {tx.receipt_id && (
                                                    <Link href={`/receipts/${tx.receipt_id}`} className="text-xs text-[var(--color-accent)] hover:underline">
                                                        View receipt
                                                    </Link>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {tx.category ? (
                                                    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                                                        {tx.category.color && (
                                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tx.category.color }} />
                                                        )}
                                                        {tx.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-[var(--color-text-muted)]">Uncategorized</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                                {formatDate(tx.transaction_date)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-[var(--color-text-primary)]">
                                                {formatCurrency(tx.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {tx.is_tax_deductible && (
                                                    <Badge variant="success">Claimable</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
