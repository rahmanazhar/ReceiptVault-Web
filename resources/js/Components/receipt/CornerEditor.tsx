import { useState, useRef, useEffect, useCallback } from 'react';
import Button from '@/Components/ui/Button';
import { waitForOpenCv, canvasToBlob, loadImageToCanvas } from '@/lib/imageProcessing';

type Point = { x: number; y: number };
type Corners = {
    topLeftCorner: Point;
    topRightCorner: Point;
    bottomLeftCorner: Point;
    bottomRightCorner: Point;
};

interface Props {
    file: File;
    onConfirm: (blob: Blob) => void;
    onCancel: () => void;
}

export default function CornerEditor({ file, onConfirm, onCancel }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [corners, setCorners] = useState<Corners | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [cvReady, setCvReady] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
    const [displayScale, setDisplayScale] = useState(1);

    useEffect(() => { waitForOpenCv(30000).then(setCvReady); }, []);

    // Load image and auto-detect corners
    useEffect(() => {
        if (!cvReady) return;

        const img = new Image();
        img.onload = () => {
            setImgEl(img);
            setImageLoaded(true);

            // Auto-detect corners using jscanify
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.naturalWidth;
            tempCanvas.height = img.naturalHeight;
            tempCanvas.getContext('2d')!.drawImage(img, 0, 0);

            const scanner = new jscanify();
            const src = cv.imread(tempCanvas);
            const contour = scanner.findPaperContour(src);

            if (contour) {
                const detected = scanner.getCornerPoints(contour);
                if (detected.topLeftCorner && detected.topRightCorner &&
                    detected.bottomLeftCorner && detected.bottomRightCorner) {
                    setCorners(detected as Corners);
                } else {
                    setDefaultCorners(img.naturalWidth, img.naturalHeight);
                }
            } else {
                setDefaultCorners(img.naturalWidth, img.naturalHeight);
            }
            src.delete();
        };
        img.src = URL.createObjectURL(file);

        return () => URL.revokeObjectURL(img.src);
    }, [file, cvReady]);

    const setDefaultCorners = (w: number, h: number) => {
        const margin = Math.min(w, h) * 0.05;
        setCorners({
            topLeftCorner: { x: margin, y: margin },
            topRightCorner: { x: w - margin, y: margin },
            bottomLeftCorner: { x: margin, y: h - margin },
            bottomRightCorner: { x: w - margin, y: h - margin },
        });
    };

    // Calculate display scale (image scaled to fit container)
    useEffect(() => {
        if (!imgEl || !containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth;
        setDisplayScale(containerWidth / imgEl.naturalWidth);
    }, [imgEl]);

    const getCornerKey = (key: string) => key as keyof Corners;

    const handlePointerDown = (key: string) => (e: React.PointerEvent) => {
        e.preventDefault();
        setDragging(key);
    };

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragging || !containerRef.current || !imgEl) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(imgEl.naturalWidth, (e.clientX - rect.left) / displayScale));
        const y = Math.max(0, Math.min(imgEl.naturalHeight, (e.clientY - rect.top) / displayScale));

        setCorners(prev => prev ? { ...prev, [getCornerKey(dragging)]: { x: Math.round(x), y: Math.round(y) } } : prev);
    }, [dragging, displayScale, imgEl]);

    const handlePointerUp = () => setDragging(null);

    const handleCrop = async () => {
        if (!corners || !imgEl || !cvReady) return;
        setProcessing(true);

        try {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imgEl.naturalWidth;
            tempCanvas.height = imgEl.naturalHeight;
            tempCanvas.getContext('2d')!.drawImage(imgEl, 0, 0);

            const scanner = new jscanify();

            // Calculate output dimensions from corners
            const { topLeftCorner: tl, topRightCorner: tr,
                    bottomLeftCorner: bl, bottomRightCorner: br } = corners;

            const w = Math.round(Math.max(
                Math.hypot(tr.x - tl.x, tr.y - tl.y),
                Math.hypot(br.x - bl.x, br.y - bl.y)
            ));
            const h = Math.round(Math.max(
                Math.hypot(bl.x - tl.x, bl.y - tl.y),
                Math.hypot(br.x - tr.x, br.y - tr.y)
            ));

            const extracted = scanner.extractPaper(tempCanvas, w, h, corners);

            if (extracted) {
                const blob = await canvasToBlob(extracted, 'image/png', 1);
                onConfirm(blob);
            } else {
                // Fallback: upload original
                const blob = await canvasToBlob(tempCanvas, 'image/png', 1);
                onConfirm(blob);
            }
        } catch (err) {
            console.error('Crop failed:', err);
        } finally {
            setProcessing(false);
        }
    };

    if (!cvReady || !imageLoaded || !corners) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 mx-auto text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">Detecting document...</p>
                </div>
            </div>
        );
    }

    const cornerEntries: [string, string][] = [
        ['topLeftCorner', 'TL'],
        ['topRightCorner', 'TR'],
        ['bottomLeftCorner', 'BL'],
        ['bottomRightCorner', 'BR'],
    ];

    return (
        <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
                Drag the corner points to adjust the crop area
            </p>

            {/* Image with draggable corners */}
            <div
                ref={containerRef}
                className="relative rounded-lg overflow-hidden bg-[var(--color-bg-tertiary)] select-none touch-none"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {imgEl && (
                    <img
                        src={imgEl.src}
                        alt="Receipt"
                        className="w-full h-auto"
                        draggable={false}
                    />
                )}

                {/* Overlay polygon */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox={imgEl ? `0 0 ${imgEl.naturalWidth} ${imgEl.naturalHeight}` : '0 0 100 100'}
                >
                    {/* Semi-transparent mask outside the selection */}
                    <defs>
                        <mask id="cropMask">
                            <rect width="100%" height="100%" fill="white" />
                            <polygon
                                points={`${corners.topLeftCorner.x},${corners.topLeftCorner.y} ${corners.topRightCorner.x},${corners.topRightCorner.y} ${corners.bottomRightCorner.x},${corners.bottomRightCorner.y} ${corners.bottomLeftCorner.x},${corners.bottomLeftCorner.y}`}
                                fill="black"
                            />
                        </mask>
                    </defs>
                    <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#cropMask)" />

                    {/* Selection border */}
                    <polygon
                        points={`${corners.topLeftCorner.x},${corners.topLeftCorner.y} ${corners.topRightCorner.x},${corners.topRightCorner.y} ${corners.bottomRightCorner.x},${corners.bottomRightCorner.y} ${corners.bottomLeftCorner.x},${corners.bottomLeftCorner.y}`}
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth={3 / displayScale}
                    />
                </svg>

                {/* Draggable corner handles */}
                {cornerEntries.map(([key]) => {
                    const point = corners[key as keyof Corners];
                    const size = 20;
                    return (
                        <div
                            key={key}
                            onPointerDown={handlePointerDown(key)}
                            className="absolute rounded-full bg-[var(--color-accent)] border-2 border-white shadow-lg cursor-grab active:cursor-grabbing"
                            style={{
                                width: size,
                                height: size,
                                left: point.x * displayScale - size / 2,
                                top: point.y * displayScale - size / 2,
                                touchAction: 'none',
                            }}
                        />
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button onClick={handleCrop} loading={processing} className="flex-1">
                    Crop & Upload
                </Button>
                <Button variant="ghost" onClick={onCancel}>
                    Skip Crop
                </Button>
            </div>
        </div>
    );
}
