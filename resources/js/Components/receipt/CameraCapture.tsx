import { useState, useRef, useEffect, useCallback } from 'react';
import Button from '@/Components/ui/Button';
import { CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { waitForOpenCv, canvasToBlob } from '@/lib/imageProcessing';

interface Props {
    onCapture: (blob: Blob) => void;
    scanMode?: boolean;
}

export default function CameraCapture({ onCapture, scanMode = false }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const resultCanvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [cvReady, setCvReady] = useState(false);
    const [captured, setCaptured] = useState<HTMLCanvasElement | null>(null);
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);

    useEffect(() => { waitForOpenCv(30000).then(setCvReady); }, []);
    useEffect(() => { startCamera(); return () => stopCamera(); }, [facingMode]);
    useEffect(() => {
        if (hasPermission && cvReady && !captured) startHighlighting();
        return () => stopHighlighting();
    }, [hasPermission, cvReady, captured]);

    const startCamera = async () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
            });
            streamRef.current = stream;
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
            setHasPermission(true);
        } catch { setHasPermission(false); }
    };

    const stopCamera = () => {
        stopHighlighting();
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    };

    const startHighlighting = () => {
        stopHighlighting();
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const resultCanvas = resultCanvasRef.current;
        if (!video || !canvas || !resultCanvas || !cvReady) return;

        const scanner = new jscanify();
        let dimensionsSet = false;

        const loop = () => {
            if (!videoRef.current) return;
            if (video.readyState >= video.HAVE_ENOUGH_DATA) {
                if (!dimensionsSet && video.videoWidth > 0) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    resultCanvas.width = video.videoWidth;
                    resultCanvas.height = video.videoHeight;
                    dimensionsSet = true;
                }
                if (dimensionsSet) {
                    canvas.getContext('2d')!.drawImage(video, 0, 0);
                    try {
                        const highlighted = scanner.highlightPaper(canvas);
                        resultCanvas.getContext('2d')!.drawImage(highlighted, 0, 0);
                    } catch {
                        resultCanvas.getContext('2d')!.drawImage(video, 0, 0);
                    }
                }
            }
            animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);
    };

    const stopHighlighting = () => {
        if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    };

    const handleCapture = useCallback(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video || !cvReady) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')!.drawImage(video, 0, 0);

        const scanner = new jscanify();

        // Get corners to calculate correct paper dimensions
        const src = cv.imread(canvas);
        const contour = scanner.findPaperContour(src);
        src.delete();

        let extracted: HTMLCanvasElement | null = null;

        if (contour) {
            const corners = scanner.getCornerPoints(contour);
            const { topLeftCorner: tl, topRightCorner: tr,
                    bottomLeftCorner: bl, bottomRightCorner: br } = corners;

            if (tl && tr && bl && br) {
                // Use actual paper dimensions so aspect ratio is preserved
                const w = Math.round(Math.max(
                    Math.hypot(tr.x - tl.x, tr.y - tl.y),
                    Math.hypot(br.x - bl.x, br.y - bl.y)
                ));
                const h = Math.round(Math.max(
                    Math.hypot(bl.x - tl.x, bl.y - tl.y),
                    Math.hypot(br.x - tr.x, br.y - tr.y)
                ));
                extracted = scanner.extractPaper(canvas, w, h, corners);
            }
        }

        if (!extracted) {
            extracted = scanner.extractPaper(canvas, canvas.width, canvas.height);
        }

        const result = extracted || canvas;
        setCaptured(result);
        setCapturedUrl(result.toDataURL('image/png'));
        stopHighlighting();
    }, [cvReady]);

    const handleConfirm = useCallback(async () => {
        if (!captured) return;
        const blob = await canvasToBlob(captured, 'image/png', 1);
        onCapture(blob);
    }, [captured, onCapture]);

    const handleRetake = () => {
        setCaptured(null);
        setCapturedUrl(null);
    };

    const toggleCamera = () => setFacingMode(prev => prev === 'user' ? 'environment' : 'user');

    if (hasPermission === false) {
        return (
            <div className="rounded-xl bg-[var(--color-bg-tertiary)] p-8 text-center">
                <CameraIcon className="h-12 w-12 mx-auto text-[var(--color-text-muted)]" />
                <p className="mt-4 text-sm text-[var(--color-text-secondary)]">Camera access denied</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Allow camera access or use the upload tab.</p>
            </div>
        );
    }

    if (captured && capturedUrl) {
        return (
            <div className="space-y-4">
                <div className="rounded-lg overflow-hidden bg-[var(--color-bg-tertiary)]">
                    <img src={capturedUrl} alt="Captured" className="w-full h-auto" />
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleConfirm} className="flex-1">Use this photo</Button>
                    <Button variant="secondary" onClick={handleRetake}>Retake</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <canvas ref={resultCanvasRef} className="w-full" style={{ minHeight: '300px' }} />

                {!cvReady && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="animate-spin h-8 w-8 mx-auto text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="mt-2 text-sm text-white">Loading scanner...</p>
                        </div>
                    </div>
                )}

                <button onClick={toggleCamera}
                    className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors">
                    <ArrowPathIcon className="h-5 w-5" />
                </button>
            </div>

            <Button onClick={handleCapture} disabled={!cvReady} className="w-full">
                <CameraIcon className="h-5 w-5 mr-2" />
                {scanMode ? 'Scan Document' : 'Capture'}
            </Button>

            {cvReady && (
                <p className="text-xs text-[var(--color-text-muted)] text-center">
                    Position the document in view. The orange border shows what will be captured.
                </p>
            )}
        </div>
    );
}
