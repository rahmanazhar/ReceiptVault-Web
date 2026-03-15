import { useState, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import CameraCapture from './CameraCapture';
import {
    CloudArrowUpIcon,
    CameraIcon,
    DocumentIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type Tab = 'upload' | 'camera' | 'scan';

export default function ReceiptUploader() {
    const [activeTab, setActiveTab] = useState<Tab>('upload');
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const f = acceptedFiles[0];
        if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/pdf': ['.pdf'],
        },
        maxSize: 10 * 1024 * 1024,
        multiple: false,
    });

    const handleCameraCapture = (blob: Blob) => {
        const capturedFile = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setFile(capturedFile);
        setPreview(URL.createObjectURL(capturedFile));
        setActiveTab('upload'); // Switch to preview
    };

    const handleUpload = () => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('source', activeTab === 'camera' ? 'camera' : activeTab === 'scan' ? 'scan' : 'upload');

        router.post('/receipts', formData, {
            forceFormData: true,
            onFinish: () => setUploading(false),
        });
    };

    const clearSelection = () => {
        setFile(null);
        setPreview(null);
    };

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'upload', label: 'Upload', icon: <CloudArrowUpIcon className="h-5 w-5" /> },
        { key: 'camera', label: 'Camera', icon: <CameraIcon className="h-5 w-5" /> },
        { key: 'scan', label: 'Scan', icon: <DocumentIcon className="h-5 w-5" /> },
    ];

    return (
        <Card>
            {/* Tabs */}
            <div className="flex border-b border-[var(--color-border)] -mx-6 -mt-6 mb-6 px-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); clearSelection(); }}
                        className={cn(
                            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                            activeTab === tab.key
                                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Preview mode */}
            {preview && file ? (
                <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-[var(--color-bg-tertiary)]">
                        {file.type === 'application/pdf' ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <DocumentIcon className="h-12 w-12 mx-auto text-[var(--color-text-muted)]" />
                                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{file.name}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                        ) : (
                            <img src={preview} alt="Preview" className="w-full max-h-96 object-contain" />
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleUpload} loading={uploading} className="flex-1">
                            Upload & Process with AI
                        </Button>
                        <Button variant="secondary" onClick={clearSelection}>
                            Clear
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Upload tab */}
                    {activeTab === 'upload' && (
                        <div
                            {...getRootProps()}
                            className={cn(
                                'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors',
                                isDragActive
                                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                                    : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-tertiary)]'
                            )}
                        >
                            <input {...getInputProps()} />
                            <CloudArrowUpIcon className="h-12 w-12 mx-auto text-[var(--color-text-muted)]" />
                            <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                                {isDragActive ? 'Drop your receipt here' : 'Drag & drop your receipt, or click to browse'}
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                Supports JPEG, PNG, PDF (max 10MB)
                            </p>
                        </div>
                    )}

                    {/* Camera tab */}
                    {(activeTab === 'camera' || activeTab === 'scan') && (
                        <CameraCapture
                            onCapture={handleCameraCapture}
                            scanMode={activeTab === 'scan'}
                        />
                    )}
                </>
            )}
        </Card>
    );
}
