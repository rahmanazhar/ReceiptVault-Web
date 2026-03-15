import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '@/Components/ui/Button';
import {
    loadImageToCanvas,
    enhanceReceipt,
    adjustBrightnessContrast,
    canvasToBlob,
    canvasToDataUrl,
    grayscale,
    contrastStretch,
    sharpen,
} from '@/lib/imageProcessing';

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
    const [mode, setMode] = useState<'auto' | 'enhanced' | 'bw'>('auto');

    const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const processImage = useCallback(async (currentMode: string) => {
        if (!originalCanvasRef.current) return;
        setProcessing(true);

        try {
            const source = originalCanvasRef.current;

            let result: HTMLCanvasElement;

            if (currentMode === 'auto') {
                // Full enhancement pipeline: crop + grayscale + threshold + sharpen
                result = enhanceReceipt(source, { crop: true, threshold: true, sharpenAmount: 0.5 });
            } else if (currentMode === 'enhanced') {
                // Lighter enhancement: grayscale + contrast + sharpen (no thresholding)
                result = document.createElement('canvas');
                result.width = source.width;
                result.height = source.height;
                result.getContext('2d')!.drawImage(source, 0, 0);
                result = grayscale(result);
                result = contrastStretch(result);
                result = adjustBrightnessContrast(result, 10, 30);
                result = sharpen(result, 0.3);
            } else {
                // B&W: just grayscale + contrast
                result = document.createElement('canvas');
                result.width = source.width;
                result.height = source.height;
                result.getContext('2d')!.drawImage(source, 0, 0);
                result = grayscale(result);
                result = contrastStretch(result);
            }

            processedCanvasRef.current = result;
            setProcessedUrl(canvasToDataUrl(result));
        } catch (err) {
            console.error('Image processing failed:', err);
        } finally {
            setProcessing(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const canvas = await loadImageToCanvas(file);
                if (cancelled) return;

                originalCanvasRef.current = canvas;
                setOriginalUrl(canvasToDataUrl(canvas));

                await processImage('auto');
            } catch (err) {
                console.error('Failed to load image:', err);
                setProcessing(false);
            }
        })();

        return () => { cancelled = true; };
    }, [file, processImage]);

    useEffect(() => {
        if (originalCanvasRef.current) {
            processImage(mode);
        }
    }, [mode, processImage]);

    const handleConfirm = async () => {
        if (!processedCanvasRef.current) return;
        const blob = await canvasToBlob(processedCanvasRef.current);
        onConfirm(blob, processedUrl);
    };

    const displayUrl = showOriginal ? originalUrl : processedUrl;

    return (
        <div className="space-y-4">
            {/* Mode selector */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">Enhancement:</span>
                {(['auto', 'enhanced', 'bw'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            mode === m
                                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
                                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
                    >
                        {m === 'auto' ? 'Scan Mode' : m === 'enhanced' ? 'Enhanced' : 'B&W'}
                    </button>
                ))}
            </div>

            {/* Image preview */}
            <div className="relative rounded-lg overflow-hidden bg-[var(--color-bg-tertiary)]">
                {processing ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <svg className="animate-spin h-8 w-8 mx-auto text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Processing image...</p>
                        </div>
                    </div>
                ) : displayUrl ? (
                    <img src={displayUrl} alt="Receipt" className="w-full max-h-96 object-contain" />
                ) : null}

                {/* Original/Processed toggle */}
                {!processing && originalUrl && processedUrl && (
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
                <Button onClick={handleConfirm} disabled={processing} className="flex-1">
                    Upload Processed
                </Button>
                <Button variant="secondary" onClick={onUseOriginal}>
                    Use Original
                </Button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)] text-center">
                Image is auto-enhanced for better text readability. No information is changed.
            </p>
        </div>
    );
}
