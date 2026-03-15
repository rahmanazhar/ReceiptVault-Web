import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card, CardTitle } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction, LhdnTaxRelief } from '@/types/models';

interface Props {
    year: number;
    groupedTransactions: Record<string, Transaction[]>;
    lhdnCategories: Record<string, LhdnTaxRelief>;
}

export default function TaxReport({ year, groupedTransactions, lhdnCategories }: Props) {
    return (
        <>
            <Head title={`Tax Report ${year}`} />
            <AppLayout>
                <TopBar
                    title={`Tax Report ${year}`}
                    subtitle="LHDN Tax Relief Summary"
                />

                <div className="p-6 space-y-6">
                    <div className="flex justify-end">
                        <Button variant="secondary" size="sm" onClick={() => window.print()}>
                            Print Report
                        </Button>
                    </div>

                    {Object.keys(groupedTransactions).length === 0 ? (
                        <Card>
                            <p className="text-center text-[var(--color-text-muted)] py-8">
                                No tax-deductible transactions found for {year}.
                            </p>
                        </Card>
                    ) : (
                        Object.entries(groupedTransactions).map(([code, transactions]) => {
                            const category = lhdnCategories[code];
                            const total = transactions.reduce((sum, tx) => sum + parseFloat(tx.tax_relief_amount || tx.amount), 0);

                            return (
                                <Card key={code}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <CardTitle>{category?.name || code}</CardTitle>
                                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                                {category?.description}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-[var(--color-accent)]">
                                                {formatCurrency(total)}
                                            </p>
                                            {category && (
                                                <p className="text-xs text-[var(--color-text-muted)]">
                                                    Limit: {formatCurrency(category.annual_limit)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-[var(--color-border)]">
                                                <th className="text-left text-xs text-[var(--color-text-muted)] py-2">Date</th>
                                                <th className="text-left text-xs text-[var(--color-text-muted)] py-2">Description</th>
                                                <th className="text-right text-xs text-[var(--color-text-muted)] py-2">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((tx) => (
                                                <tr key={tx.id} className="border-b border-[var(--color-border)] last:border-0">
                                                    <td className="py-2 text-[var(--color-text-secondary)]">
                                                        {formatDate(tx.transaction_date)}
                                                    </td>
                                                    <td className="py-2 text-[var(--color-text-primary)]">
                                                        {tx.description}
                                                    </td>
                                                    <td className="py-2 text-right text-[var(--color-text-primary)] font-medium">
                                                        {formatCurrency(tx.tax_relief_amount || tx.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t border-[var(--color-border)]">
                                                <td colSpan={2} className="py-2 text-[var(--color-text-muted)] font-medium">
                                                    Subtotal ({transactions.length} items)
                                                </td>
                                                <td className="py-2 text-right font-bold text-[var(--color-text-primary)]">
                                                    {formatCurrency(total)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </Card>
                            );
                        })
                    )}
                </div>
            </AppLayout>
        </>
    );
}
