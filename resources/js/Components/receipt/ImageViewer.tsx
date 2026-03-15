import { useState, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { downloadFromUrl, waitForOpenCv, canvasToBlob } from '@/lib/imageProcessing';
import {
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
    ArrowsPointingOutIcon,
    ScissorsIcon,
} from '@heroicons/react/24/outline';
import Tooltip from '@/Components/ui/Tooltip';
import HelpTooltip from '@/Components/ui/HelpTooltip';
import CornerEditor from './CornerEditor';

type EnhanceMode = 'original' | 'enhanced' | 'scan';

interface Props {
    imageUrl: string | null;
    receiptId: number;
    merchantName?: string | null;
    mimeType?: string | null;
    routePrefix?: string;
    documentLabel?: string;
}

export default function ImageViewer({ imageUrl, receiptId, merchantName, mimeType, routePrefix = '/receipts', documentLabel = 'Receipt' }: Props) {
    const isPdf = mimeType === 'application/pdf' || /\.pdf(\?|$)/i.test(imageUrl ?? '');
    const [zoom, setZoom] = useState(1);
    const [rotating, setRotating] = useState(false);
    const [enhance, setEnhance] = useState<EnhanceMode>('original');
    const [cropping, setCropping] = useState(false);
    const [cropFile, setCropFile] = useState<File | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleRotate = (degrees: number) => {
        setRotating(true);
        router.post(`${routePrefix}/${receiptId}/rotate`, { degrees }, {
            preserveScroll: true,
            onSuccess: () => setRotating(false),
            onError: () => setRotating(false),
        });
    };

    const handleZoomIn = () => setZoom(Math.min(zoom + 0.25, 3));
    const handleZoomOut = () => setZoom(Math.max(zoom - 0.25, 0.5));
    const handleZoomReset = () => setZoom(1);

    const handleDownload = () => {
        if (!imageUrl) return;
        downloadFromUrl(imageUrl, `${documentLabel.toLowerCase().replace(/\s+/g, '-')}-${merchantName?.replace(/\s+/g, '_') || receiptId}.jpg`);
    };

    const handleStartCrop = useCallback(async () => {
        if (!imageUrl) return;
        // Fetch the current image as a File for the CornerEditor
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `document-${receiptId}.png`, { type: blob.type });
        setCropFile(file);
        setCropping(true);
    }, [imageUrl, receiptId]);

    const handleCropConfirm = (blob: Blob) => {
        // Upload the cropped image to replace the current one
        const formData = new FormData();
        formData.append('image', blob, `document-${receiptId}-cropped.png`);
        router.post(`${routePrefix}/${receiptId}/recrop`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { setCropping(false); setCropFile(null); },
            onError: () => { setCropping(false); setCropFile(null); },
        });
    };

    const handleCropCancel = () => {
        setCropping(false);
        setCropFile(null);
    };

    const filterStyle = enhance === 'enhanced'
        ? 'grayscale(100%) contrast(1.4) brightness(1.1)'
        : enhance === 'scan'
            ? 'grayscale(100%) contrast(2.5) brightness(1.3)'
            : 'none';

    if (!imageUrl) {
        return (
            <div className="flex items-center justify-center h-64 rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">
                No image available
            </div>
        );
    }

    // Crop mode - show CornerEditor
    if (cropping && cropFile) {
        return (
            <CornerEditor
                file={cropFile}
                onConfirm={handleCropConfirm}
                onCancel={handleCropCancel}
            />
        );
    }

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                    {!isPdf && (
                        <>
                            <ToolButton icon={<ArrowUturnLeftIcon className="h-4 w-4" />} label="Rotate left 90°" onClick={() => handleRotate(-90)} disabled={rotating} />
                            <ToolButton icon={<ArrowUturnRightIcon className="h-4 w-4" />} label="Rotate right 90°" onClick={() => handleRotate(90)} disabled={rotating} />
                            <div className="w-px h-5 bg-[var(--color-border)] mx-1 hidden sm:block" />
                        </>
                    )}
                    {!isPdf && (
                        <>
                            <ToolButton icon={<MagnifyingGlassPlusIcon className="h-4 w-4" />} label="Zoom in" onClick={handleZoomIn} />
                            <ToolButton icon={<MagnifyingGlassMinusIcon className="h-4 w-4" />} label="Zoom out" onClick={handleZoomOut} />
                            <ToolButton icon={<ArrowsPointingOutIcon className="h-4 w-4" />} label="Reset zoom" onClick={handleZoomReset} />
                            <div className="w-px h-5 bg-[var(--color-border)] mx-1 hidden sm:block" />
                            <ToolButton icon={<ScissorsIcon className="h-4 w-4" />} label="Crop & Flatten" onClick={handleStartCrop} accent />
                        </>
                    )}
                </div>
                <ToolButton icon={<ArrowDownTrayIcon className="h-4 w-4" />} label={isPdf ? "Download PDF" : "Download image"} onClick={handleDownload} accent />
            </div>

            {/* Enhancement modes (images only) */}
            {!isPdf && (
                <div className="flex items-center gap-2">
                    {(['original', 'enhanced', 'scan'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setEnhance(mode)}
                            className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-xs font-medium transition-colors ${
                                enhance === mode
                                    ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
                                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                            {mode === 'original' ? 'Original' : mode === 'enhanced' ? 'Enhanced' : 'Scan'}
                        </button>
                    ))}
                    <HelpTooltip text="Original: unmodified image. Enhanced: high-contrast B&W for readability. Scan: sharp threshold for OCR." />
                </div>
            )}

            {/* PDF viewer or Image */}
            {isPdf ? (
                <div className="rounded-lg overflow-hidden border border-[var(--color-border)]" style={{ height: '600px' }}>
                    <iframe
                        src={imageUrl}
                        className="w-full h-full"
                        title={`${documentLabel} PDF`}
                    />
                </div>
            ) : (
                <div ref={containerRef} className="relative rounded-lg bg-[var(--color-bg-tertiary)] overflow-auto" style={{ maxHeight: '500px' }}>
                    <img
                        src={imageUrl}
                        alt={documentLabel}
                        className="w-full h-auto object-contain select-none transition-all duration-300"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', filter: filterStyle }}
                        draggable={false}
                    />
                    {zoom !== 1 && (
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">{Math.round(zoom * 100)}%</div>
                    )}
                    {rotating && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ToolButton({ icon, label, onClick, disabled, accent }: {
    icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; accent?: boolean;
}) {
    return (
        <Tooltip content={label} position="top">
            <button onClick={onClick} disabled={disabled}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    accent ? 'text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                }`}
            >
                {icon}
            </button>
        </Tooltip>
    );
}
