import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card, CardTitle } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PrinterIcon } from '@heroicons/react/24/outline';
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

                <div className="p-4 sm:p-6 space-y-6">
                    <div className="flex justify-end no-print">
                        <Button variant="secondary" size="sm" onClick={() => window.print()} tooltip="Print this tax report">
                            <PrinterIcon className="h-4 w-4 mr-1.5" />
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

                                    <div className="overflow-x-auto -mx-4 sm:-mx-6">
                                        <div className="min-w-full px-4 sm:px-6">
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
                                                            <td className="py-2 text-[var(--color-text-secondary)] whitespace-nowrap">
                                                                {formatDate(tx.transaction_date)}
                                                            </td>
                                                            <td className="py-2 text-[var(--color-text-primary)]">
                                                                {tx.description}
                                                            </td>
                                                            <td className="py-2 text-right text-[var(--color-text-primary)] font-medium whitespace-nowrap">
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
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </AppLayout>
        </>
    );
}
