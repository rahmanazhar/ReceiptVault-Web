import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import MedicalCertificateUploader from '@/Components/medical-certificate/MedicalCertificateUploader';

export default function MedicalCertificatesCreate() {
    return (
        <>
            <Head title="Upload Medical Certificate" />
            <AppLayout>
                <TopBar title="Upload Medical Certificate" subtitle="Capture, scan, or upload a medical certificate" />
                <div className="p-6 max-w-2xl mx-auto">
                    <MedicalCertificateUploader />
                </div>
            </AppLayout>
        </>
    );
}
