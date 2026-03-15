import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import ReceiptUploader from '@/Components/receipt/ReceiptUploader';

export default function ReceiptsCreate() {
    return (
        <>
            <Head title="Upload Receipt" />
            <AppLayout>
                <TopBar title="Upload Receipt" subtitle="Capture, scan, or upload a receipt" />
                <div className="p-6 max-w-2xl mx-auto">
                    <ReceiptUploader />
                </div>
            </AppLayout>
        </>
    );
}
