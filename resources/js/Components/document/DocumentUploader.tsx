import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/Components/ui/Card';
import CameraCapture from '@/Components/receipt/CameraCapture';
import CornerEditor from '@/Components/receipt/CornerEditor';
import {
    CloudArrowUpIcon,
    CameraIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type Tab = 'upload' | 'camera';
type Stage = 'select' | 'crop' | 'uploading';

export default function DocumentUploader() {
    const [activeTab, setActiveTab] = useState<Tab>('upload');
    const [stage, setStage] = useState<Stage>('select');
    const [cropFile, setCropFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const f = acceptedFiles[0];
        if (f) {
            if (f.type === 'application/pdf') {
                uploadFile(f, 'upload');
            } else {
                setCropFile(f);
                setStage('crop');
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
        uploadFile(blob, 'camera');
    };

    const handleCameraAdjustCrop = (file: File) => {
        setCropFile(file);
        setStage('crop');
    };

    const handleCropConfirm = (blob: Blob) => {
        uploadFile(blob, cropFile ? 'upload' : 'camera');
    };

    const handleSkipCrop = () => {
        if (cropFile) uploadFile(cropFile, 'upload');
    };

    const uploadFile = (file: File | Blob, source: string) => {
        setStage('uploading');
        const formData = new FormData();
        formData.append('image', file, file instanceof File ? file.name : `document-${Date.now()}.png`);
        formData.append('source', source);
        router.post('/documents', formData, {
            forceFormData: true,
            onFinish: () => { setStage('select'); setCropFile(null); },
        });
    };

    const clearSelection = () => {
        setStage('select');
        setCropFile(null);
    };

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'upload', label: 'Upload', icon: <CloudArrowUpIcon className="h-5 w-5" /> },
        { key: 'camera', label: 'Camera', icon: <CameraIcon className="h-5 w-5" /> },
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

            {/* Crop stage */}
            {stage === 'crop' && cropFile && (
                <CornerEditor
                    file={cropFile}
                    onConfirm={handleCropConfirm}
                    onCancel={handleSkipCrop}
                />
            )}

            {/* Uploading */}
            {stage === 'uploading' && (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 mx-auto text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Uploading document...</p>
                        <p className="text-xs text-[var(--color-text-muted)]">AI will process it automatically</p>
                    </div>
                </div>
            )}

            {/* Selection */}
            {stage === 'select' && (
                <>
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
                                {isDragActive ? 'Drop your document here' : 'Drag & drop your document, or click to browse'}
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                Supports JPEG, PNG, PDF (max 10MB)
                            </p>
                        </div>
                    )}

                    {activeTab === 'camera' && (
                        <CameraCapture
                            onCapture={handleCameraCapture}
                            onAdjustCrop={handleCameraAdjustCrop}
                        />
                    )}
                </>
            )}
        </Card>
    );
}
