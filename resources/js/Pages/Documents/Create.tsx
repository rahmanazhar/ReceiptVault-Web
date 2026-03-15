import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import DocumentUploader from '@/Components/document/DocumentUploader';

export default function DocumentsCreate() {
    return (
        <>
            <Head title="Upload Document" />
            <AppLayout>
                <TopBar title="Upload Document" subtitle="Capture, scan, or upload an important document" />
                <div className="p-6 max-w-2xl mx-auto">
                    <DocumentUploader />
                </div>
            </AppLayout>
        </>
    );
}
