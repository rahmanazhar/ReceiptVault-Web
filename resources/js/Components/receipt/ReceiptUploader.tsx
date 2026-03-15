import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import CameraCapture from './CameraCapture';
import ImageProcessor from './ImageProcessor';
import {
    CloudArrowUpIcon,
    CameraIcon,
    DocumentIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type Tab = 'upload' | 'camera' | 'scan';
type Stage = 'select' | 'process' | 'uploading';

export default function ReceiptUploader() {
    const [activeTab, setActiveTab] = useState<Tab>('upload');
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [stage, setStage] = useState<Stage>('select');
    const [sourceTab, setSourceTab] = useState<Tab>('upload');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const f = acceptedFiles[0];
        if (f) {
            setRawFile(f);
            setSourceTab('upload');
            // PDFs skip processing, go straight to upload
            if (f.type === 'application/pdf') {
                uploadFile(f, 'upload');
            } else {
                setStage('process');
            }
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
        setRawFile(capturedFile);
        setSourceTab(activeTab);
        setStage('process');
    };

    const uploadFile = (file: File | Blob, source: string) => {
        setStage('uploading');

        const formData = new FormData();
        formData.append('image', file, file instanceof File ? file.name : `receipt-${Date.now()}.jpg`);
        formData.append('source', source);

        router.post('/receipts', formData, {
            forceFormData: true,
            onFinish: () => setStage('select'),
        });
    };

    const handleProcessedConfirm = (processedBlob: Blob) => {
        const source = sourceTab === 'camera' ? 'camera' : sourceTab === 'scan' ? 'scan' : 'upload';
        uploadFile(processedBlob, source);
    };

    const handleUseOriginal = () => {
        if (!rawFile) return;
        const source = sourceTab === 'camera' ? 'camera' : sourceTab === 'scan' ? 'scan' : 'upload';
        uploadFile(rawFile, source);
    };

    const clearSelection = () => {
        setRawFile(null);
        setStage('select');
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

            {/* Stage: Processing - auto-enhance before upload */}
            {stage === 'process' && rawFile && (
                <ImageProcessor
                    file={rawFile}
                    onConfirm={handleProcessedConfirm}
                    onUseOriginal={handleUseOriginal}
                />
            )}

            {/* Stage: Uploading */}
            {stage === 'uploading' && (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 mx-auto text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Uploading receipt...</p>
                        <p className="text-xs text-[var(--color-text-muted)]">AI will process it automatically</p>
                    </div>
                </div>
            )}

            {/* Stage: Selection */}
            {stage === 'select' && (
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
                                Supports JPEG, PNG, PDF (max 10MB). Images are auto-enhanced.
                            </p>
                        </div>
                    )}

                    {/* Camera / Scan tab */}
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
