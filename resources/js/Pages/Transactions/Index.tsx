import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Select from '@/Components/ui/Select';
import EmptyState from '@/Components/ui/EmptyState';
import Tooltip from '@/Components/ui/Tooltip';
import HelpTooltip from '@/Components/ui/HelpTooltip';
import SortHeader from '@/Components/ui/SortHeader';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BanknotesIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { Transaction, Category, PaginatedResponse } from '@/types/models';

interface Props {
    transactions: PaginatedResponse<Transaction>;
    categories: Category[];
    lhdnCategories: Record<string, string>;
    filters: Record<string, string>;
    sorting: { sort_by: string; sort_dir: 'asc' | 'desc' };
}

export default function TransactionsIndex({ transactions, categories, lhdnCategories, filters, sorting }: Props) {
    const handleSort = (column: string) => {
        const newDir = sorting.sort_by === column && sorting.sort_dir === 'asc' ? 'desc' : 'asc';
        router.get('/transactions', { ...filters, sort_by: column, sort_dir: newDir }, { preserveState: true, preserveScroll: true });
    };
    return (
        <>
            <Head title="Transactions" />
            <AppLayout>
                <TopBar title="Transactions" subtitle={`${transactions.total} total`} />

                <div className="p-4 sm:p-6">
                    {/* Filters */}
                    <Card className="mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="w-full sm:w-48">
                                <Select
                                    options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                                    placeholder="All categories"
                                    value={filters.category_id || ''}
                                    onChange={(e) => router.get('/transactions', { ...filters, category_id: e.target.value || undefined }, { preserveState: true })}
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <Select
                                    options={[
                                        { value: 'yes', label: 'Tax Claimable' },
                                        { value: 'no', label: 'Not Claimable' },
                                    ]}
                                    placeholder="All (tax status)"
                                    value={filters.tax_deductible || ''}
                                    onChange={(e) => router.get('/transactions', { ...filters, tax_deductible: e.target.value || undefined }, { preserveState: true })}
                                />
                            </div>
                            <div className="flex flex-1 gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                                        <CalendarIcon className="h-3.5 w-3.5 inline mr-1" />
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.date_from || ''}
                                        onChange={(e) => router.get('/transactions', { ...filters, date_from: e.target.value || undefined }, { preserveState: true })}
                                        className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
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
                                        onChange={(e) => router.get('/transactions', { ...filters, date_to: e.target.value || undefined }, { preserveState: true })}
                                        className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                                    />
                                </div>
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
                        <>
                            {/* Desktop table */}
                            <Card className="overflow-hidden !p-0 hidden md:block">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)]">
                                            <SortHeader column="description" label="Description" sorting={sorting} onSort={handleSort} />
                                            <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-3">Category</th>
                                            <SortHeader column="transaction_date" label="Date" sorting={sorting} onSort={handleSort} />
                                            <SortHeader column="amount" label="Amount" sorting={sorting} onSort={handleSort} align="right" />
                                            <SortHeader column="is_tax_deductible" label="Tax" sorting={sorting} onSort={handleSort} align="center" />
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
                                                    <TaxStatusCell tx={tx} lhdnCategories={lhdnCategories} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>

                            {/* Mobile card view */}
                            <div className="md:hidden space-y-3">
                                {transactions.data.map((tx) => (
                                    <Card key={tx.id} hover={!!tx.receipt_id}>
                                        {tx.receipt_id ? (
                                            <Link href={`/receipts/${tx.receipt_id}`} className="block">
                                                <MobileTransactionCard tx={tx} lhdnCategories={lhdnCategories} />
                                            </Link>
                                        ) : (
                                            <MobileTransactionCard tx={tx} lhdnCategories={lhdnCategories} />
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </AppLayout>
        </>
    );
}

function TaxStatusCell({ tx, lhdnCategories }: { tx: Transaction; lhdnCategories: Record<string, string> }) {
    if (tx.is_tax_deductible) {
        return (
            <div className="flex flex-col items-center gap-1">
                <Tooltip content="This transaction qualifies for LHDN tax relief" position="left">
                    <Badge variant="success">Claimable</Badge>
                </Tooltip>
                {tx.lhdn_category_code && lhdnCategories[tx.lhdn_category_code] && (
                    <span className="text-xs text-[var(--color-text-muted)] max-w-[120px] truncate">
                        {lhdnCategories[tx.lhdn_category_code]}
                    </span>
                )}
            </div>
        );
    }

    return (
        <Badge variant="default">Not Claimable</Badge>
    );
}

function MobileTransactionCard({ tx, lhdnCategories }: { tx: Transaction; lhdnCategories: Record<string, string> }) {
    return (
        <div>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{tx.description}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{formatDate(tx.transaction_date)}</p>
                </div>
                <p className="text-sm font-bold text-[var(--color-text-primary)] ml-3">{formatCurrency(tx.amount)}</p>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    {tx.category ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            {tx.category.color && (
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tx.category.color }} />
                            )}
                            {tx.category.name}
                        </span>
                    ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">Uncategorized</span>
                    )}
                </div>
                <div className="flex flex-col items-end gap-0.5">
                    {tx.is_tax_deductible ? (
                        <>
                            <Badge variant="success">Claimable</Badge>
                            {tx.lhdn_category_code && lhdnCategories[tx.lhdn_category_code] && (
                                <span className="text-[10px] text-[var(--color-text-muted)] max-w-[100px] truncate">
                                    {lhdnCategories[tx.lhdn_category_code]}
                                </span>
                            )}
                        </>
                    ) : (
                        <Badge variant="default">Not Claimable</Badge>
                    )}
                </div>
            </div>
        </div>
    );
}
