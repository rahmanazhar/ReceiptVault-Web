import { useEffect, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card, CardTitle } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import HelpTooltip from '@/Components/ui/HelpTooltip';
import Modal from '@/Components/ui/Modal';
import ImageViewer from '@/Components/receipt/ImageViewer';
import { formatCurrency, getConfidenceColor, getConfidenceLabel } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS } from '@/types/models';
import {
    CheckIcon,
    CheckBadgeIcon,
    ArrowPathIcon,
    ArrowUturnLeftIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    TagIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import type { Receipt, Category, LhdnTaxRelief, ReceiptMetadata } from '@/types/models';

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
    // Get tax info from first transaction if available
    const tx = receipt.transactions?.[0];
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
        is_tax_deductible: tx?.is_tax_deductible ?? false,
        lhdn_category_code: tx?.lhdn_category_code ?? '',
    };
}

export default function ReceiptShow({ receipt, categories, lhdnCategories }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm(getFormValues(receipt));
    const [confirmModal, setConfirmModal] = useState<'complete' | 'retry' | 'delete' | null>(null);

    // Update form when receipt data changes (e.g. after Retry AI, rotate, etc.)
    useEffect(() => {
        reset(getFormValues(receipt));
    }, [receipt.id, receipt.merchant_name, receipt.total_amount, receipt.status, receipt.purchase_date]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/receipts/${receipt.id}`);
    };

    const handleSaveAndBack = () => {
        router.put(`/receipts/${receipt.id}`, data, {
            onSuccess: () => router.visit('/receipts'),
        });
    };

    const handleConfirm = () => {
        setConfirmModal(null);
        router.put(`/receipts/${receipt.id}`, { ...data, status: 'completed' }, {
            onSuccess: () => router.visit('/receipts'),
        });
    };

    const handleRetryAi = () => {
        setConfirmModal(null);
        router.post(`/receipts/${receipt.id}/retry-ai`);
    };

    const handleDelete = () => {
        setConfirmModal(null);
        router.delete(`/receipts/${receipt.id}`);
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
                                mimeType={receipt.mime_type}
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

                            <form onSubmit={handleSave} className="space-y-4">
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

                                {/* Tax Relief */}
                                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">LHDN Tax Relief</p>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newVal = !data.is_tax_deductible;
                                                setData(prev => ({
                                                    ...prev,
                                                    is_tax_deductible: newVal,
                                                    lhdn_category_code: newVal ? prev.lhdn_category_code : '',
                                                }));
                                            }}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                data.is_tax_deductible
                                                    ? 'bg-[var(--color-accent)]'
                                                    : 'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                                    data.is_tax_deductible ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                        <div className="flex items-center gap-1.5">
                                            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                                                Tax Relief Claimable
                                            </label>
                                            <HelpTooltip text="Mark this receipt as eligible for LHDN tax relief deduction" />
                                        </div>
                                    </div>

                                    {data.is_tax_deductible && (
                                        <Select
                                            id="lhdn_category_code"
                                            label="LHDN Relief Category"
                                            helpText="Select which LHDN tax relief category this receipt falls under"
                                            value={data.lhdn_category_code}
                                            onChange={(e) => setData('lhdn_category_code', e.target.value)}
                                            options={lhdnCategories
                                                .filter(c => c.is_active)
                                                .map(c => ({
                                                    value: c.code,
                                                    label: `${c.name}${c.parent_code ? ' (sub-limit)' : ''} — RM ${parseFloat(c.annual_limit).toLocaleString()}`,
                                                }))}
                                            placeholder="Select LHDN category"
                                        />
                                    )}
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
                                    <Button
                                        type="button"
                                        onClick={handleSaveAndBack}
                                        loading={processing}
                                        tooltip="Save changes and return to receipts list"
                                    >
                                        <ArrowUturnLeftIcon className="h-4 w-4 mr-1.5" />
                                        Save & Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        loading={processing}
                                        tooltip="Save your manual edits"
                                    >
                                        <CheckIcon className="h-4 w-4 mr-1.5" />
                                        Save
                                    </Button>
                                    {receipt.status !== 'completed' && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setConfirmModal('complete')}
                                            loading={processing}
                                            tooltip="Mark as verified and complete"
                                        >
                                            <CheckBadgeIcon className="h-4 w-4 mr-1.5" />
                                            Complete
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setConfirmModal('retry')}
                                        tooltip="Re-run AI extraction on image"
                                    >
                                        <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                                        Regenerate
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => setConfirmModal('delete')}
                                        tooltip="Permanently delete this receipt"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-1.5" />
                                        Delete
                                    </Button>
                                </div>
                            </form>

                            {/* Confirm Complete Modal */}
                            <Modal open={confirmModal === 'complete'} onClose={() => setConfirmModal(null)} title="Confirm & Complete" size="sm">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] flex-shrink-0">
                                        <CheckBadgeIcon className="h-5 w-5 text-[var(--color-accent)]" />
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        This will mark the receipt as verified and complete. The current form data will be saved.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="secondary" size="sm" onClick={() => setConfirmModal(null)}>Cancel</Button>
                                    <Button size="sm" onClick={handleConfirm}>
                                        <CheckBadgeIcon className="h-4 w-4 mr-1.5" />
                                        Complete
                                    </Button>
                                </div>
                            </Modal>

                            {/* Confirm Retry AI Modal */}
                            <Modal open={confirmModal === 'retry'} onClose={() => setConfirmModal(null)} title="Retry AI Processing" size="sm">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-warning-muted)] flex-shrink-0">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning)]" />
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        This will re-run AI extraction on the receipt image. Any unsaved manual edits will be overwritten with the new AI results.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="secondary" size="sm" onClick={() => setConfirmModal(null)}>Cancel</Button>
                                    <Button size="sm" onClick={handleRetryAi}>
                                        <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                                        Retry AI
                                    </Button>
                                </div>
                            </Modal>

                            {/* Confirm Delete Modal */}
                            <Modal open={confirmModal === 'delete'} onClose={() => setConfirmModal(null)} title="Delete Receipt" size="sm">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-error-muted)] flex-shrink-0">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-error)]" />
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        This will permanently delete this receipt and its associated transactions. This action cannot be undone.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="secondary" size="sm" onClick={() => setConfirmModal(null)}>Cancel</Button>
                                    <Button variant="danger" size="sm" onClick={handleDelete}>
                                        <TrashIcon className="h-4 w-4 mr-1.5" />
                                        Delete
                                    </Button>
                                </div>
                            </Modal>
                        </Card>
                    </div>

                    {/* AI Insights: Category, Tax, and Itemization */}
                    {receipt.metadata && <MetadataSection metadata={receipt.metadata} currency={receipt.currency} />}
                </div>
            </AppLayout>
        </>
    );
}

const CATEGORY_LABELS: Record<string, string> = {
    groceries: 'Groceries',
    dining: 'Dining',
    transportation: 'Transportation',
    healthcare: 'Healthcare',
    education: 'Education',
    shopping: 'Shopping',
    utilities: 'Utilities',
    entertainment: 'Entertainment',
    travel: 'Travel',
    services: 'Services',
    fuel: 'Fuel',
    other: 'Other',
};

function MetadataSection({ metadata, currency }: { metadata: ReceiptMetadata; currency: string }) {
    const items = metadata.items?.filter(i => i.name) ?? [];
    const hasItems = items.length > 0;
    const hasSummary = metadata.category || metadata.is_taxable !== null || metadata.description;

    if (!hasSummary && !hasItems) return null;

    return (
        <Card>
            <CardTitle>AI Insights</CardTitle>

            {/* Summary row: category, taxable, description */}
            {hasSummary && (
                <div className="flex flex-wrap items-center gap-3 mt-3">
                    {metadata.category && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-xs font-medium px-2.5 py-1">
                            <TagIcon className="h-3.5 w-3.5" />
                            {CATEGORY_LABELS[metadata.category] ?? metadata.category}
                        </span>
                    )}
                    {metadata.is_taxable !== null && (
                        <span className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-1 ${
                            metadata.is_taxable
                                ? 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]'
                                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                        }`}>
                            {metadata.is_taxable
                                ? <><ShieldExclamationIcon className="h-3.5 w-3.5" /> Taxable{metadata.tax_type ? ` (${metadata.tax_type.replace('_', ' ').toUpperCase()})` : ''}</>
                                : <><ShieldCheckIcon className="h-3.5 w-3.5" /> Non-taxable</>
                            }
                        </span>
                    )}
                    {metadata.description && (
                        <p className="text-sm text-[var(--color-text-secondary)]">{metadata.description}</p>
                    )}
                </div>
            )}

            {/* Itemization table */}
            {hasItems && (
                <div className="mt-4 border border-[var(--color-border)] rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[var(--color-bg-tertiary)]">
                                <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-2">Item</th>
                                <th className="text-center text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-2 w-20">Qty</th>
                                <th className="text-right text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-2 w-28">Unit Price</th>
                                <th className="text-right text-xs font-medium text-[var(--color-text-muted)] uppercase px-4 py-2 w-28">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i} className="border-t border-[var(--color-border)]">
                                    <td className="px-4 py-2 text-sm text-[var(--color-text-primary)]">{item.name}</td>
                                    <td className="px-4 py-2 text-sm text-center text-[var(--color-text-secondary)]">{item.quantity}</td>
                                    <td className="px-4 py-2 text-sm text-right text-[var(--color-text-secondary)]">
                                        {item.unit_price != null ? formatCurrency(String(item.unit_price), currency) : '—'}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-right font-medium text-[var(--color-text-primary)]">
                                        {item.total != null ? formatCurrency(String(item.total), currency) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
