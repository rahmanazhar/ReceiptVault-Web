import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { downloadFromUrl } from '@/lib/imageProcessing';
import {
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
    ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';

type EnhanceMode = 'original' | 'enhanced' | 'scan';

interface Props {
    imageUrl: string | null;
    receiptId: number;
    merchantName?: string | null;
}

export default function ImageViewer({ imageUrl, receiptId, merchantName }: Props) {
    const [zoom, setZoom] = useState(1);
    const [rotating, setRotating] = useState(false);
    const [enhance, setEnhance] = useState<EnhanceMode>('original');
    const containerRef = useRef<HTMLDivElement>(null);

    const handleRotate = (degrees: number) => {
        setRotating(true);
        router.post(`/receipts/${receiptId}/rotate`, { degrees }, {
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
        downloadFromUrl(imageUrl, `receipt-${merchantName?.replace(/\s+/g, '_') || receiptId}.jpg`);
    };

    // CSS filters for enhancement modes
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

    return (
        <div className="space-y-3">
            {/* Toolbar row 1: rotate, zoom, download */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <ToolButton
                        icon={<ArrowUturnLeftIcon className="h-4 w-4" />}
                        label="Rotate left"
                        onClick={() => handleRotate(-90)}
                        disabled={rotating}
                    />
                    <ToolButton
                        icon={<ArrowUturnRightIcon className="h-4 w-4" />}
                        label="Rotate right"
                        onClick={() => handleRotate(90)}
                        disabled={rotating}
                    />
                    <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
                    <ToolButton
                        icon={<MagnifyingGlassPlusIcon className="h-4 w-4" />}
                        label="Zoom in"
                        onClick={handleZoomIn}
                    />
                    <ToolButton
                        icon={<MagnifyingGlassMinusIcon className="h-4 w-4" />}
                        label="Zoom out"
                        onClick={handleZoomOut}
                    />
                    <ToolButton
                        icon={<ArrowsPointingOutIcon className="h-4 w-4" />}
                        label="Reset zoom"
                        onClick={handleZoomReset}
                    />
                </div>

                <ToolButton
                    icon={<ArrowDownTrayIcon className="h-4 w-4" />}
                    label="Download"
                    onClick={handleDownload}
                    accent
                />
            </div>

            {/* Toolbar row 2: enhancement modes */}
            <div className="flex items-center gap-2">
                {(['original', 'enhanced', 'scan'] as const).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setEnhance(mode)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            enhance === mode
                                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
                                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
                    >
                        {mode === 'original' ? 'Original' : mode === 'enhanced' ? 'Enhanced' : 'Scan'}
                    </button>
                ))}
            </div>

            {/* Image */}
            <div
                ref={containerRef}
                className="relative rounded-lg bg-[var(--color-bg-tertiary)] overflow-auto"
                style={{ maxHeight: '500px' }}
            >
                <img
                    src={imageUrl}
                    alt="Receipt"
                    className="w-full h-auto object-contain select-none transition-all duration-300"
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center',
                        filter: filterStyle,
                    }}
                    draggable={false}
                />

                {zoom !== 1 && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {Math.round(zoom * 100)}%
                    </div>
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
        </div>
    );
}

function ToolButton({ icon, label, onClick, disabled, accent }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    accent?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={label}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                accent
                    ? 'text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
            }`}
        >
            {icon}
        </button>
    );
}
