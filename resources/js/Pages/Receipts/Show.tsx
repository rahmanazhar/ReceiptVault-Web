import { useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card, CardTitle } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import HelpTooltip from '@/Components/ui/HelpTooltip';
import ImageViewer from '@/Components/receipt/ImageViewer';
import { formatCurrency, getConfidenceColor, getConfidenceLabel } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS } from '@/types/models';
import {
    CheckIcon,
    CheckBadgeIcon,
    ArrowPathIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
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

                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Image viewer with rotate/download/zoom */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle>Receipt Image</CardTitle>
                                {confidenceScore !== null && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">AI Confidence:</span>
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
                                {/* Transaction Info */}
                                <div className="space-y-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Transaction Info</p>
                                    <Input
                                        id="merchant_name"
                                        label="Merchant Name"
                                        helpText="Store or business name on the receipt"
                                        value={data.merchant_name}
                                        onChange={(e) => setData('merchant_name', e.target.value)}
                                        error={errors.merchant_name}
                                        placeholder="e.g. Petronas, Tesco, Clinic ABC"
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            id="purchase_date"
                                            label="Purchase Date"
                                            helpText="Date the purchase was made"
                                            type="date"
                                            value={data.purchase_date}
                                            onChange={(e) => setData('purchase_date', e.target.value)}
                                            error={errors.purchase_date}
                                        />
                                        <Input
                                            id="receipt_number"
                                            label="Receipt / Invoice Number"
                                            helpText="Reference number printed on the receipt"
                                            value={data.receipt_number}
                                            onChange={(e) => setData('receipt_number', e.target.value)}
                                            error={errors.receipt_number}
                                        />
                                    </div>
                                </div>

                                {/* Amounts */}
                                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Amounts</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            id="total_amount"
                                            label="Total Amount (RM)"
                                            helpText="Final total including SST/tax"
                                            type="number"
                                            step="0.01"
                                            value={data.total_amount}
                                            onChange={(e) => setData('total_amount', e.target.value)}
                                            error={errors.total_amount}
                                        />
                                        <Input
                                            id="tax_amount"
                                            label="SST / Tax (RM)"
                                            helpText="Sales and Service Tax amount, if shown"
                                            type="number"
                                            step="0.01"
                                            value={data.tax_amount}
                                            onChange={(e) => setData('tax_amount', e.target.value)}
                                            error={errors.tax_amount}
                                        />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Details</p>
                                    <Select
                                        id="payment_method"
                                        label="Payment Method"
                                        helpText="How the purchase was paid"
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        options={Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                                        placeholder="Select payment method"
                                    />

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                                Notes
                                            </label>
                                            <HelpTooltip text="Any additional notes about this receipt" />
                                        </div>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-colors duration-150"
                                            placeholder="Add any notes..."
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-4 border-t border-[var(--color-border)]">
                                    <Button type="submit" loading={processing} tooltip="Save your manual edits">
                                        <CheckIcon className="h-4 w-4 mr-1.5" />
                                        Save Changes
                                    </Button>
                                    {receipt.status === 'review_needed' && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleConfirm}
                                            loading={processing}
                                            tooltip="Mark as verified and complete"
                                        >
                                            <CheckBadgeIcon className="h-4 w-4 mr-1.5" />
                                            Confirm & Complete
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => router.post(`/receipts/${receipt.id}/retry-ai`)}
                                        tooltip="Re-run AI extraction on image"
                                    >
                                        <ArrowPathIcon className="h-4 w-4 mr-1.5" />
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
                                        tooltip="Permanently delete this receipt"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-1.5" />
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
