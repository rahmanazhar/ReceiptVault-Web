import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '@/Components/ui/Button';
import {
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
} from '@heroicons/react/24/outline';
import {
    loadImageToCanvas,
    extractDocument,
    canvasToBlob,
    canvasToDataUrl,
    grayscale,
    contrastStretch,
    rotateImage,
    waitForOpenCv,
} from '@/lib/imageProcessing';

function cloneCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    copy.getContext('2d')!.drawImage(canvas, 0, 0);
    return copy;
}

interface Props {
    file: File | Blob;
    onConfirm: (processedBlob: Blob, previewUrl: string) => void;
    onUseOriginal: () => void;
}

export default function ImageProcessor({ file, onConfirm, onUseOriginal }: Props) {
    const [originalUrl, setOriginalUrl] = useState<string>('');
    const [processedUrl, setProcessedUrl] = useState<string>('');
    const [showOriginal, setShowOriginal] = useState(false);
    const [processing, setProcessing] = useState(true);
    const [cvReady, setCvReady] = useState(false);
    const [cvLoading, setCvLoading] = useState(true);
    const [mode, setMode] = useState<'auto' | 'enhanced' | 'bw'>('auto');
    const [rotation, setRotation] = useState(0);

    const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Wait for OpenCV.js to load
    useEffect(() => {
        setCvLoading(true);
        waitForOpenCv(20000).then((ready) => {
            setCvReady(ready);
            setCvLoading(false);
        });
    }, []);

    const processImage = useCallback(async (currentMode: string, currentRotation: number) => {
        if (!originalCanvasRef.current) return;
        setProcessing(true);

        // Let UI update before heavy processing
        await new Promise(resolve => requestAnimationFrame(resolve));

        try {
            const source = originalCanvasRef.current;
            let result: HTMLCanvasElement;

            if (currentMode === 'auto') {
                // Pure jscanify extraction only - no filters
                result = await extractDocument(source);
            } else if (currentMode === 'enhanced') {
                // Extract + grayscale + contrast
                result = await extractDocument(source);
                const copy = cloneCanvas(result);
                grayscale(copy);
                contrastStretch(copy);
                result = copy;
            } else {
                // Extract + grayscale only
                result = await extractDocument(source);
                const copy = cloneCanvas(result);
                grayscale(copy);
                result = copy;
            }

            // Apply manual rotation
            if (currentRotation !== 0) {
                result = rotateImage(result, currentRotation);
            }

            processedCanvasRef.current = result;
            setProcessedUrl(canvasToDataUrl(result));
        } catch (err) {
            console.error('Image processing failed:', err);
        } finally {
            setProcessing(false);
        }
    }, []);

    // Load image on mount
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const canvas = await loadImageToCanvas(file);
                if (cancelled) return;
                originalCanvasRef.current = canvas;
                setOriginalUrl(canvasToDataUrl(canvas));

                // Wait for OpenCV before processing
                if (!cvReady) {
                    const ready = await waitForOpenCv(20000);
                    if (cancelled) return;
                    setCvReady(ready);
                    setCvLoading(false);
                }

                await processImage('auto', 0);
            } catch (err) {
                console.error('Failed to load image:', err);
                setProcessing(false);
            }
        })();
        return () => { cancelled = true; };
    }, [file]);

    // Re-process when mode or rotation changes (after initial load)
    useEffect(() => {
        if (originalCanvasRef.current && !cvLoading) {
            processImage(mode, rotation);
        }
    }, [mode, rotation, cvReady]);

    const handleConfirm = async () => {
        if (!processedCanvasRef.current) return;
        const blob = await canvasToBlob(processedCanvasRef.current);
        onConfirm(blob, processedUrl);
    };

    const handleRotateLeft = () => setRotation(prev => (prev - 90 + 360) % 360);
    const handleRotateRight = () => setRotation(prev => (prev + 90) % 360);

    const displayUrl = showOriginal ? originalUrl : processedUrl;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-muted)]">Mode:</span>
                    {(['auto', 'enhanced', 'bw'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            disabled={processing}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                                mode === m
                                    ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
                                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                            {m === 'auto' ? 'Scan' : m === 'enhanced' ? 'Enhanced' : 'B&W'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-xs text-[var(--color-text-muted)] mr-1">Rotate:</span>
                    <button
                        onClick={handleRotateLeft}
                        disabled={processing}
                        title="Rotate left 90°"
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
                    >
                        <ArrowUturnLeftIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleRotateRight}
                        disabled={processing}
                        title="Rotate right 90°"
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
                    >
                        <ArrowUturnRightIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Image preview */}
            <div className="relative rounded-lg overflow-hidden bg-[var(--color-bg-tertiary)]">
                {processing || cvLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <svg className="animate-spin h-8 w-8 mx-auto text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                                {cvLoading && !cvReady ? 'Loading scanner engine...' : 'Scanning document...'}
                            </p>
                        </div>
                    </div>
                ) : displayUrl ? (
                    <img src={displayUrl} alt="Receipt" className="w-full max-h-96 object-contain" />
                ) : null}

                {/* Toggle button */}
                {!processing && !cvLoading && originalUrl && processedUrl && (
                    <button
                        onClick={() => setShowOriginal(!showOriginal)}
                        className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
                    >
                        {showOriginal ? 'Show Processed' : 'Show Original'}
                    </button>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button onClick={handleConfirm} disabled={processing || cvLoading} className="flex-1">
                    Upload Processed
                </Button>
                <Button variant="secondary" onClick={onUseOriginal}>
                    Use Original
                </Button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)] text-center">
                Powered by OpenCV. Extracts only the paper, removes background, and straightens.
            </p>
        </div>
    );
}
