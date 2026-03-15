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
import type { MedicalCertificate } from '@/types/models';

interface Props {
    medicalCertificate: MedicalCertificate;
}

function formatDateForInput(date: string | null | undefined): string {
    if (!date) return '';
    return date.substring(0, 10);
}

function getFormValues(mc: MedicalCertificate) {
    return {
        patient_name: mc.patient_name ?? '',
        doctor_name: mc.doctor_name ?? '',
        clinic_name: mc.clinic_name ?? '',
        diagnosis: mc.diagnosis ?? '',
        mc_start_date: formatDateForInput(mc.mc_start_date),
        mc_end_date: formatDateForInput(mc.mc_end_date),
        mc_days: mc.mc_days?.toString() ?? '',
        mc_number: mc.mc_number ?? '',
        issue_date: formatDateForInput(mc.issue_date),
        doctor_reg_number: mc.doctor_reg_number ?? '',
        notes: mc.notes ?? '',
        status: mc.status,
    };
}

export default function MedicalCertificateShow({ medicalCertificate: mc }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm(getFormValues(mc));

    useEffect(() => {
        reset(getFormValues(mc));
    }, [mc.id, mc.patient_name, mc.clinic_name, mc.status, mc.mc_start_date]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/medical-certificates/${mc.id}`);
    };

    const handleConfirm = () => {
        router.put(`/medical-certificates/${mc.id}`, { ...data, status: 'completed' }, {
            onSuccess: () => router.visit('/medical-certificates'),
        });
    };

    const confidenceScore = mc.ai_confidence_score ? parseFloat(mc.ai_confidence_score) : null;

    return (
        <>
            <Head title={mc.patient_name || 'Medical Certificate Details'} />
            <AppLayout>
                <TopBar
                    title={mc.patient_name || 'Medical Certificate Details'}
                    subtitle={`MC #${mc.id}`}
                />

                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Image viewer */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle>Certificate Image</CardTitle>
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
                                imageUrl={mc.image_url ?? null}
                                receiptId={mc.id}
                                merchantName={mc.patient_name}
                                mimeType={mc.mime_type}
                                routePrefix="/medical-certificates"
                                documentLabel="Medical Certificate"
                            />
                        </Card>

                        {/* Right: Edit form */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle>Certificate Details</CardTitle>
                                <Badge variant={
                                    mc.status === 'completed' ? 'success' :
                                    mc.status === 'review_needed' ? 'warning' :
                                    mc.status === 'processing' ? 'info' :
                                    mc.status === 'failed' ? 'error' : 'default'
                                }>
                                    {mc.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Patient Info */}
                                <div className="space-y-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Patient Info</p>
                                    <Input
                                        id="patient_name"
                                        label="Patient Name"
                                        helpText="Full name as shown on the certificate"
                                        value={data.patient_name}
                                        onChange={(e) => setData('patient_name', e.target.value)}
                                        error={errors.patient_name}
                                        placeholder="e.g. Ahmad bin Abdullah"
                                    />
                                </div>

                                {/* Medical Details */}
                                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Medical Details</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            id="doctor_name"
                                            label="Doctor Name"
                                            helpText="Attending doctor's name"
                                            value={data.doctor_name}
                                            onChange={(e) => setData('doctor_name', e.target.value)}
                                            error={errors.doctor_name}
                                            placeholder="e.g. Dr. Tan Wei Ming"
                                        />
                                        <Input
                                            id="doctor_reg_number"
                                            label="Doctor Reg. Number"
                                            helpText="MMC or license number"
                                            value={data.doctor_reg_number}
                                            onChange={(e) => setData('doctor_reg_number', e.target.value)}
                                            error={errors.doctor_reg_number}
                                            placeholder="e.g. MMC 12345"
                                        />
                                    </div>
                                    <Input
                                        id="clinic_name"
                                        label="Clinic / Hospital"
                                        helpText="Name of the medical facility"
                                        value={data.clinic_name}
                                        onChange={(e) => setData('clinic_name', e.target.value)}
                                        error={errors.clinic_name}
                                        placeholder="e.g. Klinik Kesihatan Taman Melati"
                                    />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                                Diagnosis
                                            </label>
                                            <HelpTooltip text="Medical condition or reason for the MC" />
                                        </div>
                                        <textarea
                                            value={data.diagnosis}
                                            onChange={(e) => setData('diagnosis', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-colors duration-150"
                                            placeholder="e.g. Upper respiratory tract infection"
                                        />
                                    </div>
                                </div>

                                {/* MC Period */}
                                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">MC Period</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            id="mc_start_date"
                                            label="Start Date"
                                            helpText="First day of medical leave"
                                            type="date"
                                            value={data.mc_start_date}
                                            onChange={(e) => setData('mc_start_date', e.target.value)}
                                            error={errors.mc_start_date}
                                        />
                                        <Input
                                            id="mc_end_date"
                                            label="End Date"
                                            helpText="Last day of medical leave"
                                            type="date"
                                            value={data.mc_end_date}
                                            onChange={(e) => setData('mc_end_date', e.target.value)}
                                            error={errors.mc_end_date}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <Input
                                            id="mc_days"
                                            label="MC Days"
                                            helpText="Total days of leave"
                                            type="number"
                                            min="0"
                                            value={data.mc_days}
                                            onChange={(e) => setData('mc_days', e.target.value)}
                                            error={errors.mc_days}
                                        />
                                        <Input
                                            id="mc_number"
                                            label="MC Number"
                                            helpText="Certificate serial number"
                                            value={data.mc_number}
                                            onChange={(e) => setData('mc_number', e.target.value)}
                                            error={errors.mc_number}
                                        />
                                        <Input
                                            id="issue_date"
                                            label="Issue Date"
                                            helpText="Date the MC was issued"
                                            type="date"
                                            value={data.issue_date}
                                            onChange={(e) => setData('issue_date', e.target.value)}
                                            error={errors.issue_date}
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
                                            <HelpTooltip text="Any additional notes about this medical certificate" />
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
                                    {mc.status === 'review_needed' && (
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
                                        onClick={() => router.post(`/medical-certificates/${mc.id}/retry-ai`)}
                                        tooltip="Re-run AI extraction on image"
                                    >
                                        <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                                        Retry AI
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => {
                                            if (confirm('Delete this medical certificate?')) {
                                                router.delete(`/medical-certificates/${mc.id}`);
                                            }
                                        }}
                                        tooltip="Permanently delete this medical certificate"
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
