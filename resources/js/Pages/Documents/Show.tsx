import { useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card, CardTitle } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import HelpTooltip from '@/Components/ui/HelpTooltip';
import ImageViewer from '@/Components/receipt/ImageViewer';
import { getConfidenceColor, getConfidenceLabel } from '@/lib/utils';
import {
    CheckIcon,
    CheckBadgeIcon,
    ArrowPathIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import type { Document, DocumentType } from '@/types/models';
import { DOCUMENT_TYPE_LABELS } from '@/types/models';

interface Props {
    document: Document;
}

function formatDateForInput(date: string | null | undefined): string {
    if (!date) return '';
    return date.substring(0, 10);
}

function getFormValues(doc: Document) {
    return {
        document_type: doc.document_type ?? '',
        title: doc.title ?? '',
        sender: doc.sender ?? '',
        recipient: doc.recipient ?? '',
        reference_number: doc.reference_number ?? '',
        issue_date: formatDateForInput(doc.issue_date),
        expiry_date: formatDateForInput(doc.expiry_date),
        description: doc.description ?? '',
        notes: doc.notes ?? '',
        status: doc.status,
    };
}

export default function DocumentShow({ document: doc }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm(getFormValues(doc));

    useEffect(() => {
        reset(getFormValues(doc));
    }, [doc.id, doc.title, doc.sender, doc.status, doc.issue_date]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/documents/${doc.id}`);
    };

    const handleConfirm = () => {
        router.put(`/documents/${doc.id}`, { ...data, status: 'completed' }, {
            onSuccess: () => router.visit('/documents'),
        });
    };

    const confidenceScore = doc.ai_confidence_score ? parseFloat(doc.ai_confidence_score) : null;

    return (
        <>
            <Head title={doc.title || 'Document Details'} />
            <AppLayout>
                <TopBar
                    title={doc.title || 'Document Details'}
                    subtitle={`Document #${doc.id}`}
                />

                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Image viewer */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle>Document Image</CardTitle>
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
                                imageUrl={doc.image_url ?? null}
                                receiptId={doc.id}
                                merchantName={doc.title}
                                mimeType={doc.mime_type}
                                routePrefix="/documents"
                                documentLabel="Document"
                            />
                        </Card>

                        {/* Right: Edit form */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle>Document Details</CardTitle>
                                <Badge variant={
                                    doc.status === 'completed' ? 'success' :
                                    doc.status === 'review_needed' ? 'warning' :
                                    doc.status === 'processing' ? 'info' :
                                    doc.status === 'failed' ? 'error' : 'default'
                                }>
                                    {doc.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Document Info */}
                                <div className="space-y-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Document Info</p>
                                    <Input
                                        id="title"
                                        label="Title"
                                        helpText="Document title or subject line"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        error={errors.title}
                                        placeholder="e.g. Traffic Summons - AES"
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                                    Document Type
                                                </label>
                                                <HelpTooltip text="Category of this document" />
                                            </div>
                                            <select
                                                value={data.document_type}
                                                onChange={(e) => setData('document_type', e.target.value)}
                                                className="w-full rounded-lg px-3 py-2 text-sm appearance-none bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-colors duration-150"
                                            >
                                                <option value="">Select type...</option>
                                                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Input
                                            id="reference_number"
                                            label="Reference Number"
                                            helpText="Any reference, case, or ID number"
                                            value={data.reference_number}
                                            onChange={(e) => setData('reference_number', e.target.value)}
                                            error={errors.reference_number}
                                            placeholder="e.g. SUM-2026-12345"
                                        />
                                    </div>
                                </div>

                                {/* Parties */}
                                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Parties</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            id="sender"
                                            label="Sender / Issuer"
                                            helpText="Who sent or issued this document"
                                            value={data.sender}
                                            onChange={(e) => setData('sender', e.target.value)}
                                            error={errors.sender}
                                            placeholder="e.g. JPJ Malaysia"
                                        />
                                        <Input
                                            id="recipient"
                                            label="Recipient"
                                            helpText="Who this document is addressed to"
                                            value={data.recipient}
                                            onChange={(e) => setData('recipient', e.target.value)}
                                            error={errors.recipient}
                                            placeholder="e.g. Ahmad bin Abdullah"
                                        />
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Dates</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            id="issue_date"
                                            label="Issue Date"
                                            helpText="When the document was issued"
                                            type="date"
                                            value={data.issue_date}
                                            onChange={(e) => setData('issue_date', e.target.value)}
                                            error={errors.issue_date}
                                        />
                                        <Input
                                            id="expiry_date"
                                            label="Expiry Date"
                                            helpText="When the document expires (if applicable)"
                                            type="date"
                                            value={data.expiry_date}
                                            onChange={(e) => setData('expiry_date', e.target.value)}
                                            error={errors.expiry_date}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                                Description
                                            </label>
                                            <HelpTooltip text="AI-generated summary of the document content" />
                                        </div>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-colors duration-150"
                                            placeholder="Brief summary of the document..."
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                                Notes
                                            </label>
                                            <HelpTooltip text="Any additional notes about this document" />
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
                                    {doc.status === 'review_needed' && (
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
                                        onClick={() => router.post(`/documents/${doc.id}/retry-ai`)}
                                        tooltip="Re-run AI extraction on image"
                                    >
                                        <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                                        Retry AI
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => {
                                            if (confirm('Delete this document?')) {
                                                router.delete(`/documents/${doc.id}`);
                                            }
                                        }}
                                        tooltip="Permanently delete this document"
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
