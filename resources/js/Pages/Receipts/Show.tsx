import { useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card, CardTitle } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import ImageViewer from '@/Components/receipt/ImageViewer';
import { formatCurrency, getConfidenceColor, getConfidenceLabel } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS } from '@/types/models';
import type { Receipt, Category, LhdnTaxRelief } from '@/types/models';

interface Props {
    receipt: Receipt;
    categories: Category[];
    lhdnCategories: LhdnTaxRelief[];
}

// Format date for input[type=date] - handles "2026-03-11T00:00:00.000000Z" -> "2026-03-11"
function formatDateForInput(date: string | null | undefined): string {
    if (!date) return '';
    return date.substring(0, 10);
}

function getFormValues(receipt: Receipt) {
    return {
        merchant_name: receipt.merchant_name ?? '',
        total_amount: receipt.total_amount ?? '',
        tax_amount: receipt.tax_amount ?? '',
        subtotal_amount: receipt.subtotal_amount ?? '',
        purchase_date: formatDateForInput(receipt.purchase_date),
        payment_method: receipt.payment_method ?? '',
        receipt_number: receipt.receipt_number ?? '',
        notes: receipt.notes ?? '',
        status: receipt.status,
    };
}

export default function ReceiptShow({ receipt, categories, lhdnCategories }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm(getFormValues(receipt));

    // Update form when receipt data changes (e.g. after Retry AI, rotate, etc.)
    useEffect(() => {
        reset(getFormValues(receipt));
    }, [receipt.id, receipt.merchant_name, receipt.total_amount, receipt.status, receipt.purchase_date]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/receipts/${receipt.id}`);
    };

    const handleConfirm = () => {
        router.put(`/receipts/${receipt.id}`, { ...data, status: 'completed' });
    };

    const confidenceScore = receipt.ai_confidence_score ? parseFloat(receipt.ai_confidence_score) : null;

    return (
        <>
            <Head title={receipt.merchant_name || 'Receipt Details'} />
            <AppLayout>
                <TopBar
                    title={receipt.merchant_name || 'Receipt Details'}
                    subtitle={`Receipt #${receipt.id}`}
                />

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Image viewer with rotate/download/zoom */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle>Receipt Image</CardTitle>
                                {confidenceScore !== null && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--color-text-muted)]">AI Confidence:</span>
                                        <Badge variant={
                                            confidenceScore >= 0.8 ? 'success' :
                                            confidenceScore >= 0.5 ? 'warning' : 'error'
                                        }>
                                            {getConfidenceLabel(confidenceScore)} ({Math.round(confidenceScore * 100)}%)
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <ImageViewer
                                imageUrl={receipt.image_url ?? null}
                                receiptId={receipt.id}
                                merchantName={receipt.merchant_name}
                            />
                        </Card>

                        {/* Right: Edit form */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle>Receipt Details</CardTitle>
                                <Badge variant={
                                    receipt.status === 'completed' ? 'success' :
                                    receipt.status === 'review_needed' ? 'warning' :
                                    receipt.status === 'processing' ? 'info' :
                                    receipt.status === 'failed' ? 'error' : 'default'
                                }>
                                    {receipt.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    id="merchant_name"
                                    label="Merchant Name"
                                    value={data.merchant_name}
                                    onChange={(e) => setData('merchant_name', e.target.value)}
                                    error={errors.merchant_name}
                                    placeholder="e.g. Petronas, Tesco, Clinic ABC"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        id="total_amount"
                                        label="Total Amount (RM)"
                                        type="number"
                                        step="0.01"
                                        value={data.total_amount}
                                        onChange={(e) => setData('total_amount', e.target.value)}
                                        error={errors.total_amount}
                                    />
                                    <Input
                                        id="tax_amount"
                                        label="SST / Tax (RM)"
                                        type="number"
                                        step="0.01"
                                        value={data.tax_amount}
                                        onChange={(e) => setData('tax_amount', e.target.value)}
                                        error={errors.tax_amount}
                                    />
                                </div>

                                <Input
                                    id="purchase_date"
                                    label="Purchase Date"
                                    type="date"
                                    value={data.purchase_date}
                                    onChange={(e) => setData('purchase_date', e.target.value)}
                                    error={errors.purchase_date}
                                />

                                <Select
                                    id="payment_method"
                                    label="Payment Method"
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    options={Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                                    placeholder="Select payment method"
                                />

                                <Input
                                    id="receipt_number"
                                    label="Receipt / Invoice Number"
                                    value={data.receipt_number}
                                    onChange={(e) => setData('receipt_number', e.target.value)}
                                    error={errors.receipt_number}
                                />

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                        Notes
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-colors duration-150"
                                        placeholder="Add any notes..."
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--color-border)]">
                                    <Button type="submit" loading={processing}>
                                        Save Changes
                                    </Button>
                                    {receipt.status === 'review_needed' && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleConfirm}
                                            loading={processing}
                                        >
                                            Confirm & Complete
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => router.post(`/receipts/${receipt.id}/retry-ai`)}
                                    >
                                        Retry AI
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => {
                                            if (confirm('Delete this receipt?')) {
                                                router.delete(`/receipts/${receipt.id}`);
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
